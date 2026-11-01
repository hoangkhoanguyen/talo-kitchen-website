# CLAUDE.md

## 🚀 Môi trường deploy: Vercel (serverless)

App (Next.js) chạy trên **Vercel**, DB Postgres (Supabase). Mọi thiết kế phải chạy đúng trong môi trường này:

- **Timezone server = UTC.** Không dùng `new Date().getHours()/getDay()`, `moment()` local… để ra quyết định nghiệp vụ theo giờ. Luôn quy về giờ VN (UTC+7, không DST) bằng helper trong `src/lib/date.ts` (`formatDateVN`, `todayVN`, …). Client (trình duyệt) có thể ở tz bất kỳ → logic theo giờ phải lấy **server làm nguồn sự thật**.
- **Không có tiến trình chạy nền / state trong RAM.** Mỗi request có thể rơi vào instance khác, instance bị tắt bất kỳ lúc nào → không `setInterval`, không cache biến global làm nguồn dữ liệu, không job chạy ngầm sau khi trả response.
- **Ưu tiên tính toán theo thời điểm request thay vì job hẹn giờ.** Vercel Cron có giới hạn (gói Hobby chỉ chạy tối đa 1 lần/ngày, giờ không chính xác) và có thể fail im lặng → không dùng cron để "bật/tắt" dữ liệu theo giờ (ví dụ đổi giá), hãy tính trên mỗi request.
- **Data Cache (`unstable_cache` trong `src/lib/cache.ts`) dùng chung giữa các instance, tồn tại qua nhiều request (có thể qua cả các lần deploy)**; mặc định không tự hết hạn, chỉ xoá qua tag (`src/lib/revalidate.ts`). Không đưa dữ liệu phụ thuộc thời gian (giá theo giờ, "đang mở cửa"…) vào cache — cache dữ liệu gốc, áp logic thời gian sau khi đọc cache.
- **Env vars** cấu hình trên Vercel Dashboard (Production/Preview riêng). `DB_SCHEMA` quyết định schema Postgres (`src/db/schema.ts`), mặc định `prod`.
- **Rollback** = Vercel Instant Rollback (xem `deploy/DEPLOY_GUIDE.md`). Migration DB phải tương thích ngược với code cũ (chỉ thêm cột/bảng, có default) để rollback code không vỡ.

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

## 💰 Giá theo khung giờ (Happy Hour)

- **Đang TẮT** bằng cờ `FEATURES.PRICE_PROGRAMS` (`src/constants/features.ts`): ẩn menu/trang admin (404), chặn action, không áp giá ở web/đơn. Bật lại: đổi thành `true` rồi deploy. Code mới đụng tới tính năng này phải tôn trọng cờ.

- `products.price` là **giá gốc**. Giá bán thực tế = giá hiệu lực tính lúc request: `getEffectivePrice` / `withEffectivePrice` (`src/lib/pricing.ts`) với cấu hình từ `src/services/price-programs.ts`. Addon không áp giá khung giờ.
- Mọi chỗ hiển thị giá cho khách / tạo món trong đơn phải dùng giá hiệu lực (web: `applyPricing` trong `src/services/pricing-apply.ts`, áp **sau** cache; đơn: `validateOrderData`, `addOrderItem`). Không so/ghi `products.price` trực tiếp.
- Server là nguồn sự thật: giá client gửi lệch giá server → `PRICE_CHANGED`. `order_items.price` = giá đã chốt; `original_price`, `price_program_id` lưu vết.
- Migration: `deploy/add-price-programs.sql` (chạy trước khi deploy code).
