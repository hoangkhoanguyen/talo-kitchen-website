# Giá theo khung giờ (Happy Hour) — Plan triển khai (phương án B)

> Trạng thái: **đã code** (chưa chạy trên DB thật). Phân tích gốc: `ANALYSIS.md`.

## 1. Quyết định đã chốt với khách

| # | Câu hỏi | Chốt |
|---|---|---|
| 1 | Set cứng hay cho sửa | **Cho khách sửa (B)**: khách tự chọn món, tự set giờ, set giá |
| 2 | Số khung giờ | **Không giới hạn** — 1 chương trình có nhiều khung giờ |
| 3 | Thứ trong tuần | **Không hard-code** — khách tự chọn thứ cho từng khung |
| 4 | Addon/topping | **Không giảm** — chỉ áp giá cho món chính, addon giữ giá |
| 5 | Nhân viên thêm món trong admin | **Có áp** giá khung giờ |
| 6 | Mốc kết thúc | **Bám sát rule**, không grace period. Khung `[start, end)` |
| 7 | Ngày lễ | Không xử lý riêng (khách tự bật/tắt chương trình) |
| 8 | Báo cáo tách doanh thu HH | Không làm |

Ví dụ khách sẽ tự cấu hình: chương trình "Happy Hour Classic Cocktail", chọn các món cocktail, 1 khung giờ: T2–T5, 16:00–21:00, giá 150.000.

## 2. Mô hình dữ liệu

Migration **chỉ thêm** bảng/cột (nullable/có default) → an toàn với Vercel Instant Rollback.

```
price_programs                       -- chương trình giá
  id serial PK
  name varchar(255) not null
  is_active boolean not null default true
  created_at, updated_at timestamptz

price_program_slots                  -- khung giờ (nhiều / chương trình)
  id serial PK
  program_id int not null → price_programs.id ON DELETE CASCADE
  days_of_week int[] not null        -- 0=CN, 1=T2 … 6=T7 (giờ VN), ≥1 phần tử
  start_minute int not null          -- phút trong ngày, 0..1439   (16:00 → 960)
  end_minute int not null            -- 1..1440, > start_minute   (21:00 → 1260)
  price real not null                -- giá áp cho món trong khung (> 0)

price_program_products               -- món áp dụng
  program_id int → price_programs.id ON DELETE CASCADE
  product_id int → products.id ON DELETE CASCADE
  PK(program_id, product_id)

order_items (+ cột mới)
  original_price real null           -- giá gốc lúc đặt (null = đơn cũ / không giảm)
  price_program_id int null          -- chương trình đã áp (không FK cứng, để xoá CT không ảnh hưởng đơn)
```

- Giá mỗi khung là **giá cố định** (không phải % / số tiền giảm) — đúng cách khách đưa ("180K → 150K").
- Lưu giờ bằng **phút trong ngày** (int) thay vì kiểu `time` → so sánh đơn giản, không dính timezone driver.
- Không hỗ trợ khung qua nửa đêm (vd. 22:00–02:00): khách tách thành 2 khung (22:00–24:00 hôm nay + 00:00–02:00 hôm sau). Validate `start < end`.

## 3. Logic tính giá (lõi)

`src/lib/pricing.ts` — hàm thuần, không đụng DB, test được:

```ts
toVNClock(now: Date) → { day: 0..6, minute: 0..1439 }   // now + 7h, đọc getUTC*
getEffectivePrice(productId, basePrice, programs, now)
  → { price, originalPrice, programId: number | null, endsAt: Date | null }
```

Quy tắc:
1. Lấy các chương trình `is_active` có chứa `productId`.
2. Khung khớp khi `day ∈ days_of_week` và `start_minute ≤ minute < end_minute`.
3. Nhiều khung/chương trình cùng khớp → lấy **giá thấp nhất**.
4. Giá khung ≥ giá gốc → bỏ qua (không bao giờ làm tăng giá).
5. Không khớp → giá gốc, `programId = null`.
6. `endsAt` = thời điểm khung đang áp kết thúc (để client tự refresh).

`src/services/price-programs.ts`:
- `getActivePricePrograms()` — đọc chương trình đang bật + slots + productIds, bọc `unstable_cache` tag `PRICE_PROGRAMS` (chỉ cache **cấu hình**, không cache kết quả theo giờ).
- `applyPricing(products, now)` — helper map list sản phẩm → thêm `price` hiệu lực + `originalPrice` + `priceEndsAt`.

## 4. Điểm áp dụng

| Chỗ | Thay đổi |
|---|---|
| Menu, chi tiết món, món liên quan, quick cart (`src/services/cached/products.ts` callers) | Đọc cache như cũ → `applyPricing(..., new Date())` **sau** cache |
| Giỏ hàng `getCartProductsByIds` | Áp `applyPricing` |
| Đặt đơn `validateOrderData` + `createOrder` | Server tự tính giá hiệu lực; nếu `item.price` client ≠ giá server → trả `PRICE_CHANGED` + giá mới (không reject chung chung). Ghi `price`, `original_price`, `price_program_id` từ giá server, không tin client |
| Admin thêm món `addOrderItem` | Dùng giá hiệu lực tại thời điểm thêm; ghi `original_price/price_program_id`; vẫn `recomputeOrderTotal` trong cùng transaction |
| Bộ chọn món admin `getOrderProductOptions` | Trả giá hiệu lực để nhân viên thấy đúng giá trước khi thêm |
| Đổi số lượng `updateOrderItemQuantity` | Giữ nguyên giá đã chốt (không đổi) |
| Addon | Không đổi |

Thời điểm tính giá = thời điểm server xử lý request (giờ VN qua `toVNClock`), không dùng giờ client.

## 5. Cờ `is_enabled` (theo CLAUDE.md)

- Không đổi cơ chế: món tắt trừ `order_items.total_price` của nó (đã là giá khung giờ nếu có) → tổng hiển thị cho tài khoản thường vẫn đúng; `shipping_fee` không ảnh hưởng.
- `addOrderItem` giữ nguyên kiểm tra `includeDisabled` / `lockEditableOrder` hiện tại.
- Nếu chi tiết đơn / bill hiển thị giá gốc gạch ngang thì vẫn đi qua bộ lọc món theo tài khoản như hiện tại; `original_price`, `price_program_id` không tiết lộ gì về cờ.
- Test cover `talo_kitchen` và tài khoản thường với món giá khung giờ bị tắt.

## 6. Admin UI

Trang mới **"Giá theo khung giờ"** `/admin/price-programs` (thêm vào sidebar + `ADMIN_ROUTE`):
- Danh sách: tên, số món, tóm tắt khung giờ, switch bật/tắt, sửa, xoá.
- Form tạo/sửa (modal, theo pattern Categories):
  - Tên chương trình, bật/tắt.
  - **Khung giờ** (thêm/xoá nhiều dòng): chọn thứ (checkbox T2…CN), giờ bắt đầu, giờ kết thúc, giá.
  - **Món áp dụng**: chọn nhiều món, lọc theo danh mục, nút "chọn cả danh mục"; hiện giá gốc cạnh món, cảnh báo nếu giá khung ≥ giá gốc.
- Validate (zod, `src/validations/price-program.ts`): tên bắt buộc; ≥1 khung; mỗi khung ≥1 thứ, `0 ≤ start < end ≤ 1440`, giá > 0; ≥1 món.
- Server actions `src/actions/admin/price-program.ts`: `verifyAdminAuthSimple` → service → `revalidateTag(PRICE_PROGRAMS)` (`{ expire: 0 }` như `src/lib/revalidate.ts`).
- Ghi thời gian dạng `HH:mm` trên UI, lưu phút trong ngày.

## 7. Phía khách (web)

- Món đang trong khung: giá gốc gạch ngang + giá mới (`ProductCard`, `ProductInformation`, quick cart, cart, checkout).
- Hết khung khi đang mở trang: client nhận `priceEndsAt` (timestamp tuyệt đối từ server) → hẹn `router.refresh()` / refetch giỏ hàng đúng lúc đó; không dùng đồng hồ client để quyết định giá.
- Checkout gặp `PRICE_CHANGED`: toast thông báo giá đã cập nhật, refetch giỏ, khách bấm đặt lại.
- Chuỗi hiển thị mới thêm vào `messages/` (en, vi).

## 8. Task

| # | Task | Phụ thuộc |
|---|---|---|
| T1 | Schema drizzle 3 bảng mới + 2 cột `order_items`, generate migration | — |
| T2 | `src/lib/pricing.ts` (`toVNClock`, `getEffectivePrice`) + unit test | — |
| T3 | Service `price-programs.ts`: CRUD + `getActivePricePrograms` (cache tag) + `applyPricing` | T1, T2 |
| T4 | Áp giá phía web: menu/chi tiết/related/quick cart/cart | T3 |
| T5 | Đặt đơn: tính giá server, `PRICE_CHANGED`, ghi `original_price/price_program_id` | T3 |
| T6 | Admin đơn: `addOrderItem` + `getOrderProductOptions` dùng giá hiệu lực | T3 |
| T7 | Admin UI trang chương trình giá + actions + validation + sidebar/route | T3 |
| T8 | UI web: giá gạch ngang, auto refresh theo `priceEndsAt`, xử lý `PRICE_CHANGED`, i18n | T4, T5 |
| T9 | Test & QA (mục 9) | tất cả |

## 9. Test

Unit (`npx tsx --test`, chạy với cả `TZ=UTC` và `TZ=America/New_York`):
- Khung T2–T5 16:00–21:00 / 150K, gốc 180K: T2 15:59 → 180K · T2 16:00 → 150K · T5 20:59 → 150K · T5 21:00 → 180K · T6 17:00 → 180K · CN 17:00 → 180K.
- Theo UTC: 09:30Z thứ 5 (= 16:30 VN) → 150K · 23:30Z CN (= 06:30 T2 VN) → 180K.
- Nhiều khung trong 1 chương trình; 2 chương trình chồng nhau → giá thấp nhất; giá khung ≥ gốc → bỏ qua; chương trình tắt → bỏ qua; món không thuộc chương trình → giá gốc; `endsAt` đúng.
- Addon không đổi giá trong `computeItemTotal`.

Tích hợp / e2e:
- Đặt đơn trong/ngoài khung → `order_items.price/original_price/price_program_id` đúng, `orders.total_price` đúng.
- Client gửi giá sai / vượt mốc → `PRICE_CHANGED`.
- Admin thêm món trong/ngoài khung; tắt món giá khung giờ → tổng hiển thị cho tài khoản thường trừ đúng, `talo_kitchen` thấy đủ.
- Sửa chương trình trong admin → menu đổi giá ngay (revalidate cache).

## 10. Deploy (Vercel)

1. Chạy migration lên schema đang dùng (`DB_SCHEMA`) **trước** khi promote bản code mới (migration chỉ thêm → code cũ vẫn chạy).
2. Deploy Preview, test với DB thật; rồi Production.
3. Không cần Cron, không cần env mới.
4. Rollback: Instant Rollback; bảng mới để nguyên, không ảnh hưởng.
