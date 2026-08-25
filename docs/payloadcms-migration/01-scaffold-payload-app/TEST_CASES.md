# Test Cases (Draft): Scaffold Payload App (Feature 1)

> Góc nhìn người dùng / người vận hành. Đây là bản nháp, tinh chỉnh khi implement.
> App mới: `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload`

---

## TC1 — App khởi động dev không lỗi và kết nối được DB mới

- **Tiền đề:** Đã scaffold xong, `.env` có `DATABASE_URI` trỏ DB `talo_payload` mới.
- **Các bước:**
  1. `cd .../talo-kitchen-payload`
  2. `npm run dev`
- **Kỳ vọng:**
  - Server chạy ở `http://localhost:3000`, không lỗi kết nối DB, không lỗi boot.
  - Payload tạo bảng trong schema `public` của DB mới (không đụng DB/schema `prod` của app cũ).

## TC2 — Trang /admin hiển thị màn hình tạo admin đầu tiên

- **Tiền đề:** Dev server đang chạy, DB mới trống.
- **Các bước:** Mở trình duyệt tới `http://localhost:3000/admin`.
- **Kỳ vọng:** Hiển thị màn hình "Create first user" (chưa có user nào).

## TC3 — Tạo được admin user đầu tiên và đăng nhập vào dashboard

- **Các bước:**
  1. Nhập email + password ở màn hình create first user.
  2. Submit.
- **Kỳ vọng:**
  - Tạo user thành công, tự đăng nhập, vào được Payload admin dashboard.
  - Thấy collection `Users` trong sidebar; user vừa tạo có mặt trong danh sách.

## TC4 — `generate:types` sinh file types thành công

- **Các bước:** `npm run generate:types` (hoặc `npx payload generate:types`).
- **Kỳ vọng:**
  - Lệnh chạy không lỗi.
  - File `src/payload-types.ts` được tạo/cập nhật, chứa type cho collection `Users`.

## TC5 — Storage adapter R2 được cấu hình, app boot không lỗi credentials

- **Tiền đề:** Đã `npm install @payloadcms/storage-s3` và thêm khung `s3Storage(...)` vào config.
- **Các bước:** Chạy `npm run dev` và quan sát log khởi động.
- **Kỳ vọng:**
  - App boot bình thường, không lỗi cấu hình plugin storage (endpoint/region/credentials hợp lệ).
  - (Lưu ý: chưa test upload ảnh thật ở feature 1 — Media collection + upload/verify qua
    `R2_PUBLIC_URL` thuộc **feature 7**.)

## TC6 — Git repo mới độc lập và có remote `legacy`

- **Các bước:**
  1. `cd .../talo-kitchen-payload`
  2. `git remote -v`
  3. `git status`
- **Kỳ vọng:**
  - Có remote tên `legacy` trỏ `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen`.
  - `.env` KHÔNG nằm trong staged/tracked (bị `.gitignore` bỏ qua) → không lộ secret.

## TC7 — Version thực tế đúng kỳ vọng, không peer-dep conflict chặn cài đặt

- **Các bước:** `npm ls next react payload @payloadcms/db-postgres @payloadcms/storage-s3 typescript`
- **Kỳ vọng:**
  - Next ~`16.3.0`, React ~`19.2.6`, Payload `3.88.0`, TypeScript `6.0.3`.
  - Không có `ERESOLVE`/peer-dep conflict làm hỏng cài đặt (nếu có cảnh báo, đã được note lại).
