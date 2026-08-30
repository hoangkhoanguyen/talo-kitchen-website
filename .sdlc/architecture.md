# Architecture — Talo Kitchen Website

Tài liệu tham chiếu kiến trúc xuyên version cho các agent SDLC. Mô tả **hiện trạng** (trước khi thêm i18n) + các quyết định nền tảng.

## Stack
- **Next.js 16** — App Router, React Server Components. React 19.2.
- **TypeScript**.
- **PostgreSQL** qua **Drizzle ORM** (`drizzle-orm ^0.44.5`, `drizzle-kit`). Kết nối: `postgres(env.DATABASE_URL, { prepare: false })` → tương thích Supabase transaction pooler (port 6543).
- **moment** cho format ngày (lưu ý: cần chuyển sang format theo locale ở sprint i18n polish).
- Storage ảnh: Cloudflare R2. Reviews: SerpApi (Google Maps).

## DB schema
- Tất cả bảng nằm trong **một Postgres schema** do env quyết định: `pgSchema(process.env.DB_SCHEMA || "prod")` tại `src/db/schema.ts` (biến `DB_SCHEMA`; dev/test dùng `dev_multi_lang`, prod dùng `prod`).
- Định nghĩa bảng ở `src/db/schemas/` (mỗi domain một thư mục): `products/` (products, product-categories, product-addons, product-images), `configs/` (unified-configs), `customers/`, `orders/`, `reservations/`, `auth/`.
- Migration Drizzle: `out: ./src/db/migration`, `drizzle.config.ts` đọc `.env.local` rồi `.env`.

### Bảng `configs` (CMS nội dung động)
- Cột JSON `value`, PK kép = `key + config_type`, `config_type ∈ {'app','ui'}`.
- Form admin render **ĐỘNG** từ metadata `MetaValue`/`FieldType` (`src/types/settings.ts`, `src/constants/settings/...`).
- Nội dung `ui` (homepage, menu_page, reservation_page, layout…) là các section trang chủ/menu/đặt bàn hiển thị cho user.
- Lưu ý: `title`/`sub_title` trong config là **array** phục vụ hiệu ứng xoay chữ — KHÔNG phải i18n.

## Cấu trúc app
- `src/app/(web)/` — website USER: `dish/[slug]`, `menu/[category]`, `reservation`, `checkout`, `cart`, `api`. Layout tại `src/app/(web)/layout.tsx` (hiện `<html lang="en">` cứng).
- `src/app/(admin)/admin/` — giao diện ADMIN (label tiếng Việt). Có API routes riêng.
- `src/components/web/` (component user) và `src/components/admin/` (component admin, gồm `features/products/form-elements/…`).

## Tầng service & cache
- `src/services/` — truy cập DB/business logic: `products.ts`, `configs.ts`, `orders.ts`, `reservations.ts`, `customers.ts`, `cart.ts`, `auth.ts`.
- `src/services/cached/` — bản cache của service user-facing (`products.ts`, `configs.ts`) theo **cache tag**; admin KHÔNG cache. Helper cache: `src/lib/cache.ts` (`createCachedFunction`).
- Env validation: `src/lib/env.ts` (zod, `getEnv()`, `server-only`). `src/db/schema.ts` đọc `process.env.DB_SCHEMA` trực tiếp (không dùng getEnv vì server-only sẽ vỡ dưới drizzle-kit CLI).

## Types
- `src/types/` — `settings.ts` (MetaValue/FieldType cho form config động), `configs.ts`, `products.ts`, `reservations.ts`, `orders.ts`, v.v.

## Trạng thái ngôn ngữ hiện tại (baseline trước i18n)
- Website chỉ hiển thị **tiếng Anh**: `<html lang="en">` cứng, chuỗi UI hardcode tiếng Anh, nội dung động (`configs`, products) lưu string đơn (1 bản = English).
- Chưa có hạ tầng i18n: không routing `[locale]`, không next-intl, không cookie `NEXT_LOCALE`.

## Quyết định nền tảng i18n (v1)
- Thư viện: **next-intl** (App Router + RSC).
- Routing theo path: `app/(web)/[locale]/`, URL `/en/...` và `/vi/...`, `en` default. `localePrefix: "always"` (mọi URL có prefix, kể cả en).
- **Module config i18n (sprint-1):** `src/i18n/routing.ts` (`defineRouting` — `locales`, `defaultLocale`, `localePrefix`; nguồn duy nhất, locale-agnostic), `src/i18n/navigation.ts` (`createNavigation` → `Link`/`redirect`/`useRouter`/`usePathname` locale-aware), `src/i18n/request.ts` (`getRequestConfig` — load `messages/<locale>.json` + fallback `en`). Plugin `createNextIntlPlugin('./src/i18n/request.ts')` bọc `next.config.ts` (root).
- **Messages:** `messages/en.json` (nguyên văn English) + `messages/vi.json`, namespace theo feature. Thiếu key → fallback `en`.
- **Middleware:** `src/proxy.ts` compose — auth admin (`/admin/*`) chạy TRƯỚC & độc lập (mọi path `/admin/*` còn lại, vd `/admin/register`, cũng pass-through TRƯỚC intl để không bị prefix locale); `/api/*` bỏ qua; route web user → next-intl middleware. Detect locale: path → cookie `NEXT_LOCALE` → `Accept-Language` → default.
- **Locale không hợp lệ** (vd `/fr/...`) → **404** (guard `notFound()` trong `[locale]/layout.tsx`).
- **Không áp i18n cho:** `/admin/*`, `/api/*` (gồm `app/(web)/api`), `_next`, `_vercel`, static assets, và các file tĩnh/metadata route ở path gốc có phần mở rộng (`robots.txt`, `sitemap.xml`, `site.webmanifest`, ...) — bị `proxy.ts` loại trừ tường minh (bằng pattern path có đuôi mở rộng) để next-intl không redirect chèn locale vào các URL này (điểm phát sinh khi implement, không có trong design gốc — cần thiết để tránh 307→404 hại SEO). Admin giữ tiếng Việt, không đọc messages.
- **Fallback message:** `src/i18n/request.ts` deep-merge `vi.json` đè lên `en.json` theo từng namespace lồng nhau (không chỉ shallow merge cấp 1) — key thiếu ở bất kỳ cấp nào của `vi.json` đều fallback đúng giá trị `en` tương ứng thay vì mất cả namespace.
- **Navigation:** `webRoutes` (`src/constants/route.ts`) giữ path KHÔNG locale; prefix được thêm bởi navigation wrappers từ `@/i18n/navigation`.
- **Nội dung động** (config `ui`, product/category/addon, reviews): sprint-1 hiển thị nguyên trạng ở mọi locale (chưa localize). Localized (object `{ en, vi }` / bảng `*_translations`, fallback `en`) + cache-per-locale (thêm `locale` vào key/tag) làm ở sprint-2/3.
- Không dịch admin UI; admin chỉ nhập nội dung theo locale.
