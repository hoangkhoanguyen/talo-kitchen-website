# Design — sprint-1-i18n-foundation (v1 i18n)

> Skill: system-design. Scope: nền tảng i18n (next-intl, App Router/RSC) + trích chuỗi tĩnh Loại C cho web USER. KHÔNG lấn sprint-2/3/4. Không đổi schema DB, không đụng admin.

---

# PART 1 — HUMAN REVIEW

## 1. Design Overview

- **Thư viện i18n:** `next-intl` (App Router/RSC), bọc bằng plugin trong `next.config.ts`. Đây là quyết định nền tảng đã có trong `architecture.md`.
- **Routing:** di chuyển toàn bộ **page/layout** web user vào segment `src/app/(web)/[locale]/`, **giữ nguyên** `src/app/(web)/api/` NGOÀI `[locale]` (A-01). `localePrefix: "always"` → mọi URL có `/en` hoặc `/vi`.
- **Locale-agnostic:** một module cấu hình duy nhất `src/i18n/routing.ts` khai báo `locales`/`defaultLocale`. Thêm locale = sửa mảng + thêm `messages/<locale>.json`, không đụng routing/middleware (RULE-01, EC-12, NFR-05).
- **Middleware compose:** `src/proxy.ts` giữ auth admin CHẠY TRƯỚC cho `/admin/*`; các route web user được chuyển tiếp qua next-intl middleware. `/api`, `/admin`, `_next`, static bị loại khỏi i18n (A-06, RULE-09/10).
- **Navigation locale-aware:** tạo wrappers từ `next-intl/navigation` (`Link`, `useRouter`, `usePathname`, `redirect`) trong `src/i18n/navigation.ts`. Vì `localePrefix: always`, các wrapper này tự nối/duy trì prefix locale. `webRoutes` GIỮ NGUYÊN (trả path không locale) và được feed vào `Link`/`redirect` locale-aware (RULE-12, RI-07).
- **Loại C:** trích chuỗi tĩnh user-facing ra `messages/en.json` (nguyên văn) + `messages/vi.json` (dịch mới), namespace theo feature. RSC dùng `getTranslations`, client dùng `useTranslations` (NFR-01/02).
- **Locale không hợp lệ (EC-03/RULE-05):** CHỐT hành vi = **404** (dùng `not-found` của next-intl, không match locale → không render `[locale]` → 404). Testable, không redirect vòng.

## 2. Tech Decisions (user có thể override)

- **next-intl** (bản mới nhất tương thích Next 16 / React 19 — cài `next-intl@latest`). Cấu hình chuẩn App Router: `routing.ts` + `request.ts` + plugin.
- **Cookie `NEXT_LOCALE`** do next-intl quản lý (mặc định), không tự set thủ công (A-09, NFR-07).
- **`localePrefix: "always"`** (A-04, RULE-02).
- **EC-03 = 404** (không redirect defaultLocale). Lý do: đơn giản, testable, không tạo redirect trá hình từ URL sai.
- **Message namespace theo feature** (`home`, `menu`, `reservation`, `cart`, `checkout`, `products`, `common`, `footer`, `header`, `notFound`). Không namespace theo file để tránh trùng lặp.

## 3. Risks / Trade-offs

- **R1 — Di chuyển thư mục lớn:** dời ~11 page/layout vào `[locale]/`. Rủi ro sai import tương đối (font `./SVN-Allogist.otf`, css `./reservation/datepicker-custom.css`). → File Change Plan chốt rõ file cần move theo. Import dùng alias `@/` nên đa số an toàn; chỉ font/css tương đối cần cập nhật.
- **R2 — Compose middleware:** thứ tự sai → mất auth admin hoặc chèn locale vào `/api`. → Section 4 + bảng map RULE-09/10 chốt thứ tự và matcher.
- **R3 — Sót chuỗi hardcode (~32+ file):** nếu sót, `/vi` vẫn hiện English. Không phải lỗi chặn nhưng ảnh hưởng DoD (Story-05). → File Change Plan liệt kê nhóm file; task-breakdown chia nhỏ theo feature namespace.
- **R4 — `<body>` trong `not-found.tsx` root:** file 404 global tự render `<body>` (không `<html>`). Khi thêm `[locale]/not-found.tsx` phải đảm bảo nó nằm trong layout `[locale]` (đã có `<html>/<body>`) → KHÔNG tự render `<body>` nữa. Root `not-found.tsx` giữ nguyên làm fallback (A-03).
- **R5 — `moment`/format tiền/ngày:** KHÔNG đổi ở sprint-1 (sprint-4). Chuỗi có nội suy (số lượng, tổng tiền, "GMT +7") dùng ICU placeholder của next-intl, phần số giữ nguyên logic hiện tại (EC-11).
- **R6 — Cache-per-locale:** KHÔNG làm ở sprint-1 (A-05, RI-09). Ghi chú để sprint-2/3.

---

# PART 2 — AGENT REFERENCE

## 4. Architecture

### Cấu trúc thư mục (sau thay đổi)

```
src/
  i18n/
    routing.ts        # NEW: locales, defaultLocale, localePrefix, defineRouting()
    navigation.ts     # NEW: createNavigation(routing) → Link, redirect, useRouter, usePathname, getPathname
    request.ts        # NEW: getRequestConfig → chọn locale + load messages/<locale>.json + fallback en
  proxy.ts            # MODIFIED: compose auth-admin + next-intl middleware
  next.config.ts      # MODIFIED (ở root): bọc createNextIntlPlugin('./src/i18n/request.ts')
  app/
    (web)/
      [locale]/               # NEW segment — chứa toàn bộ page/layout web user
        layout.tsx            # MOVED từ (web)/layout.tsx — <html lang={locale}>, NextIntlClientProvider
        page.tsx              # MOVED
        not-found.tsx         # NEW — 404 đã dịch, KHÔNG tự render <body>
        SVN-Allogist.otf      # MOVED (font local dùng bởi layout)
        dish/page.tsx, dish/[slug]/page.tsx           # MOVED
        menu/page.tsx, menu/[category]/page.tsx       # MOVED
        reservation/page.tsx, reservation/datepicker-custom.css  # MOVED
        checkout/page.tsx     # MOVED
        cart/page.tsx, cart/loading.tsx               # MOVED
      api/                    # UNCHANGED — NGOÀI [locale] (A-01)
        products/ids/route.ts
        products/quick/[id]/route.ts
    not-found.tsx     # UNCHANGED — 404 global fallback (English) cho path ngoài [locale]
    sitemap.ts        # UNCHANGED (A-02)
messages/
  en.json             # NEW — nguyên văn chuỗi English hiện tại
  vi.json             # NEW — bản dịch tiếng Việt
```

### Luồng request (web user)

```
Request → proxy.ts
  ├─ pathname === /admin/login       → auth-admin logic (giữ nguyên)
  ├─ pathname.startsWith(/admin)     → auth-admin logic (giữ nguyên)  [RULE-10, EC-05]
  ├─ pathname bắt đầu /api           → next() (không i18n)            [RULE-09, EC-04]
  └─ còn lại (web user)              → intlMiddleware(request)
                                        detect: path locale > cookie NEXT_LOCALE > Accept-Language > default
                                        localePrefix always → redirect nếu thiếu prefix   [RULE-02/03]
```
> Lưu ý matcher: `/api` web user nằm ở `app/(web)/api` → path runtime là `/api/...` (route group `(web)` không xuất hiện trong URL). Loại trừ bằng `startsWith('/api')`.

### Render (RSC)

```
[locale]/layout.tsx (async, force-dynamic)
  ├─ const { locale } = await params           # Next 16 params là Promise
  ├─ if (!routing.locales.includes(locale)) notFound()   [RULE-05, EC-03]
  ├─ setRequestLocale(locale) (nếu dùng static params — ở đây force-dynamic nên optional)
  ├─ const messages = await getMessages()
  ├─ <html lang={locale}>                        [RULE-06, Story-04]
  └─ <body> ... <NextIntlClientProvider messages={messages}> {children + Header/Footer...} </NextIntlClientProvider>
```
> `getUIConfigsByKeyCached("layout")` GIỮ NGUYÊN (A-05, RI-09). GTM scripts, fonts, providers (WebsiteQueryProvider, AnimationHeaderScroll), Toaster, QuickCartModal, FloatingActions GIỮ NGUYÊN (RI-04).

## 5. Data Model

**KHÔNG có thay đổi schema DB** (ràng buộc cứng). Artifact cấu hình/tĩnh:

| Artifact | Vị trí | Cấu trúc | Ràng buộc |
|---|---|---|---|
| Locale config | `src/i18n/routing.ts` | `locales: ['en','vi']`, `defaultLocale: 'en'`, `localePrefix: 'always'` | `defaultLocale ∈ locales`; mã ngôn ngữ chuẩn |
| Message catalog EN | `messages/en.json` | cây `{ namespace: { key: string } }` | superset đầy đủ key; nguyên văn English hiện tại (A-08, NFR-02) |
| Message catalog VI | `messages/vi.json` | cùng cây key | mỗi key nên có; thiếu → fallback `en` (RULE-08); không để rỗng gây vỡ layout |
| Cookie `NEXT_LOCALE` | trình duyệt | value ∈ `locales` | do next-intl quản lý; không chứa dữ liệu nhạy cảm (NFR-06) |

**Message namespaces (đề xuất):** `common`, `header`, `footer`, `home`, `menu`, `reservation`, `cart`, `checkout`, `products`, `notFound`. Chuỗi có nội suy dùng ICU: ví dụ `"guests": "{count} guests"`, `"dateLabel": "Preferred Date (GMT +7) *"` (phần cố định), tổng tiền để component truyền giá trị đã format (EC-11).

## 6. API Contracts

**Sprint-1 KHÔNG thêm/đổi endpoint.** Hai API web user hiện có GIỮ NGUYÊN, KHÔNG prefix locale:

| Method | Path | Auth | Ghi chú |
|---|---|---|---|
| GET | `/api/products/ids?...` | none | RI-02, EC-04 — middleware bỏ qua, trả 200 như cũ |
| GET | `/api/products/quick/[id]` | none | RI-02, EC-04 |

**Hành vi "endpoint-like" của middleware/routing (testable):**

| Tình huống | Kết quả | Rule/EC |
|---|---|---|
| GET `/` không cookie/Accept-Language | 307 → `/en` | EC-01, RULE-02/03 |
| GET `/dish/abc` (không locale) | 307 → `/<detected>/dish/abc` | AC-02.1 |
| GET `/en/menu/all` | 200, render English, không redirect | AC-02.2, EC-02 |
| GET `/vi/menu/all` | 200, render VI static | AC-02.3 |
| GET `/fr/dish/x` (locale sai) | **404** (không match `[locale]` valid) | EC-03, RULE-05 |
| GET `/admin/dashboard` chưa login | 307 → `/admin/login?callback_url=...`, KHÔNG prefix locale | EC-05, RULE-10 |
| GET `/api/products/ids` khi client ở `/vi` | 200, path giữ `/api/...` | EC-04, RULE-09 |
| Key thiếu ở `vi.json` | render giá trị `en` (fallback) | EC-06, RULE-08 |

## 7. UI / Interaction Flow

### Language Switcher (component mới — hành vi/kỹ thuật thuộc sprint này)

- **Vị trí:** trong Header web user — `src/components/web/shared/header/` (đặt cạnh CartButton/menu; hình thức do nhánh UI lo).
- **Loại:** client component (`"use client"`).
- **Cơ chế đổi locale:**
  - `const pathname = usePathname()` (từ `src/i18n/navigation.ts` — trả path KHÔNG có prefix locale).
  - `const router = useRouter()` (locale-aware wrapper).
  - `const currentLocale = useLocale()`.
  - Chọn locale mới → `router.replace(pathname, { locale: nextLocale })` (giữ path); query params: đọc `useSearchParams()` và nối vào pathname nếu có (đảm bảo AC-01.1, EC-09 giữ query + dynamic segment). next-intl tự set cookie `NEXT_LOCALE` khi điều hướng bằng wrapper (RULE-04).
- **Active state:** đánh dấu `currentLocale === locale` (AC-01.3, NFR-03).
- **A11y:** nút có `aria-label`, focusable bàn phím, `aria-current` cho locale đang chọn (NFR-03).

### States

| State | Xử lý |
|---|---|
| Loading | Không đổi hành vi hiện tại (Suspense/loading.tsx của cart giữ nguyên, MOVED vào `[locale]`). |
| Empty | Không đổi (EmptyCart giữ nguyên logic, chỉ trích chuỗi). |
| Error / 404 (trong locale) | `[locale]/not-found.tsx` dịch qua namespace `notFound`; nằm trong layout `[locale]` nên có `<html lang>` đúng (EC-10, A-03). |
| 404 ngoài locale | root `app/not-found.tsx` giữ nguyên (English fallback, RI-06). |

## 8. Rule & Edge-case Mapping (BẮT BUỘC — phủ 100%)

| ID | Yêu cầu | Xử lý ở đâu |
|---|---|---|
| RULE-01 | Locale set tập trung, locale-agnostic | `src/i18n/routing.ts` (`locales`,`defaultLocale`) — nguồn duy nhất |
| RULE-02 | `localePrefix: always` | `routing.ts` + intl middleware trong `proxy.ts` |
| RULE-03 | Thứ tự detect path>cookie>Accept-Language>default | intl middleware (mặc định next-intl với `localeDetection`) |
| RULE-04 | Switcher set cookie + giữ path | LanguageSwitcher dùng `useRouter().replace(pathname,{locale})` |
| RULE-05 | Locale sai → không crash | `[locale]/layout.tsx` guard `notFound()` + matcher → **404** (EC-03) |
| RULE-06 | `<html lang>` = locale | `[locale]/layout.tsx` `<html lang={locale}>` |
| RULE-07 | Chuỗi tĩnh qua next-intl | RSC `getTranslations`, client `useTranslations`; en nguyên văn |
| RULE-08 | Fallback en khi thiếu key | `request.ts`: messages base = merge en làm fallback (hoặc `getRequestConfig` trả en cho key thiếu) |
| RULE-09 | admin/api/_next/static không i18n | `proxy.ts` guard `startsWith('/admin')`/`startsWith('/api')` + matcher next.config |
| RULE-10 | Auth admin không đổi | `proxy.ts` giữ nguyên block auth, chạy TRƯỚC intl |
| RULE-11 | Nội dung động nguyên trạng | Không đụng services/cached/config render (A-05/A-10) |
| RULE-12 | Nav client giữ locale | `src/i18n/navigation.ts` wrappers dùng khắp Link/redirect/router web user |
| EC-01 | `/` không cookie → `/en` | intl middleware default detection |
| EC-02 | cookie vi nhưng `/en/...` → en | intl middleware (path thắng cookie) |
| EC-03 | `/fr/...` → 404 | matcher + layout guard `notFound()` |
| EC-04 | `/api/*` khi ở vi | `proxy.ts` bỏ qua `/api`, không chèn locale |
| EC-05 | admin chưa login → login | `proxy.ts` auth block nguyên vẹn |
| EC-06 | key thiếu vi → en | fallback trong `request.ts` |
| EC-07 | product name còn English ở vi | không localize nội dung động (đúng ý đồ) |
| EC-08 | link nội bộ giữ locale | `Link` từ `navigation.ts` + `webRoutes` feed vào href |
| EC-09 | đổi locale trang dynamic giữ slug+query | switcher `replace(pathname+query,{locale})` |
| EC-10 | refresh `/vi` `<html lang=vi>` không nháy | `<html lang={locale}>` server-rendered |
| EC-11 | chuỗi nội suy ICU | messages ICU placeholder; component truyền biến |
| EC-12 | thêm locale thứ 3 | sửa `locales` array + thêm `messages/ko.json` (không đụng code khác) |
| NFR-01 | RSC ưu tiên getTranslations | Server components dùng `getTranslations`; middleware redirect 1 lần |
| NFR-02 | English không đổi | en.json trích nguyên văn; review diff |
| NFR-03 | a11y `<html lang>` + switcher | layout + switcher aria/keyboard |
| NFR-04 | không redirect loop | matcher loại `/api`,`/admin`,static; localePrefix always nhất quán |
| NFR-05 | locale-agnostic | `routing.ts` là điểm sửa duy nhất |
| NFR-06 | security cookie/auth | `NEXT_LOCALE` không nhạy cảm; auth admin không đổi |
| NFR-07 | consistency mã locale | `routing.locales` dùng chung cho URL/cookie/html lang |

## 9. NFR Design

- **NFR-01 (Perf/RSC):** Ưu tiên `getTranslations` trong page/RSC (không tăng bundle client). `useTranslations` chỉ ở 38 client components thực sự cần. Middleware chỉ redirect 1 lần cho path thiếu prefix; các path đã có prefix không redirect.
- **NFR-02 (English bất biến):** en.json = copy nguyên văn chuỗi hiện tại; thay JSX bằng `t('key')` giữ nguyên value. Reviewer so sánh render `/en` với baseline.
- **NFR-03 (A11y):** `<html lang={locale}>`; switcher có `aria-label`, `aria-current`, tab-focusable.
- **NFR-04 (SEO an toàn):** matcher loại `/api`,`/admin`,`_next`,static → không loop. hreflang/alternates để sprint-4 (không làm).
- **NFR-05 (Mở rộng):** kiểm chứng EC-12 — thêm locale không đụng routing/middleware/nav.
- **NFR-06 (Security):** cookie chỉ chứa mã locale; luồng auth admin nguyên vẹn.
- **NFR-07 (Consistency):** một nguồn `routing.locales`; cookie name `NEXT_LOCALE`.

## 10. Regression-safe Plan

| RI | Module | Cách giữ an toàn |
|---|---|---|
| RI-01 | Auth admin `proxy.ts` | GIỮ NGUYÊN toàn bộ block admin; chỉ THÊM nhánh intl cho route còn lại. Admin xử lý & return TRƯỚC intl |
| RI-02 | API web user | KHÔNG move vào `[locale]`; `proxy.ts` + matcher bỏ qua `/api`; `webRoutes.productsByIdsApi/productQuickApi` giữ nguyên (không locale) |
| RI-03 | Route web user | Move page/layout vào `[locale]`; URL cũ redirect bởi middleware (localePrefix always) → không 404 |
| RI-04 | Layout web user | Move nội dung layout, GIỮ Header/Footer/FloatingActions/Toaster/QuickCartModal/GTM/fonts/providers; chỉ đổi `<html lang>` + bọc `NextIntlClientProvider` |
| RI-05 | sitemap | KHÔNG đổi (A-02); URL không locale vẫn valid, middleware redirect tới locale |
| RI-06 | 404 root | Giữ `app/not-found.tsx` nguyên (fallback English); thêm `[locale]/not-found.tsx` riêng |
| RI-07 | Nav `webRoutes` | `webRoutes` GIỮ NGUYÊN (path không locale); đổi import `Link`/`redirect`/`useRouter`/`usePathname` sang `@/i18n/navigation` ở component web user → tự thêm prefix locale |
| RI-08 | next.config images | Bọc `createNextIntlPlugin()(nextConfig)` — giữ nguyên object `images.remotePatterns`/`qualities` |
| RI-09 | Cache `getUIConfigsByKeyCached` | KHÔNG đổi cache tag/key (A-05) |
| RI-10 | `force-dynamic`/rendering | Giữ `export const dynamic = "force-dynamic"` trong `[locale]/layout.tsx`; segment lồng thêm `[locale]` không đổi mode |

### Chi tiết `proxy.ts` compose (khung logic)

```ts
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;
  // 1) admin auth (GIỮ NGUYÊN toàn bộ, return sớm)
  if (pathname === adminRoutes.login()) { ...existing... }
  if (pathname.startsWith(adminRoutes.root()) && ...) { ...existing... }
  // 2) API web user — không i18n
  if (pathname.startsWith('/api')) return NextResponse.next();
  // 3) web user — next-intl
  return intlMiddleware(request);
}
```
Matcher next.config: giữ regex hiện tại (đã loại `_next/static`,`_next/image`,`assets`,`images`,`fonts`,static ext). Thêm loại trừ để chắc chắn không loop: đảm bảo `/api` và `/admin` vẫn vào `proxy` nhưng được xử lý ở nhánh riêng (không cần loại khỏi matcher vì logic tự bỏ qua). Giữ nguyên matcher hiện tại là đủ.

## 11. File Change Plan

### NEW

| File | Nội dung |
|---|---|
| `src/i18n/routing.ts` | `defineRouting({ locales:['en','vi'], defaultLocale:'en', localePrefix:'always' })` export `routing` |
| `src/i18n/navigation.ts` | `createNavigation(routing)` → export `Link, redirect, usePathname, useRouter, getPathname` |
| `src/i18n/request.ts` | `getRequestConfig`: resolve locale (validate qua `routing.locales`, fallback default), load `messages/<locale>.json`, cấu hình fallback en cho key thiếu |
| `messages/en.json` | chuỗi tĩnh English nguyên văn, namespace theo feature |
| `messages/vi.json` | bản dịch VI cùng cây key |
| `src/app/(web)/[locale]/not-found.tsx` | 404 đã dịch (namespace `notFound`), KHÔNG render `<body>` (nằm trong layout `[locale]`) |
| `src/components/web/shared/header/LanguageSwitcher.tsx` | client component đổi locale giữ path (hành vi; UI do nhánh UI) |

### MOVED (từ `src/app/(web)/…` → `src/app/(web)/[locale]/…`)

- `layout.tsx` (→ sửa `<html lang>`, bọc provider)
- `page.tsx`
- `SVN-Allogist.otf` (font local layout tham chiếu `./SVN-Allogist.otf`)
- `dish/page.tsx`, `dish/[slug]/page.tsx`
- `menu/page.tsx`, `menu/[category]/page.tsx`
- `reservation/page.tsx`, `reservation/datepicker-custom.css`
- `checkout/page.tsx`
- `cart/page.tsx`, `cart/loading.tsx`

> KHÔNG move: `src/app/(web)/api/**` (A-01). Sau move, kiểm import tương đối font/css trong layout & reservation page (đường dẫn `./` vẫn đúng vì file cùng cấp được move theo).

### MODIFIED

| File | Thay đổi |
|---|---|
| `next.config.ts` (root) | `import createNextIntlPlugin` → `export default withNextIntl(nextConfig)` với `createNextIntlPlugin('./src/i18n/request.ts')`; giữ nguyên `images` |
| `src/proxy.ts` | compose intl middleware sau block auth admin + bỏ qua `/api` (section 10) |
| `src/app/(web)/[locale]/layout.tsx` | `<html lang={locale}>`, `await params`, guard `notFound()`, `getMessages()`, bọc `NextIntlClientProvider`; giữ mọi thứ khác |
| `src/components/web/shared/header/Header.tsx` | render `<LanguageSwitcher/>` (vị trí phối hợp nhánh UI) |
| `src/components/web/shared/header/DesktopMenu.tsx` | đổi import `Link`,`usePathname` → `@/i18n/navigation` (active state so path không-locale) |
| `src/components/web/shared/header/MobileMenu.tsx` | đổi import `Link`,`usePathname` → `@/i18n/navigation` |
| `src/components/web/features/cart/CartSubmit.tsx` | đổi `useRouter` → `@/i18n/navigation`; `router.push(webRoutes.checkout())` giữ locale |
| Các file dùng `Link` + `webRoutes` (web user) | đổi import `Link` → `@/i18n/navigation`: `features/cart/EmptyCart`, `features/checkout/CheckoutForm`, `CheckoutRender`, `features/home/HeroSection`, `ReviewsSection`, `features/menu/FoodCategories`, `NewFood`, `features/reservation/ReservationInformation`, `ReservationSubmitSuccess`, `shared/CallToWhatsApp`, `shared/Footer`, `shared/GoToMenuButton`, `shared/NotFound`, `shared/ProductCard`, `shared/header/CartButton`, `shared/header/Logo`, `ui/button/index.tsx`, `shared/quick-cart/QuickCartModal.tsx` |
| `src/app/(web)/[locale]/dish/page.tsx`, `menu/page.tsx` | `redirect` → `@/i18n/navigation` (giữ locale khi redirect) |
| ~32+ component có chuỗi tĩnh Loại C | thay literal JSX bằng `useTranslations`/`getTranslations` (theo namespace) — nhóm: `features/reservation/*`, `features/checkout/*`, `features/cart/*`, `features/products/*`, `features/home/*`, `features/menu/*`, `shared/*` (Footer, QuantityEditor/AddonsEditor nếu user-facing, header/*, NotFound), `ui/button/*` |
| `.sdlc/architecture.md` | cập nhật section i18n (routing.ts/navigation.ts/request.ts, proxy compose, localePrefix always, EC-03=404) |

> `webRoutes`/`WEB_ROUTE` trong `src/constants/route.ts`: **KHÔNG đổi** (giữ path không locale; navigation wrapper tự thêm prefix). Đây là quyết định để tránh sửa API rộng và giữ nav consistent (RI-07).

### Không đụng (xác nhận)

`src/services/**`, `src/services/cached/**`, `src/db/**`, admin routes/components, `src/app/sitemap.ts`, `src/app/not-found.tsx` (root), API web user routes.

---

## Self-review

- **Mọi RULE-01..12 + EC-01..12 + NFR-01..07** có trong bảng section 8 → 100%.
- **Mọi EC** có error handling trong API Contracts (section 6) / UI Flow (section 7).
- **Mọi RI-01..10** có Regression-safe Plan (section 10).
- **Conflict?** Không — dùng đúng stack (Next 16/RSC/TS), giữ `proxy.ts` convention (Next 16), giữ `webRoutes`, không schema DB, không đụng admin/cache.
- **Endpoint/entity thừa?** Không thêm endpoint/entity nào.
