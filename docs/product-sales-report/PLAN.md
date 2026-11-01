# Thống kê lượt đặt từng món (có xuất Excel) — Plan

> Trạng thái: **đã code** (chưa chạy trên DB thật).
> Yêu cầu chi tiết đã chốt: `docs/admin-2.0/REQUIREMENTS.md` mục 4 "Mục 3" (câu 3.1–3.7) và mục 5.4. Hạng mục 4 trong báo giá Admin 2.0 (800.000đ).

## 1. Yêu cầu đã chốt (theo gợi ý ⭐)

| Câu | Chốt |
|---|---|
| 3.1 | Hiện **2 cột**: "Số phần bán" (`SUM(quantity)`) và "Số đơn" (`COUNT(DISTINCT order_id)`); xếp theo **số phần bán giảm dần** |
| 3.2 | Doanh thu món **gồm topping** → dùng `order_items.total_price` |
| 3.3 | Không có bảng xếp hạng riêng cho topping |
| 3.4 | **Lọc theo danh mục** món |
| 3.5 | **Hiện món không bán được**, xếp cuối bảng |
| 3.6 | Quy tắc tính đơn **giống báo cáo doanh thu**: chỉ đơn `completed`, mốc ngày `created_at` theo giờ VN |
| 3.7 | **Xuất Excel** trang Báo cáo (doanh thu + thống kê món) |
| — | Nằm **trong trang Báo cáo** `/admin/reports`, **dùng chung bộ lọc ngày** với doanh thu, mặc định tháng hiện tại |

Không thêm bảng/cột DB (dữ liệu `order_items` đã đủ: `product_id`, `product_name`, `quantity`, `total_price`).

## 2. Thiết kế

### 2.1 Service `getProductSalesReport({ start, end, categoryId?, includeDisabled })` — `src/services/reports.ts`

- **Dùng lại `buildOrdersCte`** (cùng tập đơn completed + lọc ngày VN + lọc đơn tắt) → khớp số với báo cáo doanh thu.
- Tổng hợp `order_items` của các đơn trong CTE, nhóm theo `product_id`:
  - `quantity = SUM(oi.quantity)`, `order_count = COUNT(DISTINCT oi.order_id)`, `revenue = ROUND(SUM(oi.total_price::float8::numeric))`.
- **Món 0 lượt (3.5)**: `products` LEFT JOIN kết quả tổng hợp → món chưa bán có 0/0/0. Chỉ đưa vào các món **đang bán** (`is_active = true`); món đã ngừng bán chỉ xuất hiện nếu có lượt bán trong kỳ.
- **Món đã bị xoá khỏi bảng `products`** nhưng còn trong đơn cũ: vẫn hiện, lấy tên từ `order_items.product_name` (snapshot), danh mục "—".
- **Tên món**: tên hiện tại trong `products.title` (để món đổi tên không bị tách 2 dòng); fallback `product_name`.
- **Lọc danh mục (3.4)**: theo danh mục **hiện tại** của món (`products.category_id`). Món đã xoá không thuộc danh mục nào → chỉ hiện khi không lọc.
- **Sắp xếp**: `quantity DESC`, rồi `revenue DESC`, rồi tên A→Z (ổn định). Món 0 lượt tự rơi xuống cuối.
- Trả kèm dòng tổng: tổng số phần, tổng doanh thu món.

### 2.2 Cờ `is_enabled` (theo CLAUDE.md)

| | Tài khoản thường | `talo_kitchen` |
|---|---|---|
| Đơn tắt | Loại hoàn toàn (qua `buildOrdersCte`) | Tính |
| Món tắt (`order_items.is_enabled = false`) | **Không tính** vào số phần, số đơn, doanh thu món | Tính |
| Món chỉ có lượt bán ở dạng món tắt | Hiện như 0 lượt (nếu món đang bán) / không hiện (nếu đã ngừng bán) | Hiện bình thường |
| Field `isEnabled` trả xuống client | Không | Không cần (chỉ số đã tổng hợp) |

- `includeDisabled` lấy từ token (`isTaloKitchen(payload.username)`), không nhận từ query.
- Kiểm tra chéo: **Σ doanh thu món + Σ phí ship = Tổng doanh thu** của báo cáo doanh thu (cùng khoảng ngày, cùng tài khoản). Cả 2 vai trò đều phải khớp.
- Không liên quan phí ship (ship nằm ở đơn, không ở món).

### 2.3 Tương tác với tính năng Giá theo khung giờ
Doanh thu món lấy `order_items.total_price` = giá đã chốt lúc đặt → đơn Happy Hour tự tính đúng giá đã giảm, không cần sửa gì.

### 2.4 API
- Mới: `GET /admin/api/reports/products?preset=…&start_date=…&end_date=…&category_id=…` (`withAuth`, `parseReportRange`, `Cache-Control: no-store`).
- `category_id` không hợp lệ (không phải số nguyên dương) → 400; danh mục không tồn tại → trả bảng rỗng.
- Danh sách danh mục cho bộ lọc: dùng API categories có sẵn (`categoriesApi` / `useFetchAllCategories`).

### 2.5 UI — trang `/admin/reports`
- Thêm khối **"Thống kê theo món"** bên dưới phần doanh thu, dùng chung bộ lọc ngày ở đầu trang.
- Dropdown **Danh mục** (Tất cả + từng danh mục), lưu vào URL (`useReportParams`, thêm `category_id`).
- Bảng: `#`, Món, Danh mục, Số phần bán, Số đơn, Doanh thu; dòng tổng cuối. Món 0 lượt hiển thị mờ.
- Trạng thái loading/lỗi/rỗng giống phần doanh thu.
- Hook mới: `useFetchProductSalesReport(params, enabled)`.

### 2.6 Excel (3.7)
- Thêm sheet **"Thống kê theo món"** vào file xuất của trang Báo cáo (cả 2 kiểu xuất: theo ngày và theo đơn — xem `docs/revenue-export-by-order/PLAN.md`), áp **cùng khoảng ngày và bộ lọc danh mục** đang chọn.
- Đầu sheet: Khoảng ngày, Danh mục đang lọc, Xuất lúc (giờ VN). Bảng cột như trên + dòng tổng.
- Số tiền/số lượng là number (`#,##0`); tên món/danh mục qua `safeText`.
- API export nhận thêm `category_id` (validate như 2.4).

### 2.7 Vercel
- Route handler `force-dynamic`, `no-store`, không dùng `unstable_cache` (admin không cache — quy ước trong `src/lib/cache.ts`).
- 1 truy vấn tổng hợp trong Postgres, kết quả = số món (vài chục–vài trăm dòng) → nhẹ.

## 3. Task

| # | Task | Phụ thuộc |
|---|---|---|
| T1 | Type `ProductSalesReport` (`src/types/reports.ts`) + `getProductSalesReport` (dùng lại `buildOrdersCte`) | — |
| T2 | API `GET /admin/api/reports/products` + route helper | T1 |
| T3 | UI khối "Thống kê theo món" + lọc danh mục + hook | T2 |
| T4 | Excel: sheet "Thống kê theo món" + `category_id` ở API export | T1 |
| T5 | Test | tất cả |

## 4. Test
- Unit/service (cả **tài khoản thường** và **`talo_kitchen`**):
  - Xếp theo số phần giảm dần; hoà số phần → theo doanh thu.
  - "Số đơn" đếm distinct: 1 đơn có 2 dòng cùng món → số đơn = 1, số phần = tổng.
  - Doanh thu gồm topping.
  - Món đang bán chưa có lượt → có, 0 lượt, nằm cuối; món ngừng bán không lượt → không có.
  - Món đã xoá còn trong đơn cũ → hiện tên snapshot.
  - Lọc danh mục đúng.
  - Đơn tắt / món tắt: thường loại, `talo_kitchen` tính.
  - Chỉ đơn `completed`; đơn tạo 23:30 giờ VN rơi đúng ngày VN.
  - **Σ doanh thu món + Σ ship = Tổng doanh thu** báo cáo doanh thu, cả 2 vai trò.
- Excel: có sheet mới, đúng bộ lọc, số dạng number, tên bắt đầu bằng `=` bị escape.
- E2E: đổi khoảng ngày/danh mục → bảng và file xuất cập nhật.
