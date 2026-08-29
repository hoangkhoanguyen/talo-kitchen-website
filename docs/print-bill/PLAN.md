# Kế hoạch: Tích hợp in bill máy Xprinter XP-Q80W (K80)

## 1. Bối cảnh & kết luận
- App: **Next.js 16** (web + admin dashboard), dữ liệu order lưu Postgres (Drizzle).
- Máy in: **Xprinter XP-Q80W / K80** — máy in nhiệt khổ **80mm**, hỗ trợ **USB + WiFi/LAN**, chuẩn lệnh **ESC/POS**, có **auto-cut** (tự cắt giấy).
- **Kết luận: Tích hợp được**, không cần đổi DB schema. `AdminOrderDetails` đã đủ dữ liệu để in.

## 2. Thách thức cốt lõi
App là **web app** → trình duyệt KHÔNG gửi lệnh ESC/POS trực tiếp qua USB một cách ổn định.
Máy dùng **cả USB lẫn WiFi**, nên kiến trúc phải xử lý được cả hai. Có 2 hướng:

| Hướng | USB | WiFi | Auto-cut | Độ ổn định |
|---|---|---|---|---|
| A. Print-agent tại quầy (khuyến nghị) | ✅ | ✅ | ✅ | Cao |
| B. Server Next.js in thẳng qua WiFi | ❌ | ✅ | ✅ | Cao (chỉ WiFi) |
| C. `window.print()` HTML 80mm | ✅* | ✅* | ⚠️ hạn chế | Trung bình |

\* Hướng C in qua driver OS, cần cấu hình máy in mặc định + CSS khổ 80mm; khó auto-cut/mở két.

## 3. Kiến trúc đề xuất — Print Agent (bao cả USB + WiFi)

```
[Admin Web/Next.js]                [Máy quầy - Print Agent (Node)]        [Xprinter]
  Nút "In bill"                         HTTP POST /print                    USB hoặc
     │  gọi API                         build ESC/POS  ───────────────►     WiFi:9100
     ▼                                       │
  API route Next.js  ── trả JSON order ──►   │ node-thermal-printer
  /admin/api/orders/[id]/print               │  - USB: interface 'printer:...' hoặc 'usb'
                                             │  - WiFi: interface 'tcp://192.168.x.x:9100'
```

- **Print Agent** là một service Node nhỏ (Express) chạy trên máy tính ở quầy (nơi cắm USB).
- Agent đọc cấu hình để biết in qua **USB** hay **WiFi** (đổi được không cần sửa app).
- Nếu sau này chỉ dùng WiFi, có thể bỏ agent và cho Next.js server in thẳng `tcp://IP:9100`.

## 4. Thư viện
- [`node-thermal-printer`](https://www.npmjs.com/package/node-thermal-printer) — hỗ trợ ESC/POS, khổ 80mm, `cut()`, in QR/logo, canh cột. Chạy phía Node (agent hoặc server), KHÔNG chạy trong browser.
- Font tiếng Việt: dùng chế độ in dạng **ảnh (bitmap)** cho phần có dấu, hoặc bảng mã máy in hỗ trợ; cần test thực tế.

## 5. Các hạng mục công việc

### 5.1. Backend app (Next.js)
- [ ] API route: `src/app/(admin)/admin/api/orders/[id]/print/route.ts`
  - Lấy `AdminOrderDetails` theo id (tái dùng service order sẵn có).
  - Trả JSON đã chuẩn hoá cho agent (hoặc build ESC/POS thẳng nếu đi hướng B).
- [ ] Hàm build nội dung bill dùng chung: header (tên nhà hàng/logo), mã đơn, thời gian, danh sách món + addon + số lượng + đơn giá, tạm tính, phí ship, tổng, phương thức thanh toán, ghi chú, QR (tùy chọn), lời cảm ơn, lệnh `cut`.

### 5.2. Print Agent (service Node riêng, thư mục `print-agent/`)
- [ ] Express server: `POST /print` nhận order JSON → build ESC/POS → in.
- [ ] Cấu hình `.env`: `PRINTER_TYPE=usb|network`, `PRINTER_IP`, `PRINTER_PORT=9100`, `PRINTER_USB_PATH`.
- [ ] Xử lý lỗi: máy in offline/hết giấy → trả lỗi rõ ràng cho app.
- [ ] Chạy nền tự khởi động cùng máy (pm2 / Windows service).

### 5.3. Frontend (Admin)
- [ ] Nút **"In bill"** ở trang chi tiết đơn: `src/app/(admin)/admin/(dashboard)/orders/[id]/page.tsx`.
- [ ] Gọi API/agent, hiển thị toast thành công/lỗi (đã có `sonner`).
- [ ] (Tùy chọn) nút "In lại", "In phiếu bếp" (bản rút gọn cho bếp).

### 5.4. Cấu hình & vận hành
- [ ] Đặt **IP tĩnh** cho máy in nếu dùng WiFi (vd `192.168.1.50`).
- [ ] Cài driver Xprinter trên máy quầy nếu dùng USB.
- [ ] Tài liệu hướng dẫn cắm máy + khởi động agent.

## 6. Rủi ro cần lưu ý
1. **Tiếng Việt có dấu**: máy in nhiệt hay lỗi font → nhiều khả năng phải in phần có dấu dạng bitmap. Cần test sớm.
2. **Web không in USB trực tiếp**: bắt buộc có agent hoặc chuyển sang WiFi:9100. Đây là lý do chọn kiến trúc agent.
3. **Khổ giấy 80mm**: canh cột (tên món / SL / giá) cần đúng số ký tự mỗi dòng (~48 ký tự font thường).
4. **Máy in offline/hết giấy**: cần retry + báo lỗi, tránh mất bill.

## 7. Lộ trình đề xuất (phân giai đoạn)
- **Giai đoạn 1 (nhanh, dùng ngay)**: bản in HTML 80mm qua `window.print()` để có bill in được liền.
- **Giai đoạn 2 (chuẩn POS)**: Print Agent + ESC/POS, auto-cut, hỗ trợ cả USB & WiFi.
- **Giai đoạn 3 (mở rộng)**: phiếu bếp riêng, in lại, mở két tiền, logo/QR thanh toán.

## 8. Ước lượng
- Giai đoạn 1: ~0.5 ngày.
- Giai đoạn 2: ~1.5–2.5 ngày (gồm test font tiếng Việt & canh khổ giấy trên máy thật).
