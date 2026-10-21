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

---

## Cách B: không cần chạy script với DB (export -> dịch -> SQL)

Dùng khi không muốn đưa credential vào script. Chỉ cần DBeaver/Supabase SQL Editor.

1. Chạy query export (một ô JSON duy nhất) trên DB cần seed, lưu ra file `export-<schema>.json`.
   DBeaver bọc kết quả trong một lớp JSON ngoài; `offline.ts` tự tách lớp này.
2. `npx tsx scripts/i18n-vi/offline.ts extract export-<schema>.json todo.json` -> danh sách chuỗi chưa có `vi`.
3. Dịch `todo.json` thành `vi-<schema>.json` (key -> bản dịch, dùng `style-guide.md`).
4. `npx tsx scripts/i18n-vi/offline.ts sql export-<schema>.json vi-<schema>.json seed-vi-<schema>.sql`.
5. Mở `seed-vi-<schema>.sql` trong DBeaver, đọc lại, chạy cả file (`Alt+X`). File nằm trong `BEGIN ... COMMIT`.

SQL sinh ra không ghi đè `vi` đã có. Với `configs`, câu UPDATE chỉ khớp khi giá trị hiện tại còn y như lúc export,
nên báo `UPDATE 1` lần đầu; nếu khách vừa sửa config giữa lúc export và lúc chạy thì báo `UPDATE 0` (cần export lại).
Chạy lại file lần hai an toàn: phần bảng dịch không đổi gì, phần configs báo `UPDATE 0`.
Đã có sẵn cho schema `prod_v2`: `seed-vi-prod_v2.sql` (bản dịch ở `vi-prod_v2.json`).
