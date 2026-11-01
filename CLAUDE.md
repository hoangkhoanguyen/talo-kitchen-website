# CLAUDE.md

## ⚠️ Cờ bật/tắt đơn hàng & món (`is_enabled`) — LUÔN kiểm tra khi động vào đơn hàng

Mọi thay đổi liên quan tới đơn hàng (tạo/sửa đơn, thêm món, hiển thị, tổng tiền, in bill, thông báo đơn mới, báo cáo, lọc/tìm kiếm) **phải xét cờ này** và ghi rõ cách xử lý trong phân tích/thiết kế.

### Cơ chế
- `orders.is_enabled` (bật/tắt cả đơn) và `order_items.is_enabled` (bật/tắt từng món), mặc định `true`.
- Chỉ tài khoản `talo_kitchen` (`isTaloKitchen()` trong `src/lib/order-visibility.ts`) được thấy và bật/tắt. Tài khoản khác **không được biết cơ chế này tồn tại**: không trả field `isEnabled` xuống client (`omitEnabled()` trong `src/services/orders.ts`).
- Tài khoản thường:
  - Đơn bị tắt → ẩn hoàn toàn (danh sách, chi tiết, in bill → 404, popup đơn mới, báo cáo).
  - Món bị tắt → ẩn, và tiền món bị **trừ khỏi tổng đơn lúc hiển thị** (`totalPrice - Σ món tắt`, xem `getDisabledItemTotals`). `orders.total_price` trong DB vẫn là tổng đầy đủ.
- `talo_kitchen`: thấy tất cả, món/đơn tắt hiển thị mờ kèm switch.
- Hàm service nhận tham số `includeDisabled` (= `isTaloKitchen(user)`): `getAdminOrderTable`, `getAdminOrderById`, `getNewOrdersSince`, `checkOrderExists`, `getRevenueReport`.

### Quy tắc khi code
1. Truy vấn đơn/món cho admin → luôn truyền `includeDisabled` theo tài khoản; không tự viết query bỏ qua điều kiện `is_enabled`.
2. Mọi tổng tiền hiển thị cho tài khoản thường phải trừ món tắt. Phí ship (`shipping_fee`) **không** bị ảnh hưởng bởi cờ món.
3. Khi thêm/sửa món của đơn: cập nhật `orders.total_price` trong cùng transaction để cơ chế trừ món tắt và báo cáo doanh thu (`src/services/reports.ts`) vẫn đúng.
4. Thông báo/popup mới: tài khoản thường chỉ nhận sự kiện của đơn đang bật; `talo_kitchen` nhận tất cả.
5. Phía khách (web, không đăng nhập) không bao giờ thấy cờ này; nếu logic phía khách phải chọn một đơn có sẵn (ví dụ gộp món vào bill đang mở) thì phải quyết định rõ cách xử lý đơn đang bị tắt (tránh đẩy món mới vào đơn mà nhân viên tài khoản thường không thấy).
6. In bill (`src/app/(admin)/admin/print/orders/[id]/page.tsx`) lọc theo tài khoản như trang chi tiết.
7. Test: cover cả 2 vai trò (`talo_kitchen` và tài khoản thường) với đơn tắt và món tắt.
