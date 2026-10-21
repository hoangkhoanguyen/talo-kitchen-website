# Seed nội dung tiếng Việt vào DB

Điền phần `vi` cho: sản phẩm, danh mục, topping và các field `localized: true` trong UI config.
Không đụng slug, giá, ảnh, thứ tự. Chạy lại nhiều lần an toàn; **không bao giờ ghi đè** `vi` đã có (khách sửa tay vẫn giữ nguyên).

## Chuẩn bị (một lần)
1. `git pull` rồi `npm install`.
2. Copy `scripts/i18n-vi/env.example` vào `.env.local`, điền `DATABASE_URL`, `ANTHROPIC_API_KEY` (và `REVALIDATE_URL` nếu muốn). `DB_SCHEMA` truyền theo từng lệnh để khỏi nhầm môi trường.
3. (tuỳ chọn) Sửa `scripts/i18n-vi/style-guide.md` để chỉnh văn phong/thuật ngữ trước khi dịch.

## Quy trình
Làm trên dev/staging trước, rồi mới tới production.

```bash
# 1. Xem còn bao nhiêu chuỗi chưa có tiếng Việt (chỉ đọc)
DB_SCHEMA=dev_multi_lang npm run vi:check

# 2. Dịch bằng Claude -> ghi scripts/i18n-vi/vi.json (chưa đụng DB)
DB_SCHEMA=dev_multi_lang npm run vi:translate
#    Mở vi.json đọc nhanh, sửa chỗ nào chưa ưng (chỉ sửa trường "vi").

# 3. Thử ghi (dry-run, không ghi gì)
DB_SCHEMA=dev_multi_lang npm run vi:apply

# 4. Ghi thật (có backup + hỏi gõ lại tên schema để xác nhận)
DB_SCHEMA=dev_multi_lang npm run vi:apply -- --apply
```

Kiểm tra `/vi` trên dev. Ổn thì làm lại bước 3-4 với `DB_SCHEMA=prod` (hoặc `prod_v2`).
`vi.json` dùng chung cho mọi môi trường (key theo id), nhưng id sản phẩm giữa dev và prod có thể khác nhau;
nếu vậy hãy chạy lại `vi:translate` cho prod (dùng file `vi.json` mới) thay vì dùng lại file của dev.
Chuỗi không có trong DB đích sẽ bị bỏ qua và được báo "skipped (not in DB)".

## Trước khi ghi production
- Backup Supabase (Dashboard -> Database -> Backups) ngoài file backup tự động trong `scripts/backups/` (file này chứa dữ liệu thật, đã gitignore).
- Sau khi ghi: gọi `GET <domain>/api/revalidate-all` (tự động nếu có `REVALIDATE_URL`), rồi mở `/vi` kiểm tra từng trang.
- Chạy lại `vi:check`: kết quả mong đợi là 0 chuỗi thiếu.

## Rollback
Mỗi lần ghi tạo `scripts/backups/vi-content-seed-<time>.json` chứa nguyên các bảng dịch + configs trước khi ghi.
Muốn bỏ hẳn bản `vi` vừa seed: restore từ backup Supabase, hoặc từ file này.
