# Seed nội dung tiếng Việt vào DB

Điền phần `vi` cho: sản phẩm, danh mục, topping và các field `localized: true` trong UI config.
Không đụng slug, giá, ảnh, thứ tự. Chạy lại nhiều lần an toàn; **không bao giờ ghi đè** `vi` đã có (khách sửa tay vẫn giữ nguyên).

## Chuẩn bị (một lần)
1. `git pull` rồi `npm install`.
2. Copy `scripts/i18n-vi/env.example` thành 2 file ở thư mục gốc: `.env.dev` và `.env.prod`, điền `DATABASE_URL`, `DB_SCHEMA` (và `ANTHROPIC_API_KEY`, `REVALIDATE_URL` nếu cần). Chọn môi trường bằng `--env=dev` / `--env=prod`; script chỉ đọc đúng file đó.
3. (tuỳ chọn) Sửa `scripts/i18n-vi/style-guide.md` để chỉnh văn phong/thuật ngữ trước khi dịch.

## Quy trình
Làm trên dev/staging trước, rồi mới tới production.

```bash
# 1. Xem còn bao nhiêu chuỗi chưa có tiếng Việt (chỉ đọc)
npm run vi:check -- --env=dev

# 2. Dịch bằng Claude -> ghi scripts/i18n-vi/vi.json (chưa đụng DB)
npm run vi:translate -- --env=dev
#    Mở vi.json đọc nhanh, sửa chỗ nào chưa ưng (chỉ sửa trường "vi").

# 3. Thử ghi (dry-run, không ghi gì)
npm run vi:apply -- --env=dev

# 4. Ghi thật (có backup + hỏi gõ lại tên schema để xác nhận)
npm run vi:apply -- --env=dev --apply
```

Kiểm tra `/vi` trên dev. Ổn thì làm lại bước 3-4 với `--env=prod`.
`vi.json` dùng chung cho mọi môi trường (key theo id), nhưng id sản phẩm giữa dev và prod có thể khác nhau;
nếu vậy hãy chạy lại `vi:translate -- --env=prod` (dùng file `vi.json` mới) thay vì dùng lại file của dev.
Chuỗi không có trong DB đích sẽ bị bỏ qua và được báo "skipped (not in DB)".

## Trước khi ghi production
- Backup Supabase (Dashboard -> Database -> Backups) ngoài file backup tự động trong `scripts/backups/` (file này chứa dữ liệu thật, đã gitignore).
- Sau khi ghi: gọi `GET <domain>/api/revalidate-all` (tự động nếu có `REVALIDATE_URL`), rồi mở `/vi` kiểm tra từng trang.
- Chạy lại `vi:check`: kết quả mong đợi là 0 chuỗi thiếu.

## Rollback
Mỗi lần ghi tạo `scripts/backups/vi-content-seed-<time>.json` chứa nguyên các bảng dịch + configs trước khi ghi.
Muốn bỏ hẳn bản `vi` vừa seed: restore từ backup Supabase, hoặc từ file này.
