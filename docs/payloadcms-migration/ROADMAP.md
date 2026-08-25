# Talo Kitchen → PayloadCMS Migration Roadmap

Chuyển toàn bộ app `talo-kitchen` (Next.js 16 + Drizzle + Postgres + custom admin + custom JWT auth + Cloudflare R2) sang **PayloadCMS 3.88**, gồm cả backend/admin lẫn frontend customer-facing, migrate toàn bộ data hiện có.

## Quyết định đã chốt (locked decisions)

| Chủ đề | Quyết định |
|---|---|
| Công cụ scaffold | `npx create-payload-app` (template `blank`, db postgres) |
| Vị trí | Folder sibling `../talo-kitchen-payload`. Repo cũ `talo-kitchen` giữ nguyên làm **reference read-only** |
| Next.js | Giữ **Next 16** — Payload 3.88 hỗ trợ chính thức `>=16.2.6 <17` (template dùng 16.3.0). Không downgrade |
| Database | **Supabase Postgres (dev)**, schema **`dev`** (rỗng lúc đầu). Payload adapter dùng `schemaName: 'dev'`. Tách hoàn toàn khỏi DB app cũ. Credential lưu ở memory `dev-database-credentials`. ⚠️ Pooler port 6543 không hỗ trợ prepared statements → migrations DDL cân nhắc dùng session/direct connection (5432) |
| Rich text | **Plain text/textarea** cho description/subDescription/allergenInfo/note (parity, không dùng Lexical) |
| Localization | **Không bật** Payload i18n. Giữ convention: frontend EN, admin VI hardcode như hiện tại |
| Auth model | **2 collection tách biệt**: `users` (auth-enabled, thay JWT cũ) + `customers` (no-auth, upsert theo phone) |
| Session revocation | **Chấp nhận auth mặc định Payload** — bỏ bảng `refresh_tokens` + cơ chế revoke server-side |
| Admin UI | **Bỏ hẳn** admin tự build, dùng Payload admin UI (RBAC theo `users.role`) |

## Điểm cần xử lý phát hiện trong code cũ (tech debt / bug)

- Schema Postgres cũ tên **`prod`** (không phải `public`) — app mới dùng schema mặc định của Payload.
- **Order code & reservation code sinh random KHÔNG đảm bảo unique** (`Math.random().toString(36)` / `'LFW'+random`) nhưng cột có `unique` → có thể throw khi trùng. Fix: unique index + retry, hoặc counter/nanoid.
- `registerUser` **luôn ép `role='admin'`** bất kể input → cần RBAC thật trong Payload.
- `orders.updatedAt` là `timestamp` **không timezone**, lệch với mọi bảng khác (đều `withTimezone`) → chuẩn hoá khi migrate.
- **bcrypt salt rounds không đồng nhất** (registerUser=12, hashPassword default=10) → Payload tự quản hashing, chuẩn hoá luôn.
- `orderType`/`order.status` enum **bị comment, không enforce ở DB** → dùng select field có option cố định trong Payload.
- Route `/api/revalidate-all` **không auth** → thêm auth hoặc bỏ ở app mới.
- `@aws-sdk/s3-request-presigner` là dependency nhưng **không thực sự dùng presigned URL** → không cần port.

## Câu hỏi mở (chưa chốt)

- **Deployment target** cho app mới (Vercel / VPS / Docker...). Payload cần Node server bền (không edge-only). Ảnh hưởng feature 1 (scaffold env) và 11 (cutover). → cần chốt trước khi tới feature 11.
- Có giữ **các file R2 đã upload** (URL `assets.talokitchenhg.com`) reachable như cũ, hay đổi key/prefix theo cấu trúc Media của Payload? → chốt ở feature 7. (Đã chọn: giữ key phẳng, không prefix.)
- ⚠️ **[cần user] R2 env lệch bucket** (phát hiện sprint-7): `.env` có `R2_BUCKET_NAME=linh-dev` nhưng `R2_PUBLIC_URL=https://assets.talokitchenhg.com` fronts bucket khác → upload vào `linh-dev` OK nhưng GET public 404. Cần chốt cặp bucket↔domain cho dev (hoặc lấy r2.dev URL của `linh-dev`, hoặc đổi bucket sang cái mà domain fronts). Ảnh hưởng hiển thị ảnh ở sprint-9.

## 11 Feature theo thứ tự dependency

| # | Feature (folder) | Nội dung | depends_on |
|---|---|---|---|
| 1 | `01-scaffold-payload-app` | create-payload-app → sibling; cấu hình db-postgres (DB mới) + storage-s3 (R2); env; viết INVENTORY.md | — |
| 2 | `02-products-catalog-collections` | Collections: Categories, Products (relatedProducts as relationship hasMany, addons + images), field validation | 1 |
| 3 | `03-customers-and-auth-collections` | `Customers` (no-auth) + `Users` (auth-enabled) thay JWT; RBAC theo role | 1 |
| 4 | `04-reservations-collection` | Reservations + status history + hooks (guard note, sinh code unique, ghi lịch sử) | 3 |
| 5 | `05-orders-collection-and-hooks` | Orders + OrderItems + OrderItemAddons + status history; hook validate giá server-side (chống tamper); upsert customer | 2,3 |
| 6 | `06-configs-and-settings-globals` | Chuyển bảng `configs` (jsonb + meta-schema) → Payload **Globals** có field thật (order/reservation/homepage/menu_page/reservation_page) | 1 |
| 7 | `07-media-r2-storage-migration` | Media collection + `@payloadcms/storage-s3` trỏ R2 bucket cũ | 1 |
| 8 | `08-data-migration-scripts` | Script (tsx) đọc schema **`dev_for_migrate`** (clone prod, read-only) → ghi qua Payload Local API vào schema `dev`; đúng thứ tự FK; map `legacyId` old→new; re-point mọi FK + relatedProductIds. Dataset nhỏ (19 products, 44 images, 6 configs...) | 2,3,4,5,6,7 |
| 9 | `09-frontend-customer-facing-port` | Port trang web (home/menu/dish/cart/checkout/reservation) + zustand + react-query → đọc Payload; giữ tag revalidation & SEO | 2,4,5,6,7 |
| 10 | `10-admin-ui-cleanup` | Xác nhận bỏ admin cũ, cấu hình Payload admin (list view, filter, RBAC) đủ dùng cho staff | 2,3,4,5,6 |
| 11 | `11-cutover-and-cleanup` | Chốt deployment, migrate delta, verify R2, cắt traffic, dọn dead code | 8,9,10 |

## Cách làm việc (rolling planning)

- Mỗi feature có `PLAN.md` + `TEST_CASES.md` riêng trong `docs/payloadcms-migration/<folder>/`.
- Plan chi tiết cho feature sắp làm; feature xa hơn chỉ giữ mô tả ở roadmap này, plan chi tiết khi tới lượt (vì phụ thuộc thứ học được khi làm feature trước).
- Implement từng feature bằng `/implement-and-test` đúng thứ tự dependency.
- `INVENTORY.md` là checklist tick-off xuyên suốt: convert xong mẩu logic nào thì tick, cuối cùng nhìn là biết còn sót gì.
