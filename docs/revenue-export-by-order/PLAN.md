# Báo cáo doanh thu — Xuất Excel theo đơn (Plan)

> Trạng thái: **plan, CHƯA code** — chờ duyệt.

## 1. Yêu cầu

Ở trang **Báo cáo doanh thu theo ngày** (`/admin/reports`), khi bấm Xuất Excel, user chọn 1 trong 2:
1. **Theo ngày** — như hiện tại (mỗi dòng 1 ngày + bảng theo phương thức thanh toán).
2. **Theo đơn** — mỗi dòng 1 đơn, **bắt buộc có cột Ghi chú nội bộ** (`orders.internal_note`).

## 2. Hiện trạng

| Chỗ | Hiện tại |
|---|---|
| Nút xuất | `src/components/admin/features/reports/RevenueReport.tsx` — 1 link tới `revenueReportExportApi(params)` |
| API | `src/app/(admin)/admin/api/reports/revenue/export/route.ts` — `withAuth`, `parseReportRange`, `getRevenueReport({ includeDisabled })` |
| Truy vấn | `src/services/reports.ts` — `buildOrdersCte` (đơn `completed`, lọc theo ngày giờ VN, trừ món tắt, lọc đơn tắt theo tài khoản) |
| Excel | `src/services/reports-excel.ts` — `buildRevenueWorkbook` (exceljs, `safeText` chống formula injection) |
| Giới hạn | Khoảng ngày tối đa `REPORT_MAX_DAYS = 366` |

## 3. Giải pháp

### 3.1 API
- Thêm query param `mode`: `daily` (mặc định, giữ nguyên hành vi cũ) | `orders`. Giá trị lạ → 400.
- `mode=orders` → gọi service mới `getRevenueOrders({ start, end, includeDisabled })` → `buildRevenueOrdersWorkbook`.
- Tên file: `bao-cao-doanh-thu-theo-don_<start>_<end>.xlsx`.

### 3.2 Service `getRevenueOrders`
- **Dùng lại `buildOrdersCte`** → cùng tập đơn, cùng cách tính doanh thu với màn hình & export theo ngày ⇒ tổng của 2 file luôn khớp nhau.
- Mở rộng CTE trả thêm cột cần cho từng đơn (join `orders` theo `id`): `code`, `created_at`, `first_name`, `last_name`, `phone`, `order_type_label`, `payment_method`, `internal_note` (+ `is_enabled` chỉ khi `includeDisabled`).
- Sắp xếp `created_at ASC`.

### 3.3 Nội dung file "Theo đơn"
Phần đầu giống file hiện tại: Khoảng ngày, Xuất lúc, Tổng doanh thu, Số đơn, Tổng phí ship.

Bảng chi tiết, mỗi dòng 1 đơn:

| Cột | Nguồn | Ghi chú |
|---|---|---|
| Ngày giờ | `created_at` | Giờ VN `DD/MM/YYYY HH:mm` (`formatDateVN`) |
| Mã đơn | `code` | |
| Khách hàng | `first_name + last_name` | |
| SĐT | `phone` | Ghi dạng text để Excel không mất số 0 đầu |
| Loại đơn | `order_type_label` | |
| Thanh toán | `payment_method` → nhãn | Dùng nhãn như bảng theo phương thức |
| Phí ship | `shipping_fee` | |
| Doanh thu | như `buildOrdersCte` | Đã trừ món tắt với tài khoản thường |
| **Ghi chú nội bộ** | `internal_note` | Wrap text, giữ xuống dòng; trống → để trống |

Dòng cuối: **Tổng** (phí ship, doanh thu) = khớp phần đầu.

Mọi ô text đi qua `safeText` (ghi chú nội bộ là input tự do → chống formula injection `=`, `+`, `-`, `@`).

### 3.4 Cờ `is_enabled` (theo CLAUDE.md)
- `includeDisabled` lấy từ token (`isTaloKitchen(payload.username)`), không nhận từ query — như export hiện tại.
- **Tài khoản thường**: không có đơn tắt; doanh thu mỗi đơn đã trừ món tắt; **không có cột/trạng thái nào lộ cơ chế bật/tắt**.
- **`talo_kitchen`**: thấy cả đơn tắt, doanh thu đầy đủ; thêm cột **"Đang tắt"** (Có/để trống) chỉ ở file của tài khoản này để phân biệt (cần xác nhận — mục 6).
- Phí ship không bị ảnh hưởng bởi cờ món.

### 3.5 UI
- Thay nút "Xuất Excel" bằng dropdown 2 lựa chọn: **"Xuất theo ngày"**, **"Xuất theo đơn"** (mỗi lựa chọn là 1 link tải với `mode` tương ứng, giữ nguyên khoảng ngày đang lọc).
- Không đổi phần hiển thị trên màn hình.

### 3.6 Vercel
- Vẫn là route handler `runtime = "nodejs"`, `force-dynamic`, `Cache-Control: no-store` — không cache.
- Khối lượng: tối đa 366 ngày × số đơn/ngày của quán (vài trăm–vài nghìn dòng) → exceljs tạo trong bộ nhớ vẫn nhẹ, nằm trong giới hạn thời gian/bộ nhớ function mặc định. Không cần streaming.

## 4. Task

| # | Task |
|---|---|
| T1 | `getRevenueOrders` trong `src/services/reports.ts` (dùng lại `buildOrdersCte`) + type trong `src/types/reports.ts` |
| T2 | `buildRevenueOrdersWorkbook` trong `src/services/reports-excel.ts` |
| T3 | API: param `mode` + validate, chọn workbook, tên file |
| T4 | UI: dropdown 2 lựa chọn ở `RevenueReport.tsx`, route helper nhận `mode` |
| T5 | Test |

## 5. Test
- Unit: workbook theo đơn — đúng cột, tổng khớp, ghi chú nhiều dòng, ghi chú bắt đầu bằng `=` bị escape, SĐT giữ số 0.
- Service/API, **cả 2 vai trò**:
  - Tài khoản thường: đơn tắt không xuất hiện; đơn có món tắt → doanh thu đã trừ; không có cột "Đang tắt".
  - `talo_kitchen`: có đơn tắt, doanh thu đầy đủ, có cột "Đang tắt".
- Tổng doanh thu file theo đơn = file theo ngày = màn hình, cùng khoảng ngày.
- Đơn tạo 23:30 giờ VN rơi đúng ngày VN (không lệch UTC).
- `mode` lạ → 400; không truyền `mode` → file theo ngày như cũ.

## 6. Câu hỏi mở
1. Chỉ xuất đơn **Hoàn thành** (giống báo cáo hiện tại) hay cả đơn khác? → Đề xuất: chỉ Hoàn thành để khớp số.
2. Có cần cột danh sách món trong đơn không? → Đề xuất: không (giữ 1 dòng gọn), cần thì làm thêm.
3. File của `talo_kitchen` có cột "Đang tắt" không? → Đề xuất: có.
