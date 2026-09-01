# Deploy prod → Multi-language (blue/green)

**Ý tưởng:** `prod` = bản cũ (giữ nguyên để rollback). `prod_v2` = clone + migrate. Cắt = đổi env `DB_SCHEMA` trên Vercel. Rollback = đổi lại.

🧑 = bạn làm · 🤖 = nhờ Claude

---

### Chuẩn bị
- [ ] 🧑 Backup `prod` (Supabase PITR hoặc snapshot).
- [ ] 🧑 Có prod connection string **port 5432**.

### Dựng `prod_v2`
- [ ] 🧑 Clone schema: `pg_dump --schema=prod` → đổi tên `prod`→`prod_v2` → restore. *(🤖 nhờ mình viết `clone-schema.sh` cho gọn)*
- [ ] 🧑 Tạo bảng + seed: chạy `deploy/prod_v2_entity_migration.sql` → đọc phần VERIFY phải toàn `OK`.
- [ ] 🧑 Migrate config: `DB_SCHEMA=prod_v2 DATABASE_URL="<prod-5432>" npm run migrate:configs-i18n`

### Test trước khi cắt
- [ ] 🤖 Mình mở PR `feature/multi-language` → `main`.
- [ ] 🧑 Vercel: tạo **Preview** với env `DB_SCHEMA=prod_v2` → bấm thử vài trang /en, /vi, đặt 1 order.

### Cắt
- [ ] 🤖 Mình merge PR → `main`.
- [ ] 🧑 Vercel Production: set `DB_SCHEMA=prod_v2` → deploy.
- [ ] 🧑 Bấm thử prod 2–3 phút. Ghi lại giờ cắt.

### Nếu lỗi → rollback
- [ ] 🧑 Vercel: set `DB_SCHEMA=prod` + Instant Rollback về bản cũ. Xong.
- [ ] 🧑 Nếu đã có order mới vào `prod_v2`: nhờ 🤖 chạy script copy ngược về `prod`. *(🤖 nhờ mình viết sẵn `reconcile.ts`)*

---

**Tóm tắt file/lệnh:**
| Việc | Chạy |
|---|---|
| Tạo bảng translation + seed en | `deploy/prod_v2_entity_migration.sql` (SQL editor) |
| Migrate config JSON | `npm run migrate:configs-i18n` (Node, `DB_SCHEMA=prod_v2`) |
| Rollback config | `npm run rollback:configs-i18n` |
| Rollback bảng translation | `npm run rollback:entities-i18n` |

⚠️ **Thứ tự bắt buộc:** bảng translation phải tạo **trước** khi code mới chạy (query sẽ lỗi nếu chưa có bảng). Config thì linh hoạt. Trong blue/green, mọi migrate làm trên `prod_v2` trước khi cắt nên không lo.
