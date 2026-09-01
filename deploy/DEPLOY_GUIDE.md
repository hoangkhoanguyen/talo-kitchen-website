# Deploy prod → Multi-language (blue/green)

**Ý tưởng:** `prod` = bản cũ (giữ nguyên để rollback). `prod_v2` = clone + migrate. Cắt = đổi env `DB_SCHEMA` trên Vercel. Rollback = switch Vercel về deployment cũ.

🧑 = bạn làm · 🤖 = nhờ Claude

---

### 1. Dựng `prod_v2` (1 lệnh)
- [ ] 🧑 Backup `prod` (Supabase PITR/snapshot).
- [ ] 🧑 `npm install` (nếu máy chưa có deps).
- [ ] 🧑 Chạy script — điền `DATABASE_URL` **root, port 5432**:
  ```bash
  DATABASE_URL="postgresql://USER:PASS@HOST:5432/postgres" npx tsx deploy/upgrade-to-v2.ts
  ```
  Script tự: clone `prod`→`prod_v2` → tạo 3 bảng translation + seed `en` → migrate config JSON → verify. `prod` KHÔNG bị đụng. In "✅ XONG" là được.
  - Chạy lại (nếu cần): thêm `DROP_TARGET=1` để xoá `prod_v2` cũ rồi clone lại.

### 2. Cắt
- [ ] 🤖 Mình mở PR `feature/multi-language` → `main` + merge (khi bạn ok).
- [ ] 🧑 Vercel: (khuyến nghị) test **Preview** với `DB_SCHEMA=prod_v2` trước; rồi Production set `DB_SCHEMA=prod_v2` → deploy.
- [ ] 🧑 Test trực tiếp trên prod (quán chưa mở → an toàn).

### 3. Rollback (nếu lỗi)
- [ ] 🧑 Vercel → **Instant Rollback** về deployment cũ. **XONG — không cần đổi env.**
  > Code cũ hardcode schema `prod`, không đọc `DB_SCHEMA` → tự khắc đọc lại `prod`.
  > (Nên đổi env về `prod` sau đó cho sạch, để lần deploy code mới sau không lỡ trỏ `prod_v2`.)
- Quán chưa mở nên không có data khách mới → rollback sạch, khỏi reconcile.

---

**Lệnh phụ (khi cần):**
| Việc | Lệnh |
|---|---|
| Làm lại từ đầu | thêm `DROP_TARGET=1` vào lệnh script |
| Rollback config (nếu chạy nhầm schema nào đó) | `DB_SCHEMA=<schema> npm run rollback:configs-i18n` |
| Bỏ hẳn prod_v2 | `DROP SCHEMA prod_v2 CASCADE;` |

**Yêu cầu:** script cần role **tạo được schema + function** (root/owner). Đã verify trên dev: guard + flow + entity DDL + seed + config logic chạy đúng; riêng bước clone chỉ chạy được bằng root (dev role bị chặn `CREATE SCHEMA`). Script có verify row-count nguồn↔đích tự động, lệch là nó dừng ngay.
