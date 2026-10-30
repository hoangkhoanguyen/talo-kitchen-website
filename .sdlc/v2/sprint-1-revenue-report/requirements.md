# Requirements — v2 / sprint-1-revenue-report

Nguồn: `.sdlc/v2/sprints.md`, `docs/admin-2.0/REQUIREMENTS.md` (mục "Bật/tắt đơn và từng món", mục 3, mục 4 câu 2.1-2.5, 3.7, 6.1), `.sdlc/architecture.md`, và code hiện tại (`src/services/orders.ts`, `src/lib/order-visibility.ts`, `src/proxy.ts`, `src/lib/date.ts`, `src/constants/route.ts`, `Menu.tsx`, `src/actions/admin/auth.ts`, `src/services/auth.ts`, `src/app/(admin)/admin/api/orders/route.ts`, `src/types/orders.ts`, `src/constants/orders.ts`, `src/providers/withAuth.ts`). Repo không có file CLAUDE.md.

---
# PART 1 — HUMAN REVIEW

## 1. Sprint Goal & Scope

**Mục tiêu**: Admin (mọi tài khoản đã đăng nhập) xem được doanh thu theo ngày của quán theo giờ Việt Nam, tách theo phương thức thanh toán, có cột phí ship riêng, xuất ra Excel; đồng thời đóng lỗ hổng tự đăng ký tài khoản admin ở `/admin/register`.

**In scope**
- Trang Báo cáo mới tại route `/admin/reports` + mục sidebar "Báo cáo" (Dashboard giữ nguyên, vẫn chỉ redirect sang Products).
- Bộ lọc ngày giờ VN: Hôm nay, Hôm qua, 7 ngày qua, Tháng này, Tháng trước, Tự chọn. Mặc định "Tháng này".
- Chỉ đơn `status = completed`; mốc ngày = `createdAt`, cắt theo Asia/Ho_Chi_Minh ngay trong SQL.
- Hiển thị: Tổng doanh thu, Số đơn, bảng từng ngày (kể cả ngày 0 đơn) có cột phí ship riêng, bảng tách theo phương thức thanh toán (nhóm động + bảng nhãn).
- Áp quy tắc bật/tắt đơn/món có sẵn cho MỌI con số (bảng, tổng, số đơn, tách thanh toán, Excel). Không để lộ `isEnabled` xuống client.
- Xuất Excel bằng `exceljs` phía server (số tiền dạng number, tên file có khoảng ngày).
- Đóng `/admin/register`: chặn trang, chặn server action đăng ký, chặn mọi đường API đăng ký. Tạo admin về sau bằng script/SQL.

**Out of scope**
- Chuyển khoản / "đã nhận tiền", người tạo bill, role, `changed_by`.
- Kiểm tra role để xem báo cáo (mọi tài khoản đăng nhập đều xem được; đây là KHOẢNG TRỐNG TẠM THỜI so với câu 6.1 "chỉ chủ quán/quản lý", phải được ghi lại để sprint sau bịt).
- Thống kê lượt đặt từng món, xuất bill Excel, nhập nội dung tiếng Việt, biểu đồ.
- Thêm cột/bảng DB, migration. Chuẩn hóa `paymentMethod` cũ trong DB.
- Script tạo admin (chỉ cần tài liệu hóa cách tạo; không bắt buộc viết script trong sprint này, xem OQ-03).

## 2. Open Questions (user cần quyết; nếu im lặng dùng phương án mặc định)

- **OQ-01** Đơn mà TOÀN BỘ item đã bị tắt (tài khoản thường): đơn vẫn `isEnabled=true` nên vẫn được đếm vào "Số đơn", doanh thu của đơn = `totalPrice - tổng item tắt` = chỉ còn phí ship (vì `totalPrice` đã gồm ship). Giống hệt cách danh sách đơn hiện hiển thị. Mặc định: GIỮ như vậy (đếm đơn, doanh thu còn lại = phí ship). Phương án khác: loại hẳn đơn khỏi báo cáo.
- **OQ-02** Giới hạn độ dài khoảng ngày tự chọn: mặc định tối đa 366 ngày (để bảng từng ngày và file Excel không quá lớn). Quá giới hạn thì báo lỗi. Có cần giới hạn khác (vd 92 ngày) không?
- **OQ-03** "Tạo admin sau này qua script/SQL": sprint này chỉ cần ghi hướng dẫn SQL/script trong tài liệu hay phải viết hẳn script `scripts/create-admin.ts`? Mặc định: chỉ viết hướng dẫn ngắn (docs), không viết script. Lưu ý trước khi đóng form, đảm bảo quán đã có ít nhất một tài khoản đăng nhập được (không bị khóa ngoài).
- **OQ-04** Có xóa biến môi trường `REGISTER_SECRET_CODE` (đang bắt buộc trong zod `src/lib/env.ts`) không? Mặc định: GIỮ nguyên biến (xóa sẽ làm vỡ validate env ở môi trường đã deploy); chỉ dừng dùng.

## 3. Key Assumptions (tôi tự quyết để đi tiếp; user có thể override)

- **ASM-01** Route trang là `/admin/reports` (thêm `reports` vào `ADMIN_ROUTE`/`adminRoutes`), API dữ liệu và Excel nằm dưới `/admin/api/reports/...` để được `proxy.ts` (401 khi thiếu cookie) và `withAuth` bảo vệ như `/admin/api/orders`.
- **ASM-02** "Tổng doanh thu" = Σ `totalPrice` của đơn được tính (đã gồm phí ship), sau khi trừ item đã tắt (tài khoản thường). Cột phí ship = Σ `shippingFee` hiển thị riêng, KHÔNG cộng thêm vào tổng lần nữa. Có thể thêm dòng phụ "Doanh thu chưa gồm ship" = tổng - ship, nhưng không bắt buộc.
- **ASM-03** Phí ship không bị ảnh hưởng bởi bật/tắt món (ship là cột của đơn, không phải của item). Đơn còn được tính thì ship của nó được tính nguyên.
- **ASM-04** Nhóm thanh toán: khóa nhóm = nhãn hiển thị đã chuẩn hóa. `cash` và `cash_on_delivery` gộp thành MỘT nhóm "Tiền mặt". Giá trị lạ (không có trong bảng nhãn) hiện đúng giá trị thô sau `trim`, mỗi giá trị lạ là một nhóm riêng. Chuỗi rỗng hoặc chỉ có khoảng trắng => nhóm "Chưa xác định". So khớp bảng nhãn phân biệt hoa/thường (đúng như dữ liệu web ghi: `cash`).
- **ASM-05** Mỗi nhóm thanh toán hiển thị: số đơn, doanh thu (đã gồm ship), phí ship. Tổng các nhóm = Tổng doanh thu; tổng số đơn các nhóm = Số đơn.
- **ASM-06** Thứ tự nhóm thanh toán: doanh thu giảm dần, "Chưa xác định" luôn ở cuối. (Chỉ ảnh hưởng hiển thị.)
- **ASM-07** Khoảng ngày tự chọn là đóng-đóng theo ngày lịch VN: từ 00:00:00 ngày bắt đầu đến hết 23:59:59.999 ngày kết thúc (cài đặt dưới dạng `>= start 00:00 VN` và `< (end + 1 ngày) 00:00 VN`). Cho phép start = end. Cho phép ngày tương lai (ngày 0 đơn).
- **ASM-08** Khoảng ngày đảo ngược (start > end): trả lỗi validate rõ ràng (HTTP 400 ở API, thông báo tiếng Việt ở UI), KHÔNG tự hoán đổi, KHÔNG trả dữ liệu rỗng im lặng.
- **ASM-09** Các nút chọn nhanh tính từ ngày hiện tại theo giờ VN (tính ở server; client chỉ gửi `preset` hoặc `start_date`/`end_date`): Hôm nay = [hôm nay, hôm nay]; Hôm qua = [hôm qua, hôm qua]; 7 ngày qua = [hôm nay - 6, hôm nay] (gồm hôm nay, đúng 7 ngày lịch); Tháng này = [mùng 1 tháng hiện tại, hôm nay]; Tháng trước = [mùng 1 tháng trước, ngày cuối tháng trước]. "Tháng này" kết thúc ở hôm nay (không kéo tới cuối tháng) để bảng không có chuỗi ngày tương lai toàn số 0.
- **ASM-10** Định dạng tham số ngày: `YYYY-MM-DD` (ngày lịch VN, không kèm giờ/tz). Không dùng `new Date(str)` + `setHours` như `getAdminOrderTable` (phụ thuộc timezone server, lỗi trên Vercel UTC).
- **ASM-11** Tiền làm tròn về đồng nguyên (VND không có phần lẻ) ở bước tổng hợp cuối; tổng hợp trong SQL bằng kiểu số chính xác (không cộng dồn kiểu `real`). Xem EC-12.
- **ASM-12** Định dạng hiển thị tiền ở UI dùng `formatCurrency` admin hiện có (vi-VN); ngày hiển thị `DD/MM/YYYY`. Không dùng i18n (admin giữ tiếng Việt). Nhãn UI là tiếng Việt (admin hiện có cả nhãn tiếng Anh như "Orders"; mục mới theo yêu cầu là "Báo cáo").
- **ASM-13** Trang dùng quy tắc xác định "tài khoản talo_kitchen" y hệt chỗ khác: `isTaloKitchen(payload.username)` từ access token (`src/lib/order-visibility.ts`); không tin bất kỳ tham số nào client gửi để bật includeDisabled.
- **ASM-14** Excel là một workbook, tối thiểu 1 sheet "Doanh thu theo ngày" chứa: khoảng ngày, tổng doanh thu, số đơn, bảng từng ngày (Ngày, Số đơn, Phí ship, Doanh thu), và khối "Theo phương thức thanh toán". Có thể tách 2 sheet; tùy architect. Mọi ô tiền/số lượng là kiểu number. Tên file: `bao-cao-doanh-thu_<start>_<end>.xlsx` (ASCII, ngày `YYYY-MM-DD`).
- **ASM-15** Đóng `/admin/register`: trang trả 404 (hoặc redirect về `/admin/login`) ở mọi trường hợp, kể cả đã đăng nhập; `registerAction` và `registerUser` từ chối vô điều kiện (không còn phụ thuộc secret code). Link "đăng ký" ở LoginForm bị gỡ. Không còn route API đăng ký (hiện không có).
- **ASM-16** Không đặt cache cho dữ liệu báo cáo (đồng bộ với các service admin hiện tại: truy vấn trực tiếp DB, real-time).

---
# PART 2 — AGENT REFERENCE

## 4. User Stories + Acceptance Criteria

### Story-01 Xem trang Báo cáo
As a nhân viên/quản lý đã đăng nhập admin, I want mở mục "Báo cáo" trên sidebar, so that tôi xem doanh thu mà không phải cộng tay từng đơn.
- AC-01.1 GIVEN đã đăng nhập WHEN nhìn sidebar THEN thấy mục "Báo cáo" trỏ tới `/admin/reports`, các mục cũ (Products, Categories, Orders, Reservations, Cài đặt) vẫn còn nguyên.
- AC-01.2 GIVEN đã đăng nhập WHEN vào `/admin/reports` lần đầu (không tham số) THEN bộ lọc đang ở "Tháng này" và dữ liệu hiển thị cho [mùng 1 tháng hiện tại giờ VN, hôm nay giờ VN].
- AC-01.3 GIVEN chưa đăng nhập WHEN vào `/admin/reports` THEN bị redirect `/admin/login?callback_url=/admin/reports...` (cơ chế proxy hiện có).
- AC-01.4 GIVEN `/admin/dashboard` WHEN truy cập THEN hành vi redirect sang Products không đổi.
- AC-01.5 GIVEN đang ở trang Báo cáo WHEN nhìn sidebar THEN mục "Báo cáo" được đánh dấu active (theo `pathname`).

### Story-02 Lọc theo khoảng ngày giờ VN
As a người xem báo cáo, I want chọn nhanh hoặc tự chọn khoảng ngày, so that tôi xem đúng kỳ cần.
- AC-02.1 GIVEN bộ lọc WHEN nhìn THEN có 6 lựa chọn: Hôm nay, Hôm qua, 7 ngày qua, Tháng này, Tháng trước, Tự chọn.
- AC-02.2 GIVEN bấm một nút nhanh WHEN dữ liệu tải xong THEN khoảng ngày hiển thị rõ (vd "01/10/2026 - 30/10/2026") và số liệu cập nhật tương ứng; nút đang chọn được làm nổi bật.
- AC-02.3 GIVEN chọn "Tự chọn" WHEN nhập start và end hợp lệ (start <= end) THEN báo cáo theo đúng khoảng đó, cả hai đầu tính trọn ngày.
- AC-02.4 GIVEN chọn "Tự chọn" với start > end WHEN áp dụng THEN hiện lỗi "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc", không gọi/không hiển thị số liệu cũ như thể đúng, API trả 400.
- AC-02.5 GIVEN khoảng dài hơn 366 ngày WHEN áp dụng THEN hiện lỗi và API trả 400 (OQ-02).
- AC-02.6 GIVEN đơn tạo lúc 2026-10-31 18:30 UTC (= 2026-11-01 01:30 giờ VN) WHEN lọc [2026-11-01, 2026-11-01] THEN đơn được tính; WHEN lọc [2026-10-31, 2026-10-31] THEN đơn KHÔNG được tính.
- AC-02.7 GIVEN khoảng đã chọn WHEN reload hoặc chia sẻ URL THEN khoảng/ preset được giữ (state nằm trong query string).

### Story-03 Tổng doanh thu và số đơn
As a chủ quán, I want thấy tổng doanh thu và số đơn của kỳ, so that nắm kết quả kinh doanh nhanh.
- AC-03.1 GIVEN kỳ có đơn WHEN xem THEN "Tổng doanh thu" = Σ doanh thu từng đơn (gồm ship, sau bật/tắt) và "Số đơn" = số đơn được tính; cả hai bằng tổng các dòng ngày và tổng các nhóm thanh toán.
- AC-03.2 GIVEN kỳ không có đơn nào WHEN xem THEN Tổng doanh thu = 0, Số đơn = 0, bảng ngày vẫn liệt kê mọi ngày với 0, có trạng thái "Chưa có đơn hoàn thành trong kỳ này" (không lỗi, không trắng trang).
- AC-03.3 GIVEN có đơn `pending`, `processing`, `cancelled` trong kỳ WHEN xem THEN các đơn đó KHÔNG góp vào bất kỳ con số nào.

### Story-04 Bảng doanh thu từng ngày
As a chủ quán, I want bảng từng ngày kể cả ngày không có đơn, so that thấy ngày nào vắng khách.
- AC-04.1 GIVEN khoảng N ngày WHEN xem THEN bảng có đúng N dòng, sắp xếp ngày tăng dần (hoặc giảm dần, một chiều nhất quán), mỗi dòng: Ngày, Số đơn, Phí ship, Doanh thu.
- AC-04.2 GIVEN ngày không có đơn WHEN xem THEN dòng vẫn xuất hiện với Số đơn 0, Phí ship 0, Doanh thu 0.
- AC-04.3 GIVEN đơn tạo 23:59:59 giờ VN ngày D WHEN xem THEN thuộc dòng ngày D; đơn tạo 00:00:00 giờ VN ngày D+1 thuộc dòng D+1.
- AC-04.4 GIVEN mọi dòng WHEN cộng cột Phí ship THEN bằng tổng phí ship ở khối tổng (nếu hiển thị) và ở Excel.

### Story-05 Tách theo phương thức thanh toán
As a chủ quán, I want thấy doanh thu theo từng phương thức thanh toán, so that đối soát tiền mặt và các hình thức khác.
- AC-05.1 GIVEN đơn có `paymentMethod` là `cash` hoặc `cash_on_delivery` WHEN xem THEN cả hai gộp vào một dòng "Tiền mặt" (số đơn và doanh thu cộng chung).
- AC-05.2 GIVEN đơn có `paymentMethod` không có trong bảng nhãn (vd `bank_transfer`, `momo`) WHEN xem THEN hiện một dòng với đúng giá trị thô (`bank_transfer`, `momo`), mỗi giá trị một dòng, không làm hỏng trang.
- AC-05.3 GIVEN đơn có `paymentMethod` rỗng hoặc chỉ khoảng trắng WHEN xem THEN vào dòng "Chưa xác định".
- AC-05.4 GIVEN thêm phương thức mới vào dữ liệu (không sửa code) WHEN xem THEN dòng mới tự xuất hiện (nhóm động); chỉ muốn đổi tên hiển thị thì sửa bảng nhãn trong constants.
- AC-05.5 GIVEN kỳ không có đơn WHEN xem THEN khối thanh toán hiện trạng thái rỗng, không lỗi.
- AC-05.6 GIVEN mọi nhóm WHEN cộng THEN số đơn và doanh thu khớp Tổng doanh thu và Số đơn.

### Story-06 Quy tắc bật/tắt đơn và món
As a hệ thống, I want áp cơ chế bật/tắt có sẵn vào báo cáo, so that số liệu khớp danh sách đơn của từng tài khoản.
- AC-06.1 GIVEN tài khoản thường WHEN đơn có `orders.isEnabled=false` THEN đơn không góp vào số đơn, doanh thu, ship, nhóm thanh toán, hay Excel.
- AC-06.2 GIVEN tài khoản thường WHEN đơn enabled có item `isEnabled=false` THEN doanh thu của đơn = `totalPrice - Σ order_items.totalPrice (item tắt)`; `order_items.totalPrice` đã gồm addon của item đó nên addon của item tắt cũng bị trừ.
- AC-06.3 GIVEN tài khoản `talo_kitchen` THEN lấy cả đơn `isEnabled=false` và KHÔNG trừ item tắt: doanh thu mỗi đơn = `totalPrice` gốc.
- AC-06.4 GIVEN response API/JSON/Props xuống client WHEN kiểm tra THEN không có field `isEnabled` (hay cờ tương đương như `includeDisabled`, `disabledTotal`) ở bất kỳ cấp nào, kể cả cho `talo_kitchen`; báo cáo chỉ gồm số đã tổng hợp.
- AC-06.5 GIVEN cùng một dữ liệu WHEN so báo cáo của tài khoản thường với Σ `totalPrice` của danh sách Orders (lọc completed, cùng khoảng ngày giờ VN) THEN hai con số bằng nhau (kiểm tra chéo cho tài khoản thường).
- AC-06.6 GIVEN file Excel WHEN mở THEN số liệu bằng đúng số trên màn hình của cùng tài khoản và cùng khoảng ngày.
- AC-06.7 GIVEN client gửi kèm tham số lạ như `include_disabled=true` WHEN gọi API THEN bị bỏ qua; quyền xem chỉ do token quyết định.

### Story-07 Xuất Excel
As a chủ quán, I want tải báo cáo ra file Excel, so that lưu trữ và đối chiếu.
- AC-07.1 GIVEN trang báo cáo đã hiển thị khoảng ngày WHEN bấm "Xuất Excel" THEN trình duyệt tải về file `bao-cao-doanh-thu_<start>_<end>.xlsx` với đúng khoảng ngày đang xem.
- AC-07.2 GIVEN file mở bằng Excel/LibreOffice WHEN kiểm tra ô tiền, số đơn, phí ship THEN có kiểu number (cộng được), có number format phân tách hàng nghìn; ô ngày là text `DD/MM/YYYY` hoặc date thật nhưng KHÔNG lệch ngày do múi giờ.
- AC-07.3 GIVEN file WHEN đọc nội dung THEN có: khoảng ngày, Tổng doanh thu, Số đơn, bảng từng ngày (cả ngày 0 đơn) với cột phí ship, khối theo phương thức thanh toán với tên nhãn đã chuẩn hóa.
- AC-07.4 GIVEN request Excel không có cookie hợp lệ WHEN gọi trực tiếp THEN 401 (không trả file).
- AC-07.5 GIVEN tham số sai (ngày không hợp lệ/đảo/quá dài) WHEN gọi Excel THEN 400 JSON lỗi, không trả file hỏng.
- AC-07.6 GIVEN việc tạo file chạy ở server (exceljs) THEN không import `exceljs` vào bundle client; không ghi file ra đĩa (stream/buffer trong response).
- AC-07.7 GIVEN kỳ không có đơn WHEN xuất THEN vẫn tạo file hợp lệ với các dòng ngày bằng 0.

### Story-08 Đóng đăng ký admin
As a chủ quán, I want không ai tự tạo được tài khoản admin, so that hệ thống an toàn.
- AC-08.1 GIVEN bất kỳ ai (chưa hoặc đã đăng nhập) WHEN GET `/admin/register` THEN không thấy form; nhận 404 (hoặc redirect `/admin/login`).
- AC-08.2 GIVEN request POST gọi `registerAction` (server action) với dữ liệu hợp lệ kể cả secretCode đúng WHEN thực thi THEN KHÔNG tạo user, trả `{ success:false, code: "REGISTRATION_CLOSED" }` (hoặc tương đương) và không ghi DB.
- AC-08.3 GIVEN `registerUser` trong service WHEN gọi từ bất kỳ nơi nào THEN từ chối vô điều kiện (phòng thủ nhiều lớp, không chỉ chặn ở UI).
- AC-08.4 GIVEN trang `/admin/login` WHEN nhìn THEN không còn link/nút dẫn tới đăng ký.
- AC-08.5 GIVEN các route khác của proxy WHEN kiểm thử hồi quy THEN login, refresh-token, và các route admin có sẵn không đổi hành vi.
- AC-08.6 GIVEN tài liệu WHEN mở THEN có hướng dẫn tạo admin qua script/SQL (hash bcrypt, saltRounds 12, `role='admin'`, `is_active=true`).

## 5. Business Rules

```
RULE-01: Chỉ tính đơn có orders.status = 'completed'. Mọi trạng thái khác (pending, processing, cancelled, giá trị lạ) bị loại.
RULE-02: Mốc ngày của đơn = orders.created_at (timestamptz), quy đổi sang ngày lịch Asia/Ho_Chi_Minh (UTC+7 cố định, không DST) bằng SQL: (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date. Không dùng timezone của server/Node/driver, không dùng moment/Date để cắt ngày dữ liệu.
RULE-03: Lọc khoảng [start, end] (ngày VN, đóng-đóng) thực thi trong SQL dưới dạng created_at >= start 00:00 VN AND created_at < (end + 1 ngày) 00:00 VN (sargable), hoặc tương đương theo ngày lịch VN.
RULE-04: Khoảng mặc định khi không có tham số = "Tháng này" = [mùng 1 tháng hiện tại, hôm nay] theo lịch VN, "hôm nay" lấy từ đồng hồ server quy sang giờ VN.
RULE-05: Preset: today=[T,T]; yesterday=[T-1,T-1]; last7=[T-6,T]; this_month=[mùng 1 của T, T]; last_month=[mùng 1 tháng trước, ngày cuối tháng trước]; custom = start_date & end_date do client gửi. T = ngày hiện tại giờ VN, tính ở server.
RULE-06: Tham số ngày phải đúng định dạng YYYY-MM-DD và là ngày lịch hợp lệ (loại 2026-02-30). Sai => 400.
RULE-07: start_date > end_date => 400 (không hoán đổi). Số ngày (end - start + 1) > 366 => 400 (OQ-02).
RULE-08: Tổng doanh thu của một đơn (tài khoản thường) = orders.total_price - COALESCE(Σ order_items.total_price WHERE order_items.is_enabled = false AND order_id = đơn, 0). orders.total_price đã gồm phí ship.
RULE-09: Tài khoản thường: loại đơn orders.is_enabled = false. Áp dụng điều kiện này CÙNG LÚC với RULE-01 trong SQL.
RULE-10: Tài khoản talo_kitchen (isTaloKitchen(payload.username) = true): KHÔNG lọc orders.is_enabled, KHÔNG trừ item tắt; doanh thu đơn = orders.total_price.
RULE-11: Quyền includeDisabled chỉ suy ra từ access token ở server; client không điều khiển được; không có tham số API nào thay đổi nó.
RULE-12: Tổng doanh thu kỳ = Σ doanh thu từng đơn (RULE-08/10). Số đơn = COUNT đơn được tính. Phí ship kỳ = Σ orders.shipping_fee của đơn được tính (không thay đổi theo item tắt). Tổng doanh thu KHÔNG cộng thêm phí ship lần nữa.
RULE-13: Bảng ngày phải có đủ mọi ngày lịch trong [start, end], ngày không có đơn = {orders:0, shippingFee:0, revenue:0}. Sinh chuỗi ngày bằng generate_series trong SQL (LEFT JOIN) hoặc điền ở service theo chuỗi ngày lịch (không dùng Date theo timezone local để cộng ngày).
RULE-14: Tách thanh toán: nhóm động theo orders.payment_method sau chuẩn hóa: trim; rỗng => "Chưa xác định"; tra bảng nhãn (const map, đặt cạnh constants/orders.ts); không có trong bảng => dùng chính giá trị thô đã trim.
RULE-15: Bảng nhãn khởi tạo: cash => "Tiền mặt"; cash_on_delivery => "Tiền mặt"; (rỗng) => "Chưa xác định". Các nhóm có cùng nhãn hiển thị phải được gộp (cộng dồn) thành một dòng, kể cả giá trị thô trùng nhãn đã tồn tại.
RULE-16: Mỗi nhóm thanh toán gồm: label, orderCount, revenue, shippingFee. Σ nhóm = tổng kỳ.
RULE-17: Tiền: tính tổng bằng kiểu chính xác trong SQL (cast về numeric/double rồi cộng, không SUM trực tiếp cột real), làm tròn về số nguyên đồng (ROUND) rồi trả về JS number nguyên. Không hiển thị phần thập phân.
RULE-18: Mọi con số báo cáo (màn hình, tổng, số đơn, nhóm thanh toán, Excel) phải đi qua CÙNG một hàm service để không lệch giữa màn hình và Excel.
RULE-19: Dữ liệu trả xuống client chỉ gồm số đã tổng hợp; không trả danh sách đơn, SĐT, tên khách, không có field isEnabled.
RULE-20: Endpoint dữ liệu và Excel yêu cầu access token hợp lệ (proxy chặn khi thiếu cookie; withAuth verify chữ ký/hạn). Mọi tài khoản đăng nhập được xem (không kiểm tra role) - khoảng trống tạm thời đã ghi nhận.
RULE-21: Excel sinh ở server bằng exceljs (Node runtime, không Edge); ô tiền/số đơn là number; tên file bao-cao-doanh-thu_<start>_<end>.xlsx; Content-Type application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; Content-Disposition attachment; Cache-Control no-store.
RULE-22: Không thêm cột/bảng DB, không migration. Chỉ thêm dependency exceljs.
RULE-23: /admin/register luôn bị đóng: trang không render form; registerAction và registerUser từ chối vô điều kiện; không còn đường tạo user từ web. Việc tạo admin chỉ qua script/SQL chạy tay.
RULE-24: Thêm route reports vào ADMIN_ROUTE/adminRoutes (key "reports", path "/admin/reports") và API tương ứng; không đổi/không xóa route hiện có. Dashboard giữ nguyên.
RULE-25: Admin UI chỉ tiếng Việt, không i18n, không đụng messages/*.json. proxy.ts không được cho /admin/reports hay /admin/api/reports đi qua next-intl.
```

## 6. Data Entities & Constraints

Không có bảng/cột mới. Dùng các bảng hiện có (chỉ đọc):

- **orders** (`dbSchema`): `id`, `status` (varchar; chỉ 'completed' được tính), `paymentMethod` (varchar(50) NOT NULL; có thể là `cash` từ web checkout, `cash_on_delivery`, giá trị lạ, hoặc chuỗi rỗng), `shippingFee` (real, default 0), `totalPrice` (real NOT NULL, đã gồm ship), `isEnabled` (boolean default true), `createdAt` (timestamptz NOT NULL). Quan hệ 1-n với `order_items`.
- **order_items**: `orderId`, `totalPrice` (real = quantity*price + tổng addon), `isEnabled` (boolean default true). Chỉ dùng để trừ item tắt; addon nằm trong `totalPrice` của item nên không cần join `order_item_addons`.
- **Thực thể tính toán (không lưu, chỉ là type trả về)**:
  - `RevenueReportQuery`: `preset` (enum today|yesterday|last7|this_month|last_month|custom, optional) ; `start_date`, `end_date` (YYYY-MM-DD, bắt buộc khi custom).
  - `RevenueReport`: `range {start, end, days}`, `summary {revenue, orderCount, shippingFee}`, `daily[] {date, orderCount, shippingFee, revenue}`, `byPayment[] {label, orderCount, shippingFee, revenue}`. Tất cả số là integer VND. TUYỆT ĐỐI không có `isEnabled`.
  - `PAYMENT_METHOD_LABEL`: const map thô -> nhãn (RULE-15), fallback "Chưa xác định" cho rỗng.
- **users** (đọc/ghi bị chặn): `registerUser` không còn tạo bản ghi.

Lưu ý: `enum PaymentMethod` hiện chỉ có `cash_on_delivery` và `ORDER_PAYMENT_METHOD` chỉ một nhãn; KHÔNG sửa enum này (ngoài phạm vi, sprint thanh toán sau sẽ chuẩn hóa), tạo bảng nhãn riêng cho báo cáo.

## 7. Edge Cases Registry

```
EC-01 [RULE-02,03]: Đơn tạo 00:00:00-06:59:59 giờ VN (tức 17:00-23:59 UTC ngày hôm trước) => thuộc ngày VN đó, không thuộc ngày UTC. Nếu cắt theo UTC sẽ lệch về ngày trước; phải đúng ngày VN.
EC-02 [RULE-02,03]: Đơn đúng 00:00:00.000 giờ VN ngày D (=17:00:00.000 UTC ngày D-1) => thuộc ngày D, bắt đầu của khoảng [D,..]. Đơn 23:59:59.999 VN ngày D (=16:59:59.999 UTC) => thuộc D. Điều kiện cuối nửa mở "< ngày kế 00:00" đảm bảo không mất mili-giây cuối.
EC-03 [RULE-05]: Ranh giới tháng: "Tháng này" vào ngày mùng 1 => 1 ngày [1,1]; lúc 00:30 ngày mùng 1 giờ VN (vẫn là 17:30 ngày cuối tháng trước theo UTC) => "Tháng này" phải là tháng MỚI, "Tháng trước" là tháng vừa kết thúc. Tháng trước của tháng 1 => tháng 12 năm trước. Tháng trước có 28/29/30/31 ngày đều đúng (năm nhuận 29/02).
EC-04 [RULE-05]: "7 ngày qua" qua ranh giới tháng/năm (vd T = 03/01) => [28/12, 03/01] đủ 7 dòng, tính đúng qua năm.
EC-05 [RULE-07]: start > end => 400, thông báo tiếng Việt; UI không gọi lại với dữ liệu cũ gây hiểu nhầm.
EC-06 [RULE-07]: Khoảng > 366 ngày (hoặc nhập năm 0001/9999) => 400, không sinh chuỗi ngày khổng lồ, không timeout; tương tự khi gọi thẳng Excel.
EC-07 [RULE-06]: Tham số ngày thiếu, rỗng, sai định dạng ("2026/10/01", "abc", "2026-13-40", "2026-02-30") hoặc preset lạ => 400 với message; không rơi về mặc định âm thầm khi người dùng đã gửi giá trị sai. Chỉ khi KHÔNG gửi gì mới dùng mặc định tháng này.
EC-08 [RULE-05]: preset=custom nhưng thiếu start hoặc end => 400.
EC-09 [RULE-08,09]: Đơn enabled nhưng TOÀN BỘ item tắt (tài khoản thường) => đơn vẫn được đếm (OQ-01), doanh thu = totalPrice - Σ item tắt = phần còn lại (thường chỉ phí ship); ship vẫn tính vào cột ship. Với talo_kitchen đơn tính nguyên totalPrice.
EC-10 [RULE-08]: Đơn có một số item tắt và addon bên trong => trừ `order_items.totalPrice` (đã gồm addon), không trừ addon lần hai; kiểm tra không trừ trùng khi join (dùng subquery/CTE gộp theo order_id trước khi join để không nhân bản dòng đơn).
EC-11 [RULE-09,10]: Đơn `orders.isEnabled=false` + completed trong kỳ: tài khoản thường không thấy; talo_kitchen thấy và tính đủ. Hai tài khoản mở cùng kỳ phải thấy hai bộ số khác nhau theo đúng quy tắc, và không bị cache chung (không dùng cache dùng chung giữa 2 người dùng).
EC-12 [RULE-17]: totalPrice/shippingFee là real (float4): SUM trực tiếp float4 cộng dồn sai số; real::numeric của Postgres chỉ giữ ~6 chữ số có nghĩa (vd 1234567 có thể thành 1234570). Phải cast qua double precision (::float8::numeric) hoặc cách tương đương đã kiểm chứng, rồi ROUND; kiểm thử với giá trị >= 1.000.000 và tổng >= 16.777.216 (2^24, ngưỡng float4 mất độ chính xác số nguyên). Giá trị lẻ (vd 25000.5 do dữ liệu bẩn) => làm tròn cuối, không hiện "25000.499999".
EC-13 [RULE-08]: Trừ item tắt làm doanh thu đơn âm hoặc lệch số lẻ do float (dữ liệu bất nhất) => không crash; giữ đúng phép trừ sau làm tròn như danh sách đơn; không tự clamp (nếu muốn clamp phải hỏi lại). Đánh dấu là rủi ro dữ liệu, không phải lỗi báo cáo.
EC-14 [RULE-14,15]: paymentMethod lạ ("bank_transfer", "Momo", "CASH") => hiện nguyên giá trị thô (đã trim), phân biệt hoa/thường ("CASH" khác "cash", hiện "CASH" thô); không throw, không bị mất khỏi tổng.
EC-15 [RULE-14]: paymentMethod = "" hoặc "   " => "Chưa xác định". Hai giá trị khác nhau nhưng cùng nhãn (cash + cash_on_delivery) => một dòng duy nhất. Giá trị thô có ký tự đặc biệt/HTML/công thức Excel (vd "=SUM(A1)", "<b>x") => UI render dạng text (React tự escape); Excel ghi như chuỗi (không để thành công thức), tránh CSV/Excel injection (không bắt đầu bằng = + - @ được diễn giải thành công thức: ghi kiểu string).
EC-16 [RULE-13]: Kỳ không có đơn nào => daily đủ N dòng 0, byPayment rỗng, summary 0; Excel vẫn hợp lệ.
EC-17 [RULE-13]: Kỳ có đơn ở mọi ngày hoặc chỉ ngày đầu/cuối => không thiếu/thừa ngày; ngày cuối cùng (end) luôn có mặt.
EC-18 [RULE-02]: DST không áp dụng cho Việt Nam (UTC+7 cố định); không viết logic DST/giờ mùa hè. Không dùng offset cứng trong SQL nếu 'Asia/Ho_Chi_Minh' có sẵn; nếu server Postgres thiếu tzdata thì dùng '+07:00' tương đương (kiểm chứng ở môi trường dev/prod).
EC-19 [RULE-20]: Người dùng không đăng nhập gọi trực tiếp API dữ liệu hoặc Excel (curl, không cookie) => 401 từ proxy ("Chưa xác thực"); cookie có access token hết hạn => response access-token-expired (cơ chế withAuth hiện có) và UI xử lý như các trang admin khác (refresh); token giả mạo => 401. Tuyệt đối không trả số liệu/file.
EC-20 [RULE-11,19]: Client thêm `?include_disabled=1`, `?is_enabled=...` => bỏ qua; tài khoản thường không bao giờ thấy số liệu của đơn tắt.
EC-21 [RULE-23]: `/admin/register` qua GET (chưa/đã đăng nhập) => 404 hoặc redirect login, không form. Gọi `registerAction` trực tiếp qua POST server action (curl với Next-Action id, hoặc từ bundle cũ còn cache trên trình duyệt) => bị từ chối, không tạo user. Lưu ý server action là endpoint độc lập với trang: chỉ ẩn trang là KHÔNG đủ; proxy hiện cho /admin/register đi qua không cần đăng nhập, nên cũng phải chặn ở action/service.
EC-22 [RULE-23]: Đóng đăng ký không được vô tình khóa chủ quán ngoài hệ thống: đảm bảo đã có ít nhất 1 tài khoản (vd talo_kitchen) đăng nhập được trước khi deploy; login/refresh không đổi.
EC-23 [RULE-21]: Tên file có khoảng ngày: ngày ở tên là ngày VN đã chọn (không phải ngày server UTC). Trình duyệt tải được với tên có dấu gạch dưới/gạch ngang; không dấu tiếng Việt, không khoảng trắng.
EC-24 [RULE-21]: Excel với khoảng lớn (366 ngày) vẫn sinh nhanh, không vượt giới hạn thời gian/ bộ nhớ của serverless function; request Excel hủy giữa chừng không để lại tiến trình treo.
EC-25 [RULE-18]: Người dùng bấm Xuất Excel ngay sau khi dữ liệu thay đổi (đơn mới hoàn thành) => số trong file có thể khác số đang hiển thị trên màn hình; chấp nhận (đọc DB real-time), file ghi thời điểm xuất ("Xuất lúc ... giờ VN").
EC-26 [RULE-01]: Đơn đổi trạng thái completed -> cancelled sau đó => biến mất khỏi báo cáo ở lần tải sau (không cache snapshot).
EC-27 [RULE-24,25]: Truy cập /admin/reports qua URL có query dư/ locale prefix ("/vi/admin/reports") => admin không được next-intl xử lý; "/vi/admin/..." coi là route web, 404.
EC-28 [RULE-08]: Đơn có `orders.isEnabled=true` nhưng item `isEnabled=false` thuộc đơn `status != completed` => không ảnh hưởng báo cáo (đơn bị loại ở RULE-01).
```

## 8. Integration Touchpoints

- **PostgreSQL (Drizzle, `getDb()`)**: một (hoặc vài) truy vấn tổng hợp raw SQL/`sql` template: `orders` LEFT JOIN subquery tổng item tắt theo `order_id`; `generate_series` cho ngày; `GROUP BY` ngày và theo `payment_method`. Lỗi DB => 500 JSON (qua `withError`), UI hiển thị thông báo thử lại, không crash trang.
- **Auth**: `withAuth` (`src/providers/withAuth.ts`) + `verifyAccessToken`; payload có `username` dùng cho `isTaloKitchen`. Trang là server component dùng `verifyAdminAuth`/layout dashboard hiện có. Lỗi: 401 "Chưa xác thực", token hết hạn => `createAccessTokenExpiredResponse` (client refresh theo cơ chế sẵn có).
- **`src/proxy.ts`**: `/admin/reports` và `/admin/api/reports/*` thuộc nhánh yêu cầu cookie (không đổi logic). Phải sửa nhánh `/admin/register`: hiện bypass auth, cần trả 404/redirect (hoặc để page tự `notFound()`), kèm tests hồi quy cho login.
- **`exceljs`** (thư viện mới): server-only, Node runtime; trả buffer qua `NextResponse` với header attachment. Lỗi tạo file => 500 JSON.
- **Client -> server**: trang gọi `GET /admin/api/reports/revenue?preset=...|start_date&end_date` (JSON) và `GET /admin/api/reports/revenue/export?...` (xlsx, tải qua link/`window.location`/fetch blob). Cả hai dùng chung validate query (zod) và chung service (RULE-18).
- **Sidebar** `Menu.tsx` (client component dùng `adminRoutes`).
- **Services khác**: `src/services/orders.ts` (tham khảo `omitEnabled`, `getDisabledItemTotals`; không sửa hành vi hiện có, nên thêm service mới `src/services/reports.ts` thay vì sửa `getAdminOrderTable`).
- **`src/actions/admin/auth.ts` / `src/services/auth.ts`**: chặn `registerAction`, `registerUser`.

## 9. Non-functional Requirements

- **NFR-01 Performance**: Với khoảng tối đa 366 ngày và vài chục nghìn đơn, response dữ liệu < 2 giây ở điều kiện bình thường; số truy vấn DB cố định (không N+1, không lặp theo ngày/đơn); chỉ tải dữ liệu đã tổng hợp. Excel tạo < 5 giây cho 366 ngày. (Ngưỡng này do tôi đặt làm mục tiêu thiết kế, không nằm trong docs nguồn.)
- **NFR-02 Security (authn)**: Mọi endpoint báo cáo/Excel chỉ phục vụ request có access token hợp lệ (RULE-20, EC-19). Không role check (khoảng trống tạm thời, ghi vào backlog: câu 6.1 chủ quán/quản lý).
- **NFR-03 Security (data exposure)**: Không trả `isEnabled`, mã đơn, tên/SĐT khách xuống client; `includeDisabled` chỉ lấy từ token (RULE-11, RULE-19).
- **NFR-04 Security (input)**: Validate toàn bộ query bằng zod; chỉ truyền tham số vào SQL qua parameter (drizzle `sql` template), không nối chuỗi; whitelist preset; giới hạn độ dài khoảng.
- **NFR-05 Security (registration)**: Không còn đường tạo tài khoản qua web; server action và service tự bảo vệ (EC-21).
- **NFR-06 Correctness**: Cắt ngày VN ở SQL; số tiền chính xác tới đồng (RULE-17, EC-12); số trên màn hình = số trong Excel (RULE-18).
- **NFR-07 Accessibility (UI)**: Nút chọn nhanh là `button` có nhãn; điều khiển ngày có label; bảng dùng `table/th` đúng ngữ nghĩa; trạng thái loading/lỗi/rỗng có văn bản. Mức cơ bản, không yêu cầu chuẩn WCAG đầy đủ.
- **NFR-08 i18n**: Không i18n, admin tiếng Việt (ràng buộc version). Định dạng tiền vi-VN, ngày DD/MM/YYYY.
- **NFR-09 Responsive**: Trang dùng được trên màn hình máy tính bảng/di động rộng tối thiểu; bảng ngày cuộn ngang được khi hẹp. (Mức cơ bản.)
- **NFR-10 Observability**: Lỗi server log qua `console.error` như pattern hiện có; không log dữ liệu nhạy cảm.
- **NFR-11 Dependency**: Chỉ thêm `exceljs`; không thêm moment-timezone/date-fns (dùng SQL + helper nhỏ trong `src/lib/date.ts`, ví dụ `todayVN()` và `addDays`).

## 10. Regression Impact

Các phần có sẵn có thể bị ảnh hưởng, cần qa-guard chạy lại happy path:

- **Auth/login (`src/proxy.ts`, `src/actions/admin/auth.ts`, `src/services/auth.ts`, `LoginForm.tsx`, `/admin/login`)**: Phải giữ: đăng nhập thành công/thất bại, redirect callback_url, user đã đăng nhập vào `/admin/login` được redirect, refresh token (`/admin/api/auth/refresh-token`), logout. Chỉ `register` bị đóng; không đổi `loginUser`, `refreshAccessToken`. `REGISTER_SECRET_CODE` vẫn được validate env như cũ (OQ-04).
- **Proxy admin routing**: Các route `/admin/*`, `/admin/api/*` chưa đăng nhập vẫn lần lượt redirect login / 401; web user routes (`/`, `/menu`, `/vi/...`), `/api/*`, file tĩnh vẫn qua đúng nhánh next-intl (kiến trúc sprint-1 i18n, không đụng).
- **Constants route (`src/constants/route.ts`)**: thêm key mới không làm đổi key/hàm cũ; `generateRoute` type vẫn biên dịch. `adminRoutes.register` hiện chỉ dùng ở proxy và route đăng ký; nếu xóa/đổi phải cập nhật proxy.
- **Sidebar (`Menu.tsx`, `MenuItem`)**: thêm 1 item; các item cũ, active-state, màu đỏ của talo_kitchen (`highlight`) giữ nguyên; collapse "Cài đặt" không đổi.
- **Orders (danh sách và chi tiết)**: Không sửa `getAdminOrderTable`, `getAdminOrderById`, `getDisabledItemTotals`, `omitEnabled`, `getNewOrdersSince`, toggle bật/tắt. Nếu có refactor dùng chung helper, kết quả danh sách đơn của tài khoản thường (đơn tắt ẩn, tổng đơn đã trừ item tắt, không có isEnabled) và của talo_kitchen (thấy tất cả, có isEnabled) phải y hệt trước.
- **Bảng DB `orders`, `order_items`**: chỉ đọc; không migration, không thay đổi schema; truy vấn nặng không được khóa/ảnh hưởng ghi đơn mới từ checkout (SELECT thường, không lock).
- **Dashboard (`/admin/dashboard`)**: vẫn redirect sang Products.
- **`package.json`**: thêm `exceljs`; build Next 16 (Turbopack) phải thành công, `exceljs` không lọt vào client bundle, build không lỗi do package Node-only; cân nhắc `serverExternalPackages` nếu cần (architect quyết).
- **`src/lib/date.ts`**: nếu thêm helper, không đổi `formatDateVN` (dùng rộng rãi).
- **Env (`src/lib/env.ts`)**: không bắt buộc biến mới.

## 11. Definition of Done

- Tất cả AC Story-01..08 đạt; không còn Open Question chặn (OQ mặc định được ghi rõ nếu user không trả lời).
- Số liệu báo cáo của tài khoản thường khớp tay với danh sách Orders (completed, cùng khoảng ngày VN) bao gồm trường hợp có đơn tắt và item tắt; số liệu của `talo_kitchen` khớp tổng `totalPrice` gốc.
- Kiểm thử ranh giới giờ VN (EC-01, EC-02, EC-03) và real/float (EC-12) có test hoặc truy vấn kiểm chứng trên DB dev.
- Excel mở được bằng Excel/LibreOffice, ô tiền là number, tên file đúng, số khớp màn hình.
- Chưa đăng nhập: API dữ liệu và Excel trả 401; `/admin/register` không tạo được user bằng cả trang lẫn server action (đã thử gọi trực tiếp action).
- Response/RSC payload không chứa `isEnabled` (kiểm tra bằng devtools/log).
- NFR-01..NFR-11 đáp ứng ở mức đã nêu; không thêm cột/bảng/migration; chỉ thêm dependency `exceljs`.
- Hồi quy: login/refresh/logout, sidebar cũ, Orders list/detail/toggle, web user (i18n routing) không đổi; `lint`, `tsc`, `build` thành công.
- Tài liệu: ghi khoảng trống phân quyền (câu 6.1) vào backlog sprint sau; ghi hướng dẫn tạo admin qua script/SQL; ghi lại rằng `REGISTER_SECRET_CODE` đã không còn tác dụng.
