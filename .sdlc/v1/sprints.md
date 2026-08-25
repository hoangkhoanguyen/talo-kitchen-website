# v1 — Talo Kitchen → PayloadCMS 3.88 Migration

Business docs: `docs/payloadcms-migration/ROADMAP.md` + `docs/payloadcms-migration/INVENTORY.md`.
Rewrite/migration của app Next.js 16 + Drizzle + Postgres + custom admin + custom JWT + R2 sang PayloadCMS.
App mới scaffold ở sibling `../talo-kitchen-payload`. Stack kế thừa: **Payload 3.88 + Next 16.3 + React 19.2.6 + Postgres (Supabase) + Cloudflare R2 + TypeScript 6**.

DB dev (Supabase): nguồn `dev_for_migrate` (clone prod, read-only) → đích `dev` (Payload, `schemaName: 'dev'`).

---

## sprint-1-scaffold
- **Mô tả**: Scaffold Payload app ở sibling `../talo-kitchen-payload`; đấu DB Supabase (schema `dev`) + R2 storage; env + config baseline.
- **Features**: `create-payload-app` (blank/postgres); adapter `db-postgres` với `schemaName:'dev'`; khung `storage-s3` → R2; env (`DATABASE_URI`, `PAYLOAD_SECRET`, `R2_*`); git remote `legacy`; verify version + tạo admin đầu tiên.
- **depends_on**: —
- **Tech**: Payload 3.88, Next 16.3, Postgres/Supabase, R2
- **Status**: done (app scaffolded, schemaName 'dev' verified, admin seeded, committed 13876f2)

## sprint-2-products-catalog
- **Mô tả**: Model catalog: Categories + Products (validation, related products, addons, images).
- **Features**: collection `categories`; collection `products`; `relatedProducts` relationship hasMany→products; addons + images (array vs collection quyết ở đây); slug no-whitespace, price≥0.
- **depends_on**: sprint-1-scaffold
- **Status**: done (3 collections + hooks, smoke 5/5, commit 031071a)

## sprint-3-customers-and-auth
- **Mô tả**: 2 auth model: `customers` (no-auth, upsert theo phone) + `users` (auth-enabled thay JWT) với RBAC theo role.
- **Features**: collection `customers` (index phone); collection `users` (auth, email + field username); role select (admin/manager/user); access control; sửa bug ép role=admin.
- **depends_on**: sprint-1-scaffold
- **Status**: done (customers + users auth + RBAC, smoke 5/5, commit 9eab88c)

## sprint-4-reservations
- **Mô tả**: Reservations + status history + hooks vòng đời.
- **Features**: collection `reservations`; status select enum; sinh code unique (retry/counter); status-history (array vs collection); guard internalNote khi cancelled/completed.
- **depends_on**: sprint-3-customers-and-auth
- **Status**: done (reservations + status-history + hooks, smoke 11/11, commit 8f08326)

## sprint-5-orders
- **Mô tả**: Orders + line items + addon snapshot + status history + validate giá server-side.
- **Features**: `orders` + order-items + order-item-addons; hook beforeChange `validateOrderData` chống sửa giá; upsert customer; snapshot product/image/slug; code unique; status-history; chuẩn hoá timestamp timezone.
- **depends_on**: sprint-2-products-catalog, sprint-3-customers-and-auth
- **Status**: done (orders + items + addons + status-history + checkout anti-tamper, smoke 12/12, commit 17a162b)

## sprint-6-configs-globals
- **Mô tả**: Chuyển bảng `configs` (jsonb + meta-schema) sang Payload Globals có field thật.
- **Features**: Globals `order-settings`, `reservation-settings`, `homepage`, `menu-page`, `reservation-page`, `layout`; bỏ meta-schema `src/constants/settings/**`.
- **depends_on**: sprint-1-scaffold
- **Status**: done (6 typed Globals from real jsonb, smoke 6/6, commit e20741b)

## sprint-7-media-r2
- **Mô tả**: Media collection trên R2 qua storage-s3, thay URL string thô.
- **Features**: collection `media`; `@payloadcms/storage-s3` → R2 bucket hiện có; quyết định giữ key cũ (`assets.talokitchenhg.com`) vs re-key theo prefix Payload.
- **depends_on**: sprint-1-scaffold
- **Status**: done (storage-s3 R2, upload verified; commit 6cfe51d). ⚠️ KNOWN: .env R2_BUCKET_NAME=linh-dev vs R2_PUBLIC_URL=assets.talokitchenhg.com front different buckets → public GET 404 in dev; needs user to align .env.

## sprint-8-data-migration
- **Mô tả**: Script tsx idempotent đọc `dev_for_migrate` (read-only) → ghi schema `dev` qua Payload Local API, đúng thứ tự FK, map legacyId.
- **Features**: migration scripts; ghi theo thứ tự FK; map `legacyId` old→new; re-point mọi FK + `relatedProductIds`; dataset nhỏ.
- **depends_on**: sprint-2, sprint-3, sprint-4, sprint-5, sprint-6, sprint-7
- **Status**: done (all counts match source, idempotent, commit 1dbc6cf). NOTES: users temp password ChangeMe-<legacyId>-2026 (force reset); numberOfPeople old data was ranges "1-6" (string) but modeled as number→parsed to 1 (FIDELITY LOSS — consider text/select); media url null (computed, depends on R2 env fix).

## sprint-9-frontend-port
- **Mô tả**: Port web customer-facing (home/menu/dish/cart/checkout/reservation) đọc từ Payload, giữ SEO + tag revalidation.
- **Features**: pages + zustand + react-query → Payload; Local API hydrate; `revalidateTag`/`revalidatePath` qua hooks; SEO/OG/canonical; Google reviews (SERPAPI).
- **depends_on**: sprint-2, sprint-4, sprint-5, sprint-6, sprint-7
- **Status**: done (all pages ported: home/menu/dish/cart/checkout/reservation + route handlers + revalidation hooks + SEO; next build passes. Commits ad42d3f/62fcbe3/1d183f8)

## sprint-10-admin-cleanup
- **Mô tả**: Xác nhận bỏ admin cũ, cấu hình Payload admin (list view, filter, RBAC) cho staff.
- **Features**: cấu hình Payload admin; list/filter cho orders/reservations/products; RBAC theo `users.role`; bỏ custom `(admin)`.
- **depends_on**: sprint-2, sprint-3, sprint-4, sprint-5, sprint-6
- **Status**: planned

## sprint-11-cutover
- **Mô tả**: Chốt deployment, migrate delta, verify R2, cắt traffic, dọn dead code.
- **Features**: quyết định deployment; migrate delta; verify R2; cutover traffic; dọn dead code.
- **depends_on**: sprint-8, sprint-9, sprint-10
- **Status**: prepared — BLOCKED on user (production go-live). Checklist: .sdlc/v1/sprint-11-cutover/CHECKLIST.md. Needs user: deployment target, R2 env fix, prod DB/migrations, DNS/traffic cutover (outward-facing, not automatable), password resets, delta migration at cutover.
