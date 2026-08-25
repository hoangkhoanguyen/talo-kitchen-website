# Architecture — Talo Kitchen (PayloadCMS migration)

Nguồn tham chiếu kiến trúc xuyên suốt mọi version/sprint. v1 = migrate app cũ sang PayloadCMS.

## Bối cảnh: đây là REWRITE, không phải greenfield

- **App CŨ** (repo hiện tại `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen`): Next.js 16.2.10 App Router + React 19.2.3, Drizzle ORM + `postgres` driver, Postgres named schema **`prod`**, custom admin panel (`src/app/(admin)`), custom JWT auth (bcrypt + jose + bảng `refresh_tokens`), media Cloudflare R2 qua `@aws-sdk/client-s3`. Tailwind 4 + daisyui, react-hook-form + zod, zustand, @tanstack/react-query + react-table, nuqs, sonner, swiper. → Giữ **read-only làm reference**.
- **App MỚI** (target): scaffold ở **sibling `../talo-kitchen-payload`** bằng `create-payload-app` (template blank). Repo mới độc lập + git remote `legacy` trỏ repo cũ để blame.

## Target stack (v1)

- **PayloadCMS 3.88** cài trong Next.js (Payload là thư viện trong Next app, không phải app riêng).
- **Next 16.3 / React 19.2.6 / TypeScript 6** (versions template Payload pin). Payload 3.88 hỗ trợ chính thức Next `>=16.2.6 <17` → không downgrade.
- **DB**: `@payloadcms/db-postgres` (drizzle bên dưới). Supabase Postgres.
  - Nguồn migrate: schema **`dev_for_migrate`** (clone production, READ-ONLY).
  - Đích Payload: schema **`dev`** (`schemaName: 'dev'`). GHI ở đây.
  - ⚠️ Connection pooler port **6543** (pgbouncer) KHÔNG hỗ trợ prepared statements/DDL → dùng **port 5432** (direct/session) cho migrations/DDL, pooler cho runtime.
  - Env: `DATABASE_URI` (khác `DATABASE_URL` app cũ), `PAYLOAD_SECRET`.
- **Media**: `@payloadcms/storage-s3` → Cloudflare R2 bucket hiện có (endpoint `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`, region `auto`, `forcePathStyle`). Env `R2_*`.
- **Auth**: Payload built-in (collection `users` auth-enabled). Bỏ hẳn bcrypt+jose+refresh_tokens của app cũ. Login = username HOẶC email qua `auth.loginWithUsername {allowEmailLogin:true, requireEmail:true}` (thay `emailOrUsername` cũ). `isActive=false` chặn login qua `beforeLogin` hook. `role` (admin|manager|user, default `user`) `saveToJWT`.
- **Admin UI**: Payload tự sinh (thay custom admin). RBAC theo `users.role`.
- **RBAC dùng chung**: module `src/access/` (`isAdmin`, `isAdminOrManager`, `isAuthenticated`, `isAdminOrSelf`) — mọi collection import từ đây, không viết access inline lặp lại. (Xác lập ở sprint-3.)

## Data model (collections/globals dự kiến)

Collections: `categories`, `products` (+ addons/images: array vs collection — quyết ở sprint-2), `customers` (no-auth), `users` (auth), `reservations` (+ status history), `orders` + `order-items` + `order-item-addons` (+ status history), `media`.
Globals (từ bảng `configs`): `order-settings`, `reservation-settings`, `homepage`, `menu-page`, `reservation-page`, `layout`.

Data cũ (schema `dev_for_migrate`) dùng serial integer PK → khi migrate lưu **`legacyId`** để trace + re-point FK/relatedProductIds sang id Payload mới.

## Quyết định đã chốt (locked)

- Giữ Next 16; DB Postgres mới tách riêng; **plain text** (không Lexical richtext); **không** localization (frontend EN / admin VI hardcode); **2 collection auth tách** (Users auth / Customers no-auth); **chấp nhận auth mặc định Payload** (bỏ revoke refresh-token server-side); **bỏ custom admin** dùng Payload admin; **migrate toàn bộ data**.

## Tech-debt/bug app cũ cần xử lý khi convert

- Order/reservation code sinh random KHÔNG unique → unique index + retry/counter.
- `registerUser` ép `role='admin'` → RBAC thật.
- `orders.updatedAt` thiếu timezone → chuẩn hoá.
- bcrypt salt rounds không đồng nhất (10 vs 12) → Payload tự quản hashing.
- enum orderType/status bị comment không enforce → select field option cố định.
- `/api/revalidate-all` không auth → thay bằng hook revalidation.
- `@aws-sdk/s3-request-presigner` không dùng thật → không port.

## Conventions

- Business docs (input): `docs/payloadcms-migration/ROADMAP.md` + `INVENTORY.md` (checklist tick-off chống sót).
- SDLC state: `.sdlc/v1/`. Credentials DB dev: memory `dev-database-credentials` (không commit).
- Ngôn ngữ: docs/plan tiếng Việt; content frontend EN, admin VI (như app cũ).

## UI/design

Existing app, **không có DESIGN.md** → UI theo style app hiện tại (Tailwind 4 + daisyui). Không hỏi lại style.
