# Happy Hour — giá theo khung giờ (phân tích & giải pháp)

> Trạng thái: **phân tích, chờ khách chốt câu hỏi mở**. Chưa code.

## 1. Yêu cầu của khách

**Happy Hour – All Classic Cocktail**

| Thời gian (giờ VN) | Giá |
|---|---|
| Thứ 2 → Thứ 5, 16:00 – 21:00 | **150.000** |
| Thứ 2 → Thứ 5, ngoài khung trên | 180.000 |
| Thứ 6 → Chủ nhật, cả ngày | 180.000 |

Giá do khách đưa; nếu được thì cho khách tự sửa, không thì set cứng.

### Cách hiểu (cần xác nhận)
- Khung giờ: **[16:00, 21:00)** — 16:00:00 là giá HH, 21:00:00 trở đi là giá gốc.
- Giờ tính giá = **thời điểm server nhận đơn** (`orders.created_at`). Đơn không có trường "giờ nhận hàng/hẹn giờ", nên không có khái niệm "đặt trước cho khung HH".
- "Classic Cocktail" = một nhóm sản phẩm (danh mục hoặc danh sách món chọn tay). Hiện **chưa có cột/nhóm** nào đánh dấu cái này.
- Giá gốc 180K = `products.price` hiện tại; HH là **giá ghi đè** 150K (không phải % giảm).

## 2. Hiện trạng code liên quan

| Chỗ | Hiện tại | Ảnh hưởng |
|---|---|---|
| `products.price` | 1 giá cố định | Giữ làm **giá gốc**, không đổi theo giờ |
| Menu/chi tiết món (`src/services/cached/products.ts`) | `unstable_cache`, không tự hết hạn | Không được cache giá HH → áp rule **sau** khi đọc cache |
| Giỏ hàng (`getCartProductsByIds`, `src/services/cart.ts`) | Không cache, localStorage chỉ lưu `productId/qty` | Áp rule tại đây là đủ |
| Đặt đơn (`validateOrderData`, `src/services/orders.ts`) | So `item.price !== product.price` → reject | **Sẽ reject mọi đơn HH** → phải sửa: server tự tính giá hiệu lực |
| Thêm món admin (`addOrderItem`) | Lấy `product.price` | Phải dùng giá hiệu lực |
| Đổi số lượng (`updateOrderItemQuantity`) | Giữ `item.price` đã chốt | Đúng, không cần đổi |
| `order_items.price/total_price` | Lưu giá đã chốt | Báo cáo doanh thu tự đúng, không cần sửa `reports.ts` |

## 3. Ràng buộc do deploy trên Vercel

1. **Server chạy UTC** → không dùng `getHours()/getDay()`. Tính thứ & giờ theo UTC+7 (cố định, không DST), tái dùng hằng số trong `src/lib/date.ts`.
2. **Không dùng Cron để đổi `products.price` lúc 16:00/21:00.**
   - Hobby plan cron tối đa 1 lần/ngày, giờ không chính xác; Pro thì được nhưng vẫn có thể fail/trễ → giá sai cả buổi.
   - Đổi giá gốc còn phải `revalidateTag`, dễ race với đơn đang đặt, và mất "giá gốc" để gạch ngang.
   - ⇒ **Tính giá theo thời điểm request** (hàm thuần `now → giá`), không cần hạ tầng gì thêm, chạy đúng trên mọi instance.
3. **Data Cache dùng chung, không hết hạn** → chỉ cache dữ liệu gốc (giá gốc + rule), áp rule ở runtime. Layout web đang `force-dynamic` nên mỗi request đều render lại → giá HH hiển thị đúng ở lần tải trang.
4. **Trang mở sẵn qua mốc 21:00** (client không reload) sẽ hiển thị giá cũ → xử lý ở 2 lớp:
   - Client: biết `endsAt` của khung HH (server trả về dạng timestamp tuyệt đối), hết giờ thì `router.refresh()`/refetch giỏ hàng. Không dùng đồng hồ client để quyết định giá (client có thể ở tz khác, giờ máy sai).
   - Server: luôn là nguồn sự thật lúc đặt đơn (mục 4.3).

## 4. Giải pháp đề xuất

### 4.1 Lõi: hàm tính giá thuần
`src/lib/pricing.ts`
```ts
getEffectivePrice(product, rules, now = new Date())
  → { price, originalPrice, ruleId | null, endsAt | null }
```
- Quy `now` về giờ VN: `vn = now + 7h`, đọc `getUTCDay()` / `getUTCHours()*60 + getUTCMinutes()`.
- Rule khớp khi: `is_active`, `day ∈ daysOfWeek`, `startMin ≤ t < endMin`, sản phẩm thuộc rule.
- Nhiều rule cùng khớp → lấy **giá thấp nhất**. Giá HH ≥ giá gốc → bỏ qua (không bao giờ tăng giá).
- Addon **không** áp HH (giữ giá addon) — cần khách xác nhận.

Dùng ở: menu/chi tiết (sau khi đọc cache), giỏ hàng, `validateOrderData`/`createOrder`, `addOrderItem`, bộ chọn món admin (`getOrderProductOptions`).

### 4.2 Lưu rule — 2 phương án

**A. Set cứng (nhanh, ~1 ngày)**
`src/constants/price-rules.ts`: `{ days: [1,2,3,4], start: "16:00", end: "21:00", price: 150000, productIds: [...] }`.
Đổi giá/giờ/món = sửa code + deploy (~2 phút trên Vercel). Rủi ro: id sản phẩm khác nhau giữa schema `prod`/`prod_v2`/dev.

**B. Cho khách sửa (khuyến nghị, ~3–4 ngày)**
Bảng mới (migration chỉ thêm bảng → an toàn khi Instant Rollback):
```
price_rules(id, name, is_active, days_of_week int[], start_time time, end_time time,
            price real, created_at, updated_at)
price_rule_products(rule_id, product_id)  -- PK(rule_id, product_id)
```
- Admin: trang **Khuyến mãi theo giờ** — bật/tắt, chọn thứ, giờ bắt đầu/kết thúc, giá HH, chọn món (lọc theo danh mục "Cocktail" để tick nhanh).
- Validate: `start < end` (chưa hỗ trợ qua nửa đêm), ít nhất 1 thứ, giá > 0 và < giá gốc của từng món (cảnh báo nếu không).
- Đọc rule qua `unstable_cache` tag `PRICE_RULES`, admin lưu → `revalidateTag` (đúng pattern `src/lib/revalidate.ts`). Rule chỉ là dữ liệu tĩnh, việc "đang trong giờ hay không" tính ở runtime nên cache vẫn an toàn.
- Chọn món theo **danh sách sản phẩm** (không gắn cứng danh mục) để linh hoạt; UI cho "chọn tất cả món trong danh mục X".

> Khuyến nghị B: khách nói "nếu được thì cho edit", và chủ quán sẽ chắc chắn đổi giờ/giá/thêm món. Chi phí chênh không lớn vì phần khó (giá theo giờ, đặt đơn, boundary 21:00) phương án nào cũng phải làm.

### 4.3 Đặt đơn & mốc chuyển giá
- Server **tự tính giá** từ rule tại thời điểm xử lý, không tin `price` client gửi.
- Client gửi giá đang thấy; nếu lệch giá server (vd. thêm giỏ 20:58, bấm đặt 21:01) → trả `PRICE_CHANGED` kèm giá mới, UI báo "Happy Hour đã kết thúc, giá đã cập nhật" và cho khách xác nhận lại. Không âm thầm tính giá khác với giá khách thấy.
- (Tuỳ chọn, hỏi khách) grace period vài phút sau 21:00 để giữ giá HH cho đơn đang checkout.

### 4.4 Lưu vết trên đơn
Thêm vào `order_items` (nullable/default → tương thích ngược):
- `original_price real` — giá gốc lúc đặt.
- `price_rule_id int null` — rule đã áp (để bill/ báo cáo biết món nào giá HH).

`price`/`total_price` vẫn là giá thực thu → doanh thu và `orders.total_price` đúng như cũ.

### 4.5 Cờ `is_enabled` (theo CLAUDE.md)
- Không đổi cơ chế: món tắt bị trừ đúng `order_items.total_price` của nó — vốn đã là giá HH nếu được áp → tổng hiển thị cho tài khoản thường vẫn đúng.
- `addOrderItem` dùng giá hiệu lực tại thời điểm thêm, vẫn `recomputeOrderTotal` trong cùng transaction.
- Không có logic mới chọn đơn có sẵn phía khách → không phát sinh vấn đề đơn tắt.
- Bill in / chi tiết đơn: nếu hiển thị nhãn "Happy Hour" hoặc giá gốc gạch ngang thì vẫn lọc món tắt theo tài khoản như hiện tại.
- Test cover 2 vai trò với đơn/món tắt có giá HH.

### 4.6 Hiển thị phía khách
- Món đang HH: giá gốc gạch ngang + giá HH + badge "Happy Hour · đến 21:00" (i18n `messages/`).
- Ngoài giờ (tuỳ khách): hiện dòng nhỏ "Happy Hour T2–T5, 16:00–21:00: 150K".
- Giỏ hàng/checkout: tính lại theo giá server mỗi lần fetch.

## 5. Test
- Unit `getEffectivePrice`, chạy với `TZ=UTC` **và** `TZ=America/New_York` để chắc không phụ thuộc tz máy:
  T2 15:59 → 180K · T2 16:00 → 150K · T5 20:59:59 → 150K · T5 21:00 → 180K · T6 17:00 → 180K · CN 17:00 → 180K · 23:30 UTC CN (= 06:30 T2 VN) → 180K · 09:30 UTC T5 (= 16:30 VN) → 150K.
- Đặt đơn: giá đúng trong/ngoài giờ, `PRICE_CHANGED` khi vượt mốc, client gửi giá giả → reject.
- Admin thêm món trong/ngoài giờ; `is_enabled` cho cả `talo_kitchen` và tài khoản thường.
- (B) CRUD rule + revalidate cache: sửa rule → menu đổi ngay.

## 6. Câu hỏi mở cho khách
1. Món nào là "Classic Cocktail"? Tất cả đều 180K? Có món mới sau này tự vào nhóm không?
2. 21:00 đúng là hết HH (21:00 = 180K)? Có giữ giá cho đơn đang checkout vài phút không?
3. Addon (topping/thêm shot) có giảm không?
4. Áp cho cả đơn web lẫn món nhân viên thêm trong admin?
5. Ngày lễ rơi vào T2–T5 có HH không? (Phương án B có thể thêm `start_date/end_date`/ngày loại trừ sau.)
6. Có muốn báo cáo tách doanh thu HH / số tiền đã giảm không?
7. Set cứng (A) hay cho sửa (B)?
