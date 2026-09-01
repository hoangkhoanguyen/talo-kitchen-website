# Deploy Guide — Upgrade prod sang bản Multi-language (i18n v1)

Chiến lược: **Blue/Green theo schema Postgres**, dùng env `DB_SCHEMA`.
- **Blue** = schema `prod` hiện tại → giữ nguyên, không đụng (bản rollback tức thì).
- **Green** = schema `prod_v2` (clone + migrate) → code mới trỏ vào.
- **Cắt** = đổi `DB_SCHEMA` trên Vercel. **Rollback** = đổi ngược lại.

> 🔑 **Vì sao phải tách schema:** migration config (sprint-2) đổi `configs.value` từ `"abc"` → `{en,vi}`. Code CŨ đọc config sẽ **vỡ** với cấu trúc mới. Bảng entity (sprint-3) thì additive (code cũ kệ nó). Giữ `prod` không-migrate = luôn có bản chạy được với code cũ để rollback.
>
> ⏱️ **Đánh đổi cần biết:** sau khi cắt, order/reservation/khách mới ghi vào `prod_v2`. Nếu rollback về `prod` thì phải **reconcile** các bản ghi đó (xem Phase 4). → Validate kỹ ở Phase 2, quyết go/no-go nhanh trong vài phút đầu.

**Ký hiệu:** 🧑 = bạn làm · 🤖 = Claude làm giúp (đã/đang chuẩn bị)

**Tài sản đã chuẩn bị sẵn (đã dry-run trên dev):**
- `deploy/prod_v2_entity_migration.sql` — DDL 3 bảng translation + seed `en` + verify (idempotent).
- `scripts/migrate-configs-i18n.ts` (npm `migrate:configs-i18n`) — migrate config JSON.
- `scripts/rollback-configs-i18n.ts`, `scripts/rollback-entities-i18n.ts` — rollback.

---

## Phase 0 — Pre-flight

- [ ] 🧑 Bật **Supabase PITR** hoặc tạo snapshot/`pg_dump` backup schema `prod`.
- [ ] 🧑 Chuẩn bị **prod connection string** (dùng **port 5432 session mode** cho DDL/migrate; port 6543 cho app runtime).
- [ ] 🧑 Xác nhận role chạy được DDL (`CREATE SCHEMA`, `CREATE TABLE`). Nếu role thường thiếu quyền, dùng **service_role** của Supabase / SQL editor (chạy như owner).
- [ ] 🧑 Quyết tên green schema (mặc định `prod_v2`).

## Phase 1 — Dựng Green (`prod_v2`)

**1.1 Clone `prod` → `prod_v2` (cấu trúc + data).** 🧑
```bash
# port 5432 (session mode)
pg_dump "$PROD_URL_5432" --schema=prod --no-owner --no-privileges -f /tmp/prod_dump.sql
# đổi tên schema trong dump (REVIEW file trước khi restore!)
sed -E 's/\bprod\./prod_v2./g; s/(SCHEMA )prod\b/\1prod_v2/gI' /tmp/prod_dump.sql > /tmp/prod_v2_dump.sql
psql "$PROD_URL_5432" -c 'CREATE SCHEMA prod_v2;'
psql "$PROD_URL_5432" -f /tmp/prod_v2_dump.sql
```
> ⚠️ `sed` dễ sai nếu có chuỗi chứa `prod` khác. **Đọc kỹ `/tmp/prod_v2_dump.sql`** trước khi restore. An toàn hơn: restore vào DB tạm → `ALTER SCHEMA prod RENAME TO prod_v2` → dump lại.
> 🤖 Nếu muốn, mình viết `deploy/clone-schema.sh` bọc bước này có guard kiểm tra.

**1.2 Tạo 3 bảng translation + seed `en`.** 🧑 (Supabase SQL editor hoặc psql)
```bash
psql "$PROD_URL_5432" -v ON_ERROR_STOP=1 -f deploy/prod_v2_entity_migration.sql
```
- File đã set `search_path TO prod_v2`. Nếu green schema tên khác → sửa dòng `SET search_path` đầu file.
- Đọc kết quả **PART 2 — VERIFY**: mọi cột `check` phải = `OK`. (🤖 đã dry-run trên dev: 40/4/15, content khớp, idempotent.)

**1.3 Migrate config JSON (sprint-2).** 🧑 (cần Node + repo)
```bash
DB_SCHEMA=prod_v2 DATABASE_URL="$PROD_URL_5432" npm run migrate:configs-i18n
```
- Script tự backup các row config `ui` trước khi update, idempotent. Đọc log xác nhận English gốc vào `en`, `vi` rỗng.

**1.4 Verify green tổng thể.** 🧑
- [ ] 3 bảng `*_translations` có trong `prod_v2`, count = 40/4/15 (hoặc theo data prod thật).
- [ ] Config `ui` đã thành `{en,vi}`; config `app` KHÔNG đổi.
- [ ] Cột gốc products/categories/addons nguyên vẹn.

## Phase 2 — Validate Green bằng Vercel Preview

- [ ] 🤖 Tạo PR `feature/multi-language` → `main` (mình làm khi bạn cho phép).
- [ ] 🧑 Tạo **Vercel Preview** deployment cho branch, set env `DB_SCHEMA=prod_v2` (+ `DATABASE_URL` prod).
- [ ] 🧑 Smoke test trên preview với data thật (checklist §Smoke test). Đặt 1 order test.
- [ ] 🧑 Quyết **go / no-go**.

## Phase 3 — Cutover

- [ ] 🤖 Merge PR → `main` (mình làm qua git khi bạn ok).
- [ ] 🧑 Vercel **Production env**: set `DB_SCHEMA=prod_v2` → trigger deploy production.
- [ ] 🧑 Smoke test prod ngay (2–3 phút, checklist §Smoke test).
- [ ] 🧑 Ghi lại **mốc thời gian cutover** (cho reconcile nếu phải rollback).
- [ ] 🧑 (Sau khi ổn) admin bắt đầu nhập nội dung tiếng Việt.

---

## Phase 4 — Rollback

| Tình huống | Hành động | Mất mát |
|---|---|---|
| Lỗi ở Phase 1/2 (chưa cắt) | Sửa trên `prod_v2`; hoặc `rollback:configs-i18n`/`rollback:entities-i18n` (DB_SCHEMA=prod_v2); hoặc `DROP SCHEMA prod_v2 CASCADE` làm lại. `prod` không đụng. | Không |
| Lỗi ngay sau cutover (vài phút, chưa có data khách mới) | 🧑 Vercel env `DB_SCHEMA=prod` + **Instant Rollback** về deployment cũ. Code cũ + `prod` (config string cũ) chạy lại y cũ. | ~0 |
| Lỗi sau khi đã có order/reservation thật vào `prod_v2` | 🧑 Flip về `prod` + deploy cũ, **RỒI reconcile** (copy row `created_at` > mốc cutover từ `prod_v2` → `prod`). 🤖 mình viết sẵn `reconcile-post-cutover` để chạy nhanh. | Cần reconcile |

**Nguyên tắc an toàn:** `prod` không bao giờ bị migrate → luôn rollback được bằng đổi env + deploy cũ. Dữ liệu English gốc giữ ở cột gốc (entity) + key `en` (config).

## Smoke test checklist (dùng cho Phase 2 & 3)

- [ ] `/` và `/vi` → 200, `<html lang>` đúng, đổi ngôn ngữ bằng switcher giữ trang + query.
- [ ] Menu / dish / reservation / cart / checkout ở cả en + vi; thiếu vi → fallback en, không vỡ.
- [ ] `/en/menu/all` redirect về `/menu/all` (as-needed); `/fr/...` → 404.
- [ ] Đặt 1 order + 1 reservation test → thành công, hiển thị đúng.
- [ ] Admin login → label vẫn tiếng Việt; form product/settings có tab EN/VI; lưu bản vi → hiện ở `/vi`.
- [ ] `/api/products/ids`, `/robots.txt`, `/sitemap.xml` → 200 (không bị prefix locale).
- [ ] Format tiền: `1.000.000 VND` (vi) vs `1,000,000 VND` (en); giá trị số không đổi.

---

## ⚠️ Ghi chú repo cần vá (không chặn deploy)

Commit `0c2eb14` (migration drizzle tạo 3 bảng translation, sprint-3 TASK-02) **bị mồ côi, không nằm trong HEAD** do commit song song lúc chạy tự động. Hệ quả:
- Code dùng 3 bảng CÓ trong HEAD (build + test pass vì bảng đã tồn tại thật trên `dev_multi_lang`).
- **File `src/db/migration/0001_flashy_morbius.sql` + drizzle journal thì THIẾU** ở HEAD.

→ Deploy prod KHÔNG bị ảnh hưởng (đã dùng `deploy/prod_v2_entity_migration.sql` độc lập). Nhưng nên vá để `drizzle-kit` tương lai nhất quán: khôi phục `0001_*.sql` + `meta/0001_snapshot.json` + entry `_journal.json` (Claude có thể làm — DDL đã cứu từ `git show 0c2eb14`).
