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
- Routing theo path: `app/(web)/[locale]/`, `en` default. `localePrefix: "as-needed"` — locale mặc định (`en`) **KHÔNG có prefix** trong URL (`/`, `/menu`, `/dish/x`, giữ nguyên URL prod cũ để không xáo trộn SEO); chỉ locale không mặc định (`vi`) mới có prefix (`/vi`, `/vi/menu`, ...). Path dư prefix mặc định (`/en/...`) bị next-intl redirect 307 bỏ prefix về path không-prefix tương ứng.
- **Module config i18n (sprint-1):** `src/i18n/routing.ts` (`defineRouting` — `locales`, `defaultLocale`, `localePrefix`; nguồn duy nhất, locale-agnostic), `src/i18n/navigation.ts` (`createNavigation` → `Link`/`redirect`/`useRouter`/`usePathname` locale-aware, tự tôn trọng `localePrefix`), `src/i18n/request.ts` (`getRequestConfig` — load `messages/<locale>.json` + fallback `en`). Plugin `createNextIntlPlugin('./src/i18n/request.ts')` bọc `next.config.ts` (root).
- **Messages:** `messages/en.json` (nguyên văn English) + `messages/vi.json`, namespace theo feature. Thiếu key → fallback `en`.
- **Middleware:** `src/proxy.ts` compose — auth admin (`/admin/*`) chạy TRƯỚC & độc lập (mọi path `/admin/*` còn lại, vd `/admin/register`, cũng pass-through TRƯỚC intl để không bị prefix locale); `/api/*` bỏ qua; route web user → next-intl middleware. Detect locale: path prefix (nếu có) → cookie `NEXT_LOCALE` → `Accept-Language` → default. Với `as-needed`, path `/en/...` dư prefix bị normalize (redirect bỏ prefix) TRƯỚC khi áp cookie/Accept-Language lên path đã bỏ prefix đó — response redirect-bỏ-prefix cũng set lại `Set-Cookie: NEXT_LOCALE=en` nên trình duyệt request tiếp theo dùng cookie mới này (không phải cookie cũ), có thể khiến `/en/...` "thắng" cookie khác dù qua một bước redirect trung gian. Path `/vi/...` (locale không mặc định) không bao giờ bị strip nên luôn thắng cookie/Accept-Language tuyệt đối.
- **Locale không hợp lệ** (vd `/fr/...`) → **404** (guard `notFound()` trong `[locale]/layout.tsx`; với `as-needed`, `/fr/...` được coi là path dưới default locale không khớp route nào → 404, không loop).
- **Không áp i18n cho:** `/admin/*`, `/api/*` (gồm `app/(web)/api`), `_next`, `_vercel`, static assets, và các file tĩnh/metadata route ở path gốc có phần mở rộng (`robots.txt`, `sitemap.xml`, `site.webmanifest`, ...) — bị `proxy.ts` loại trừ tường minh (bằng pattern path có đuôi mở rộng) để next-intl không redirect chèn locale vào các URL này (điểm phát sinh khi implement, không có trong design gốc — cần thiết để tránh 307→404 hại SEO). Admin giữ tiếng Việt, không đọc messages.
- **Fallback message:** `src/i18n/request.ts` deep-merge `vi.json` đè lên `en.json` theo từng namespace lồng nhau (không chỉ shallow merge cấp 1) — key thiếu ở bất kỳ cấp nào của `vi.json` đều fallback đúng giá trị `en` tương ứng thay vì mất cả namespace.
- **Navigation:** `webRoutes` (`src/constants/route.ts`) giữ path KHÔNG locale; prefix được thêm bởi navigation wrappers từ `@/i18n/navigation`.
- **Nội dung động** (config `ui`, product/category/addon, reviews): sprint-1 hiển thị nguyên trạng ở mọi locale (chưa localize). Localized (object `{ en, vi }` / bảng `*_translations`, fallback `en`) + cache-per-locale (thêm `locale` vào key/tag) làm ở sprint-2/3.
- Không dịch admin UI; admin chỉ nhập nội dung theo locale.

## Config i18n — localized dynamic content (sprint-2)
- **Type nền tảng** (`src/types/configs.ts`): `Locale = (typeof routing.locales)[number]`, `LocalizedText = Partial<Record<Locale,string>>` (locale-agnostic, ASM-01). `TextValue = string | LocalizedText` (union — field non-localized vẫn là `string`).
- **Metadata là NGUỒN CHÂN LÝ**: cờ `localized?: boolean` trên `TextField`/`TextareaField` (`src/types/settings.ts`) quyết định field nào i18n — KHÔNG suy ra từ type value (value là jsonb runtime). Migration/service/renderer đều bám metadata `uiMeta[key]`.
- **Duyệt cây metadata song song value** (`src/lib/localized-config.ts`): field localized có thể lồng trong array/object → traversal đệ quy qua `object.fields` và `array.itemType.fields`, duyệt theo item thực có trong value (không theo index cố định của meta).
- **Resolve theo locale** (chỉ config `ui`, user-facing): fallback default (`en`); resolve in-memory sau fetch, KHÔNG thêm DB round-trip. Component user nhận string đã resolve (không tự xử i18n).
- **Cache per-locale**: key user-facing UI = `["configs","ui",key,locale]`; tag giữ `CONFIGS.BY_KEY(key)` (không kèm locale) → revalidate 1 lần xoá mọi locale.
- **Admin không resolve**: `getConfigsByKey` (không cache) trả object `{en,vi}` đầy đủ để form nhập 2 bản.
- **Thêm ngôn ngữ thứ 3**: chỉ sửa `routing.ts` + chạy migration bổ sung; không sửa type/service/renderer.
- **Không đụng**: schema bảng DB, config `config_type='app'`, entity DB (sprint-3), label admin.

## Entity i18n — localized DB entities (sprint-3)
- **Chiến lược**: bảng translation riêng (KHÁC sprint-2 dùng JSON). 3 bảng mới trong `dbSchema`:
  `product_translations`, `product_category_translations`, `product_addon_translations`. Mỗi bảng: FK →
  bảng cha `ON DELETE CASCADE`, `UNIQUE(entity_id, locale)`, cột `locale varchar(10)` (không enum DB,
  validate ở service — locale-agnostic ASM-01). Cột dịch khớp kiểu cột gốc.
- **Cột gốc = English chính thức + fallback cuối**: cột gốc trên bảng chính (`products.title`,
  `product_categories.name`, `product_addons.name`, …) GIỮ NGUYÊN, không bỏ. Row `locale='en'` seed từ
  cột gốc. Resolve fallback LUÔN về cột gốc.
- **Migration 2 phần**: (a) Drizzle forward migration (`db:generate` + `db:migrate`) tạo 3 bảng; (b) seed
  script tsx idempotent (backup trước, guard `DB_SCHEMA`/`DATABASE_URL`) tạo row `en` từ cột gốc. Drizzle
  forward-only → rollback = SQL thủ công `DROP TABLE ... CASCADE` (cột gốc còn nguyên → không mất en).
- **Resolve theo locale** (user-facing): relational query `with: { translations: { where locale } }` (kèm
  addon/category translations lồng nhau) → 1 round-trip, KHÔNG N+1; COALESCE(translation.field, cột gốc)
  in-memory. Shape service trả về GIỮ NGUYÊN (component không đổi).
- **Cache per-locale**: thêm `locale` vào key parts của service cached; tag GIỮ NGUYÊN không kèm locale
  (`PRODUCTS.BY_SLUG/BY_CATEGORY/ALL`) → revalidate 1 lần xoá mọi locale (nhất quán sprint-2).
- **API `/api/products/*` (ngoài `[locale]`)**: tự xác định locale — `?locale=` → cookie `NEXT_LOCALE` →
  `Accept-Language` → `en` (helper `getRequestLocale`, `src/lib/locale.ts`). Server action cart nhận
  `locale` từ client (`useLocale()`).
- **Order snapshot**: `order_items.productName` + `order_item_addons.addonName` lưu snapshot text tại thời
  điểm đặt → KHÔNG dịch lại lịch sử. Chỉ hiển thị realtime (cart/quick-cart trước khi đặt) theo locale.
- **Admin không resolve**: service admin trả entity kèm TẤT CẢ translation (`{en, vi}`) để form nhập 2 bản;
  save upsert `(entity_id, locale)` trong transaction + set cột gốc = bản `en`.
- **Thêm ngôn ngữ thứ 3**: thêm vào `routing.ts` + seed row translation locale mới; KHÔNG đổi schema/type/
  service/renderer.
- **Không đụng**: config (sprint-2), label admin UI, cột gốc bảng chính, FK bảng chính hiện có.

## SEO / i18n metadata + format theo locale (sprint-4)
- **Helper metadata dùng chung** (`src/lib/i18n-meta.ts`, locale-agnostic, không server-only để test được):
  - `buildLocalizedUrl(locale, path)`: scheme `as-needed` — `defaultLocale` KHÔNG prefix (`${APP_URL}${path}`),
    locale khác có prefix (`${APP_URL}/${locale}${path}`). `path` = pathname KHÔNG prefix (home = `""`).
  - `buildAlternates(currentLocale, path)`: `languages` loop `routing.locales` + `x-default` (= defaultLocale),
    `canonical` self-referencing per-locale. KHÔNG hardcode 2 mục; thêm locale = tự có mục mới.
  - `buildSitemapLanguages(path)`: `{[loc]: url}` loop locales (không x-default — format sitemap).
  - `getOgLocale(locale)`: map literal `{ en:"en_US", vi:"vi_VN" }`, miss → `undefined` (omit, không crash).
- **generateMetadata 6 trang `[locale]`** (home, menu/[category], dish/[slug], reservation, checkout, cart):
  `resolveLocale(rawLocale)` → truyền vào cached service sprint-2/3 (0 DB round-trip mới, hưởng cùng cache
  per-locale) → build metadata qua helper. cart/checkout chuyển `export const metadata` static → `async
  generateMetadata`. Fallback khi service trống → namespace `metadata` trong messages (brand name giữ nguyên);
  fallback description menu dùng ICU `{category}` (word-order safe cho vi). KHÔNG generateMetadata nào throw.
- **sitemap.ts**: giữ `force-dynamic` + tập URL gốc (bản defaultLocale) + đọc `menu_page` theo defaultLocale;
  chỉ THÊM `alternates.languages` mỗi entry.
- **Format tiền/ngày phía WEB USER** (tách biệt admin):
  - `formatCurrencyWebsite(amount, locale?)` (`src/lib/utils.ts`): `toLocaleString(locale)` + hậu tố "VND"
    (en `1,000,000 VND`, vi `1.000.000 VND`); default vi-VN (backward-compat). `formatCurrency` (admin, vi-VN)
    KHÔNG đụng.
  - `src/lib/date-web.ts` (NEW): `Intl.DateTimeFormat(locale)` cho reservation (vi `DD/MM/YYYY`+24h, en
    `MM/DD/YYYY`+12h); wall-clock, KHÔNG áp tz offset. `lib/date.ts formatDateVN` (admin) KHÔNG đụng.
  - Client lấy locale từ `useLocale()`; server component nhận prop/`getLocale()`.
- **Locale-agnostic**: thêm locale thứ 3 chỉ cần sửa `routing.ts` + 1 nhánh `getOgLocale` + messages +
  1 bảng map format nếu cần; KHÔNG sửa logic metadata/format.
- **Không đụng**: routing/middleware/cache/service sprint-1/2/3, label admin, `formatCurrency`, `formatDateVN`.
