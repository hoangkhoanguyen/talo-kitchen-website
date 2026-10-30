# v2 — Admin 2.0: Báo cáo doanh thu theo ngày

Mục tiêu version: Nâng cấp trang admin theo `docs/admin-2.0/REQUIREMENTS.md`. **Đợt này khách chỉ yêu cầu hạng mục 3 theo file báo giá** (Báo cáo doanh thu theo ngày, có xuất Excel), nên v2 hiện chỉ có 1 sprint. Các hạng mục còn lại (thanh toán chuyển khoản, người tạo bill, thống kê món, xuất bill Excel, nhập tiếng Việt) làm sau bằng `/sdlc:replan`.

Tech stack (kế thừa): Next.js 16 (App Router, RSC), React 19, TypeScript, PostgreSQL + Drizzle ORM (`DB_SCHEMA` qua env), Tailwind v4 + daisyui (theme `.admin`). Thêm duy nhất thư viện `exceljs`.

## Ràng buộc xuyên suốt version
- Không thêm cột/bảng DB, không migration.
- Ngày cắt theo giờ VN (Asia/Ho_Chi_Minh, UTC+7) ngay trong SQL, không dựa timezone server.
- Giao diện admin giữ tiếng Việt, không i18n.

---

## sprint-1-revenue-report
- **Trạng thái**: planned
- **Mô tả**: Trang Báo cáo doanh thu theo ngày cho admin (lọc giờ VN, chọn nhanh, tách theo thanh toán, phí ship cột riêng), xuất Excel, và đóng route `/admin/register`.
- **Features**:
  - Trang Báo cáo mới trong admin + mục sidebar "Báo cáo".
  - Bộ lọc ngày giờ VN: Hôm nay, Hôm qua, 7 ngày qua, Tháng này, Tháng trước, tự chọn khoảng ngày. Mặc định tháng hiện tại.
  - Chỉ tính đơn `completed`, mốc ngày = `createdAt`.
  - Hiển thị: tổng doanh thu, số đơn, bảng doanh thu từng ngày (hiện cả ngày 0 đơn) với cột phí ship riêng.
  - Tách theo phương thức thanh toán: nhóm động theo `paymentMethod`, tên hiển thị từ bảng nhãn; `cash` và `cash_on_delivery` đều là "Tiền mặt"; giá trị lạ hiện nguyên giá trị thô.
  - Xuất Excel bằng `exceljs` (số tiền dạng number, tên file có khoảng ngày), chạy phía server.
  - Đóng `/admin/register`: chặn cả trang lẫn server action/API đăng ký; tạo admin sau này qua script/SQL.
- **Ngoài phạm vi**: chuyển khoản / đã nhận tiền, người tạo bill / role / `changed_by`, kiểm tra role xem báo cáo (hiện mọi tài khoản đăng nhập đều xem được), thống kê lượt đặt từng món, xuất bill Excel, nhập nội dung tiếng Việt, biểu đồ, chuẩn hóa `paymentMethod` cũ trong DB.
- **Giả định cần xác nhận**: Tổng doanh thu = tổng `totalPrice` (đã gồm ship), cột ship hiển thị riêng; trang đặt ở route mới `reports`, giữ Dashboard như cũ.
- **Phụ thuộc**: không.
