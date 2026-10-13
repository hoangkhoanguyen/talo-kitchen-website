# Admin 2.0: chốt yêu cầu nâng cấp trang admin

> File ghi lại toàn bộ bối cảnh, thảo luận và quyết định của đợt nâng cấp admin này để phiên làm việc sau dùng tiếp.
> **Không chứa báo giá** (báo giá nằm riêng trên Google Drive).
>
> - Cập nhật lần cuối: 2026-10-13 (thêm hạng mục 6)
> - Trạng thái: **ĐANG CHỜ KHÁCH PHẢN HỒI** file chốt yêu cầu. Chưa code dòng nào.

---

## 1. Yêu cầu gốc của khách (nguyên văn)

> Bên phần admin em cần thêm tính năng
>
> - Thêm lựa chọn thanh toán: chuyển khoản/tiền mặt
> - Lọc doanh thu theo ngày
> - Chức năng xem số tổng lượt đặt hàng trong 1 tháng của từng món, xếp theo thứ tự nhiều đến ít, kèm bộ lọc thời gian tùy chọn, kèm 1 cột tổng doanh thu
> - Phần bill thêm chức năng xuất excel nha
> - Thêm 1 mục là người tạo bill

---

## 2. Tài liệu trên Google Drive

Folder: `Team Khoa - Hưng / TALO-Kitchen-Website / Requirements & Planning`
(folder id `12qe5X0sRS6wK7TOHOd8z4euaAlvBtfux`, folder cha `TALO-Kitchen-Website` id `1lBJB4NJiJAc9FZxTAD9eCSAMSsv74JCB`)

| File | Link | Ghi chú |
|---|---|---|
| CHỐT YÊU CẦU ADMIN 2.0 (BẢN KHÁCH HÀNG) | https://docs.google.com/document/d/1jnA15YQHaEQrXzL1c8GYsEneexHmgaJ_rrHQfaibkPo/edit | File gửi khách để chốt. **Đây là bản hiện hành**; các bản trước đã chuyển vào thùng rác. |
| BÁO GIÁ ADMIN 2.0 (BẢN KHÁCH HÀNG) | https://docs.google.com/document/d/17sY2ArU_3C7ZIY2yTyQgST9VRfX-urau25BCX-6mUA8/edit | Báo giá, **không ghi giá ở đây**. Có 6 hạng mục: 5 hạng mục từ mục 1 đến 5 của file này, cộng hạng mục 6 "Nhập nội dung tiếng Việt" (xem mục 5.6). Hạng mục "Xuất bill Excel" và hạng mục 6 được **tặng kèm, không tính phí**. Hạng mục 6 **chỉ có trong file báo giá**, file chốt yêu cầu không hỏi khách về nó. |

**Quyền chia sẻ (kiểm tra 2026-10-13):**
- File chốt yêu cầu: bất kỳ ai có link đều **sửa** được (để khách tick thẳng). Người có quyền sửa chỉ định: `zearth113@gmail.com`, `minhhungtr77@gmail.com`.
- File báo giá: bất kỳ ai có link chỉ **xem** được.
- **Không thể biết ai đã mở file.** Tài khoản Gmail cá nhân không có "Trang tổng quan hoạt động" của Google Docs (chỉ có ở Google Workspace), và người mở link không đăng nhập thì không hiện tên. Chỉ xem được **lịch sử chỉnh sửa** (biểu tượng đồng hồ góc trên bên phải) và có thể bật **Công cụ → Cài đặt thông báo** để nhận email khi có bình luận/chỉnh sửa. Muốn chắc khách đã xem thì nhắn hỏi trực tiếp.
- File chốt yêu cầu có một lần sửa lúc 2026-09-25 16:41 (giờ VN), khoảng 30 phút sau khi tạo, không phải do Claude làm. Chưa rõ ai sửa; xem Lịch sử phiên bản trước khi đọc câu trả lời của khách.

**Khi khách phản hồi:** đọc lại file chốt yêu cầu (Drive `read_file_content`, id `1jnA15YQHaEQrXzL1c8GYsEneexHmgaJ_rrHQfaibkPo`), so với bảng quyết định ở mục 4, rồi cập nhật mục 4 và mục 9 của file này.

### Quy ước khi làm tài liệu cho khách này
- Khách thân như em của chủ dự án: **xưng "anh", gọi khách là "em"**, không chào hỏi trang trọng, tiêu đề ngắn gọn.
- File chốt yêu cầu được thiết kế để **khách nhập liệu ít nhất có thể**:
  - Câu nào cũng có sẵn đáp án ☐/☑, phương án gợi ý đánh dấu ⭐ và **đã tick sẵn ☑**.
  - **Câu nào khách không sửa thì hiểu là đồng ý theo gợi ý ⭐.** Khách chỉ tick lại hoặc nhắn số câu khi muốn đổi (ví dụ "câu 2.1 chọn B").
  - Bảng tóm tắt ở đầu file có cột "Lựa chọn khác (xem câu)", để khách không cần đọc phần chi tiết bên dưới mà vẫn thấy hết các phương án.
- Tránh emoji 4 byte (ví dụ 👉 🎁) khi tạo Google Doc từ HTML qua Drive vì bị lỗi font thành ký tự rác. Các ký tự ⭐ ✅ ☐ ☑ ⚠️ ➡️ hiển thị bình thường.
- Connector **Google Docs** đã được bật (từ 2026-10-13), nên sửa file có sẵn bằng `mcp__Google_Docs__update_doc` để giữ nguyên link. Đừng tạo lại file.

---

## 3. Hiện trạng code liên quan (khảo sát ngày 2026-09-25)

### Đơn hàng & thanh toán
- `src/db/schemas/orders/orders.ts`: bảng `orders` đã có cột `paymentMethod varchar(50) NOT NULL`, `shippingFee`, `totalPrice`, `status`, `orderType`, `createdAt` (timestamptz).
- `src/types/orders.ts`: `enum PaymentMethod { cash_on_delivery }`. Chỉ có 1 giá trị.
- `src/constants/orders.ts`: `ORDER_PAYMENT_METHOD` chỉ có `cash_on_delivery` → "Cash on Delivery".
- Checkout web:
  - `src/validations/checkout.ts`: `paymentMethod: z.enum(["cash"])`.
  - `src/components/web/features/checkout/CheckoutForm.tsx`: chỉ có 1 `RadioItem` "cash", label `t("form.onlyCash")`.
  - `CheckoutProvider.tsx`: mặc định `paymentMethod: "cash"`.
  - ⚠️ Giá trị lưu từ web là `"cash"`, còn enum trong admin là `cash_on_delivery`, nên cần chuẩn hóa khi làm mục 1.
  - Text checkout đã có i18n (`messages/en.json`, `messages/vi.json`). Thêm lựa chọn mới thì phải thêm key cho **cả 2 ngôn ngữ**.
- `src/components/admin/features/orders/OrderSummary.tsx`: hiển thị `paymentMethod`.

### Trạng thái đơn & lịch sử
- `OrderStatus`: `pending`, `processing`, `completed`, `cancelled`.
- `src/db/schemas/orders/order-status-history.ts`: **đã có bảng** `order_status_history` (`orderId`, `previousStatus`, `newStatus`, `createdAt`). **Chưa có cột người đổi.**
- `src/services/orders.ts` → `updateOrderStatus(orderId, newStatus, previousStatus)` cập nhật đơn và insert history trong 1 transaction. Được gọi từ `src/actions/admin/order.ts` → `updateOrderStatusAction`.
- UI timeline trạng thái: `src/components/admin/features/orders/OrderStatuses.tsx`.

### Danh sách đơn / bộ lọc
- `src/app/(admin)/admin/api/orders/route.ts` đã nhận `start_date`, `end_date`, `status[]`, `order_type[]`. Service `getAdminOrders` trong `src/services/orders.ts` (khoảng dòng 230) đã lọc theo ngày.
- `src/components/admin/features/orders/OrderFilter.tsx`: UI chỉ có checkbox Status và Shipping Method. **Chưa có ô chọn ngày** (dù state đã có `start_date`/`end_date`) và chưa lọc theo thanh toán.

### Bill
- In bill: `PrintBillButton.tsx` mở iframe ẩn tới `/admin/print/orders/[id]` (`src/app/(admin)/admin/print/orders/[id]/page.tsx`), render `BillReceipt.tsx` khổ 80mm.
- `BillData` gồm: `code`, `dateTime`, `items[]` (name, qty, unitPrice, amount, addons[]), `total`. Bill **không** in tên/SĐT khách, địa chỉ, phí ship, phương thức thanh toán. Lưu ý: `total` trên bill = `totalPrice - shippingFee` (commit 7beb777).
- Thông tin quán hardcode trong `BillReceipt.tsx` (`RESTAURANT`), QR review Google Maps ở `/public/bill-review-qr.png`.
- Tài liệu cũ về in bill: `docs/print-bill/PLAN.md`.
- `package.json` chưa có thư viện Excel nào.

### Món / doanh thu theo món
- `order_items`: `productId`, `productName`, `price`, `quantity`, `totalPrice` (= quantity × price + tổng addon), `note`.
- `order_item_addons`: `addonId`, `addonName`, `price`, `quantity`, `totalPrice`.
- Đủ dữ liệu để tính thống kê món mà không cần thêm bảng.

### Người dùng / phân quyền
- `src/db/schemas/auth/users.ts`: có `role varchar(50) default "user"` (comment: admin, manager, user), `isActive`, `firstName`, `lastName`.
- JWT access token (`src/lib/auth.ts`) đã mang `role`, nhưng **không thấy action nào kiểm tra role**: mọi tài khoản đăng nhập đều toàn quyền.
- `src/services/auth.ts` → `registerUser` gán cứng `role: "admin"`.
- ⚠️ Trang `/admin/register` ("Tạo tài khoản nhân viên mới") được `src/proxy.ts` cho qua không cần đăng nhập. Đây có thể là lỗ hổng: ai cũng tự tạo được tài khoản admin. Nên xử lý khi làm mục 5.
- **Chưa có trang quản lý nhân viên** trong admin. Đơn hàng đều do khách tự đặt trên web; admin không tạo đơn.

### Khác
- Dashboard (`src/app/(admin)/admin/(dashboard)/dashboard/page.tsx`) chỉ redirect sang trang Products. Sidebar (`src/components/admin/shared/sidebar/Menu.tsx`) có mục Dashboard đang comment, có thể dùng cho trang Báo cáo.
- Giờ hiển thị: đã có helper giờ VN `formatDateVN` (`src/lib/date.ts`). Báo cáo theo ngày phải cắt ngày theo **Asia/Ho_Chi_Minh (UTC+7)**.

---

## 4. Bảng quyết định (mặc định = gợi ý ⭐, chờ khách xác nhận)

Câu nào khách không sửa thì giữ gợi ý ⭐. Cột "Khách chốt" điền khi có phản hồi.

### Mục 1: Thanh toán (Tiền mặt / Chuyển khoản)
| Câu | Nội dung | Gợi ý ⭐ (mặc định) | Phương án khác | Khách chốt |
|---|---|---|---|---|
| 1.1 | Ai chọn cách thanh toán | **Khách chọn lúc checkout trên web, nhân viên sửa lại được trong admin** | B. Chỉ khách chọn, NV không sửa · C. Khách không chọn, NV chọn trong admin | |
| 1.2 | Đơn chuyển khoản có đánh dấu "Đã nhận tiền" không | **Có**, NV tick sau khi kiểm tra tài khoản (để đối soát) | B. Không, đơn "Hoàn thành" = đã thu | |
| 1.3 | Một đơn trả tách tiền mặt + chuyển khoản | **Không** | B. Có, ghi số tiền từng phần | |
| 1.4 | Đơn cũ | **Mặc định "Tiền mặt"** | B. "Chưa xác định" | |

**ĐÃ LOẠI KHỎI PHẠM VI (chủ dự án quyết định):** không hiện QR ngân hàng hay số tài khoản ở trang "Đặt hàng thành công", không in QR chuyển khoản lên bill. Không đề cập trong tài liệu với khách. Trang đặt hàng thành công giữ nguyên như hiện tại.

### Mục 2: Doanh thu theo ngày
| Câu | Nội dung | Gợi ý ⭐ | Phương án khác | Khách chốt |
|---|---|---|---|---|
| 2.1 | Tính từ đơn nào | **Chỉ đơn "Hoàn thành"** (luôn loại đơn hủy) | B. Hoàn thành + Đang xử lý | |
| 2.2 | Phí ship | **Có tính, tách cột riêng** | B. Không tính | |
| 2.3 | Mốc ngày của đơn | **Ngày khách đặt** (`createdAt`) | B. Ngày hoàn thành | |
| 2.4 | Số liệu hiển thị | Mặc định có: Tổng doanh thu, Số đơn, Doanh thu từng ngày. **⭐ Thêm: Tách theo Tiền mặt / Chuyển khoản** | Tách theo Giao hàng/Lấy tại quán · Trung bình mỗi đơn · Biểu đồ | |
| 2.5 | Chọn nhanh thời gian | **Có: Hôm nay, Hôm qua, 7 ngày qua, Tháng này, Tháng trước + tự chọn ngày** | B. Chỉ tự chọn ngày | |

### Mục 3: Thống kê lượt đặt từng món
| Câu | Nội dung | Gợi ý ⭐ | Phương án khác | Khách chốt |
|---|---|---|---|---|
| 3.1 | Cách đếm "lượt đặt" | **Hiện cả 2 cột: "Số phần bán" (SUM quantity) và "Số đơn" (COUNT DISTINCT order), xếp theo số phần bán giảm dần** | B. Chỉ số phần · C. Chỉ số đơn | |
| 3.2 | Doanh thu món có gồm topping | **Có** (dùng `order_items.totalPrice`) | B. Chỉ giá món chính | |
| 3.3 | Bảng xếp hạng riêng cho topping | **Chưa cần** | A. Có | |
| 3.4 | Lọc theo danh mục món | **Có** | B. Không | |
| 3.5 | Hiện món không bán được | **Có, xếp cuối bảng** | B. Không | |
| 3.6 | Quy tắc tính đơn giống 2.1 | **Giống**, để hai bảng khớp số | B. Khác | |
| 3.7 | Xuất trang Báo cáo (mục 2 + 3) ra Excel | **Có** | B. Không | |

Mặc định khoảng thời gian: **tháng hiện tại**, đổi được sang khoảng bất kỳ. Trang Báo cáo dùng chung bộ lọc ngày cho mục 2 và 3.

### Mục 4: Xuất bill ra Excel
Đã làm rõ với chủ dự án: **xuất cho đơn đang chọn**, kiểu thay vì in bill ra giấy thì render bill ra file Excel. Không phải xuất danh sách nhiều đơn.

| Câu | Nội dung | Gợi ý ⭐ | Phương án khác | Khách chốt |
|---|---|---|---|---|
| 4.1 | Mục đích | **Lưu trữ / đối chiếu → Excel** | B. Gửi khách → PDF · C. Cả Excel lẫn PDF | |
| 4.2 | Thông tin trong file | Mặc định: toàn bộ nội dung bill hiện tại. **⭐ Thêm: tên + SĐT khách, hình thức nhận hàng + địa chỉ, phí ship, cách thanh toán, người tạo bill** | Ghi chú đơn (không tick sẵn) | |
| 4.3 | Chọn nhiều đơn xuất 1 lần | **Không, mỗi lần 1 đơn** | B. Gộp 1 file mỗi đơn 1 sheet · C. Mỗi đơn 1 file | |
| 4.4 | Vị trí nút | **Trang chi tiết đơn, cạnh nút "In bill"** | B. Thêm trên từng dòng danh sách đơn | |
| 4.5 | Logo + QR đánh giá Google trong file | **Không**, chỉ chữ và số | A. Có | |

Gợi ý kỹ thuật: số tiền để dạng number (không phải text) để cộng trừ được, addon thụt dưới món chính, tên file dạng `Bill_<mã đơn>_<ngày>.xlsx`.

### Mục 5: Người tạo bill
| Câu | Nội dung | Gợi ý ⭐ | Phương án khác | Khách chốt |
|---|---|---|---|---|
| 5.1 | "Người tạo bill" là ai | **Nhân viên xác nhận / xử lý đơn** | B. NV bấm in bill · C. ⚠️ NV tạo đơn tại quầy (tính năng mới "Tạo đơn tại quầy", báo giá riêng) | |
| 5.2 | NV có tài khoản riêng chưa | **(Giả định) Đang dùng chung → cần tạo riêng cho từng người**; khách gửi danh sách tên NV | A. Đã có riêng | |
| 5.3 | Tên người tạo hiện ở đâu | **In trên bill ("Thu ngân: …"), trang chi tiết đơn, file Excel** | Thêm cột ở danh sách đơn (không tick sẵn) | |
| 5.4 | Lưu lịch sử "ai đổi trạng thái, lúc mấy giờ" | **Có** | B. Không | |

Ghi chú về 5.4: chủ dự án từng băn khoăn câu này có làm phình phạm vi không, vì khách không yêu cầu. Kết luận là **giữ lại**, vì:
- Không cần bảng mới, chỉ thêm cột `changed_by` vào `order_status_history` có sẵn.
- Cột này **bắt buộc phải có** để làm 5.1 A (biết ai chuyển đơn pending → processing).
- Phần làm thêm chỉ là hiển thị tên người đổi trên timeline `OrderStatuses.tsx`.

### Mục 6: Câu hỏi chung
| Câu | Nội dung | Gợi ý ⭐ | Phương án khác | Khách chốt |
|---|---|---|---|---|
| 6.1 | Ai được xem Báo cáo doanh thu | **Chỉ chủ quán / quản lý** | B. Tất cả NV | |
| 6.2 | Thứ tự triển khai | **Thanh toán → Người tạo bill → Xuất Excel → Doanh thu → Thống kê món** (mục đầu tạo dữ liệu cho mục sau) | B. Khách tự chọn | |

---

## 5. Phạm vi dự kiến nếu khách chốt toàn bộ gợi ý ⭐

1. **Thanh toán**
   - Thêm `bank_transfer` vào enum; chuẩn hóa giá trị cũ `"cash"` / `cash_on_delivery`.
   - Checkout web: thêm radio Chuyển khoản, cập nhật zod và i18n en/vi.
   - Admin: sửa phương thức thanh toán trong chi tiết đơn.
   - Cột mới đánh dấu đã nhận tiền (ví dụ `paid_at timestamptz null` hoặc `is_paid boolean`), có nút tick trong admin.
   - Hiện phương thức thanh toán trên bill; thêm lọc theo thanh toán ở `OrderFilter`.
   - Migration: đơn cũ → tiền mặt.
2. **Người tạo bill**
   - Tài khoản riêng cho từng NV, phân quyền role (owner/manager vs staff).
   - Thêm `changed_by` (FK users) vào `order_status_history`, và có thể thêm `confirmed_by` trên `orders` cho dễ truy vấn.
   - `updateOrderStatusAction` lấy userId từ access token và truyền xuống service.
   - Hiện "Thu ngân: …" trên bill và chi tiết đơn, tên người đổi trên timeline.
   - Xử lý trang `/admin/register` đang public.
   - Chưa rõ: khách có cần **trang quản lý nhân viên** (tự thêm/khóa tài khoản) không. Nếu không thì dev tạo sẵn tài khoản.
3. **Xuất bill Excel**: thêm thư viện (ví dụ `exceljs`), nút cạnh "In bill", layout theo bill và thêm các thông tin ở 4.2.
4. **Báo cáo doanh thu**
   - Trang mới (có thể dùng làm Dashboard, bật lại mục Dashboard trong sidebar).
   - Lọc ngày theo giờ VN, nút chọn nhanh.
   - Tổng doanh thu, số đơn, bảng theo ngày, tách theo phương thức thanh toán, cột phí ship.
   - Xuất Excel; chặn role không phải quản lý.
5. **Thống kê món**: nằm trong trang Báo cáo, aggregate `order_items` join `orders` (status completed, theo khoảng ngày), lọc danh mục, gồm món 0 lượt (LEFT JOIN products), xuất Excel.
6. **Nhập nội dung tiếng Việt cho website** (hạng mục tặng kèm, không tính phí; **chỉ nằm trong báo giá**, không có câu hỏi nào trong file chốt yêu cầu)
   - Bối cảnh: đợt đa ngôn ngữ trước đã dựng **cơ chế** (routing `/en` `/vi`, bảng dịch, form admin nhập theo từng ngôn ngữ) và để **khách tự nhập** nội dung tiếng Việt. Đợt này **chủ dự án tự nhập sẵn luôn**; khách chỉ cần **xem lại và sửa nếu cần** vì họ bận.
   - Tình trạng hiện tại: `messages/vi.json` (chuỗi tĩnh giao diện) đã đủ key, đối xứng với `en.json` (217 dòng mỗi file). Nội dung **trong DB** thì mới có bản `en`: seed ban đầu (`scripts/seed-entities-i18n.ts`) chỉ tạo dòng `locale = 'en'`, còn UI config có cấu trúc `{ en: "...", vi: "" }` với `vi` để trống. Việc cần làm là điền phần `vi`.
   - Nội dung cần dịch (không dịch slug, giá, thứ tự, ảnh, số, boolean):
     - Sản phẩm (`product_translations`): `title`, `description`, `subDescription`, `allergenInfo`.
     - Danh mục (`product_category_translations`) và addon/topping (`product_addon_translations`): các cột chữ tương ứng.
     - UI config (bảng `configs`, `config_type = 'ui'`): các field có `localized: true` (hero, our story, gallery/reviews/contact text, menu page labels, SEO title/description…). `title`/`sub_title` dạng mảng hiệu ứng xoay chữ **không** thuộc i18n.
   - Cần thống nhất trước khi làm:
     - **Nhập bằng cách nào**: qua form admin có sẵn (có badge "chưa dịch") hay viết script ghi thẳng DB. Script nhanh hơn với số lượng lớn nhưng phải **idempotent và không ghi đè** bản `vi` mà khách đã sửa.
     - **Nhập ở môi trường nào**: DB production (`prod` / `prod_v2` chọn bằng `DB_SCHEMA`) hay staging rồi mới đưa lên. Nên backup trước khi ghi.
     - **Quy trình khách review**: khách xem trực tiếp trên web `/vi` hay nhận danh sách nội dung để duyệt. Chưa có kết luận.
     - **Văn phong**: tên món, thuật ngữ ẩm thực, giọng điệu quán. Nên hỏi khách có tên món nào muốn giữ nguyên tiếng Anh không.
     - **Phạm vi trang**: chưa có danh sách chốt các trang cần dịch hết hay chỉ phần chính.
   - Sau khi nhập: kiểm tra không còn field `vi` trống (script quét giống bước "fallback sweep" ở sprint-4-i18n-polish), mở `/vi` kiểm tra từng trang, kiểm tra cache theo locale đã được revalidate.

---

## 6. Các phương án ngoài gợi ý (báo giá riêng nếu khách chọn)

- Tạo đơn tại quầy (5.1 C): gần như một POS nhỏ, khối lượng lớn.
- Xuất PDF thay cho Excel hoặc kèm Excel (4.1 B/C).
- Chọn nhiều đơn xuất cùng lúc (4.3 B/C).
- Biểu đồ ở trang báo cáo (2.4).
- Trang quản lý nhân viên tự thêm/khóa tài khoản (nếu khách cần).

---

## 7. Việc khách cần gửi

- Phản hồi file chốt yêu cầu (chỉ những câu muốn đổi).
- Danh sách tên nhân viên để tạo tài khoản (nếu giữ 5.2 B).

---

## 8. Lịch sử thảo luận chính

- **2026-09-25**: nhận yêu cầu, khảo sát code, thảo luận từng mục.
  - Mục 4: làm rõ là xuất **1 đơn đang chọn** ra Excel thay cho in giấy.
  - Mục 1: ban đầu gợi ý NV chọn, sau đổi thành **khách chọn lúc checkout**.
  - Bảng tóm tắt thêm cột "Lựa chọn khác" vì khách thường chỉ đọc bảng tóm tắt.
  - Đổi giọng văn sang anh/em, bỏ chào hỏi.
  - Đổi cơ chế: không sửa nghĩa là đồng ý, tick sẵn ☑ các gợi ý ⭐.
  - Bỏ hoàn toàn phần QR ngân hàng.
  - Rà soát tổng thể: đưa 3.7, 6.1, 2.2 lên bảng tóm tắt; đổi "(có sẵn)" thành "(mặc định có)"; ghi rõ QR ở mục 4 là QR đánh giá Google.
  - Thảo luận 5.4: giữ lại (xem lý do ở mục 4).
- **2026-10-13**: làm báo giá (file riêng trên Drive), bật connector Google Docs.
  - Thêm **hạng mục 6**: chủ dự án tự nhập nội dung tiếng Việt, khách chỉ review và sửa; tặng kèm, không tính phí, để khuyến khích khách. Chỉ ghi vào báo giá, không thêm vào file chốt yêu cầu.
  - Hạng mục "Xuất bill Excel" cũng được tặng. Bỏ dòng "test/deploy" riêng khỏi báo giá vì coi là mặc định.
  - Tìm hiểu chuyện xem ai đã mở file: không làm được với Gmail cá nhân (chi tiết ở mục 2).
  - Giải thích với chủ dự án cách app chạy trên Vercel (Next.js trên Vercel Functions, DB Postgres trên Supabase, ảnh trên Cloudflare R2). Kết luận: **không cần ignore folder `docs`**, vì folder này không đi vào bản build. Chỉ có tùy chọn `ignoreCommand` trong `vercel.json` để commit chỉ sửa docs không kích hoạt build lại; chưa làm.

---

## 9. Bước tiếp theo

1. Chờ khách phản hồi file chốt yêu cầu, rồi điền cột "Khách chốt" ở mục 4.
2. Nếu khách đổi sang phương án ngoài gợi ý (mục 6), báo chủ dự án để báo giá bổ sung.
3. Hạng mục 6: thống nhất 4 điểm cần chốt ở mục 5.6 (cách nhập, môi trường, quy trình review, văn phong) rồi mới bắt tay làm. Việc này không phụ thuộc phản hồi của khách ở file chốt yêu cầu nên có thể làm song song, nhưng nên làm **sau khi** các mục 1 đến 5 xong nếu có thêm field/nội dung cần dịch (ví dụ text checkout cho phương thức thanh toán mới).
4. Chốt xong thì tạo sprint mới trong `.sdlc/` (ví dụ `/sdlc:sprint-plan v2` hoặc `/sdlc:replan`), dùng file này làm business doc đầu vào, triển khai theo thứ tự ở 6.2.
