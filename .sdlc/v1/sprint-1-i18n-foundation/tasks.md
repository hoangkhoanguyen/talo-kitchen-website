# Tasks — sprint-1-i18n-foundation (v1 i18n)

> Skill: task-breakdown. Nguồn chuẩn = `design.md` (ui-design.md ghi sai 2 điểm, đã sửa theo design.md — xem TASK-07).
> Execute theo thứ tự phụ thuộc. Tasks cùng "wave" (không phụ thuộc lẫn nhau) chạy song song được.
> Status mỗi task: `todo` / `doing` / `done` (+ `blocked: <lý do>`). Cập nhật file này sau mỗi task để resume.

## Reviewer-locked decisions (BẮT BUỘC theo đúng)

1. **LanguageSwitcher import**: config locales từ `@/i18n/routing`; `Link`/`router`/`usePathname` từ `@/i18n/navigation`. **KHÔNG** dùng `src/i18n/config.ts` (file không tồn tại — ui-design.md ghi sai).
2. **Đổi locale**: dùng `router.replace(pathname, { locale })` + `useSearchParams()` để **giữ query string** (design.md §7). **KHÔNG** dùng `<Link>` trơn (rớt `?ref=...`, fail EC-09).

## Ràng buộc cứng

- KHÔNG đổi schema DB. KHÔNG i18n nội dung động (product/config/reviews). KHÔNG đụng admin UI/route/auth logic (chỉ compose, không sửa hành vi). Web user KHÔNG đổi visual (chỉ bọc + đổi text). Cache-per-locale KHÔNG làm ở sprint-1.
- `next.config.ts` ở **ROOT repo** (không phải `src/`). `messages/` ở ROOT repo.
- `webRoutes`/`WEB_ROUTE` (`src/constants/route.ts`) GIỮ NGUYÊN (path không locale).
- A-11 (`Filter.tsx` placeholder) optional — không coi là coverage gap.

---

## Waves (thứ tự thực thi)

- **Wave 1** (sequential foundation): TASK-01 → TASK-02
- **Wave 2** (song song sau Wave 1): TASK-03, TASK-05
- **Wave 3** (sau TASK-03): TASK-04, TASK-06
- **Wave 4** (sau TASK-06): TASK-07
- **Wave 5** (song song, sau TASK-03 + TASK-02): TASK-08, TASK-09, TASK-10, TASK-11, TASK-12, TASK-13, TASK-14, TASK-15
- **Wave 6** (sau tất cả extraction): TASK-16

---

- [x] TASK-01  (done)
  Description: Cài `next-intl@latest`; tạo module i18n `src/i18n/routing.ts` (`defineRouting({ locales:['en','vi'], defaultLocale:'en', localePrefix:'always' })`), `src/i18n/navigation.ts` (`createNavigation(routing)` → export `Link, redirect, usePathname, useRouter, getPathname`), `src/i18n/request.ts` (`getRequestConfig`: validate locale qua `routing.locales`, fallback default, load `messages/<locale>.json`, **merge `en` làm fallback cho key thiếu** — EC-06/RULE-08); bọc `createNextIntlPlugin('./src/i18n/request.ts')` quanh `next.config.ts` ở ROOT (giữ nguyên `images.remotePatterns`/`qualities`).
  Serves: RULE-01, RULE-02, RULE-03, RULE-08, EC-06, EC-12, NFR-01, NFR-05, NFR-07, RI-08, DoD "next-intl cài + cấu hình"
  Design ref: §1, §4 (module i18n), §5 (Locale config), §10 (RI-08), §11 NEW (routing/navigation/request), §11 MODIFIED (next.config.ts)
  Expected files: `package.json`, `src/i18n/routing.ts` (NEW), `src/i18n/navigation.ts` (NEW), `src/i18n/request.ts` (NEW), `next.config.ts` (MODIFIED, root)
  Dependencies: none
  Suggested skill: (none)
  Difficulty: normal
  Test: `next build`/typecheck pass; import `routing`/`navigation` không lỗi; `images` config còn nguyên trong next.config; unit-check `request.ts` trả en cho locale sai + fallback en cho key thiếu.

- [x] TASK-02  (done)
  Description: Tạo `messages/en.json` + `messages/vi.json` (ROOT) với cây namespace theo feature: `common`, `header`, `footer`, `home`, `menu`, `reservation`, `cart`, `checkout`, `products`, `notFound`. Seed tối thiểu namespace `notFound` + `common` (đủ để layout/not-found render); các namespace còn lại tạo object rỗng làm khung để extraction tasks (TASK-08..15) đổ key vào. `en` = nguyên văn English; `vi` = bản dịch. `vi.json` cùng cây key với `en.json`.
  Serves: RULE-07, RULE-08, AC-05.2, AC-05.3, EC-06, EC-11, NFR-02, Data Entities (Message catalog)
  Design ref: §5 (Message catalog EN/VI, namespaces), §11 NEW (messages/en.json, vi.json)
  Expected files: `messages/en.json` (NEW), `messages/vi.json` (NEW)
  Dependencies: TASK-01
  Suggested skill: (none)
  Difficulty: easy
  Test: JSON hợp lệ; `en.json` và `vi.json` có cùng tập namespace gốc; `request.ts` load được cả hai không lỗi.

- [x] TASK-03  (done)
  Description: Di chuyển toàn bộ page/layout web user từ `src/app/(web)/` → `src/app/(web)/[locale]/` (dùng `git mv` giữ history): `layout.tsx`, `page.tsx`, `SVN-Allogist.otf`, `dish/page.tsx`, `dish/[slug]/page.tsx`, `menu/page.tsx`, `menu/[category]/page.tsx`, `reservation/page.tsx`, `reservation/datepicker-custom.css`, `checkout/page.tsx`, `cart/page.tsx`, `cart/loading.tsx`. **GIỮ `src/app/(web)/api/` NGOÀI `[locale]`.** Move font+css cùng cấp để import tương đối (`./SVN-Allogist.otf`, `./reservation/datepicker-custom.css`) không vỡ. Rewrite `[locale]/layout.tsx`: `const { locale } = await params` (Next 16 params là Promise), `if (!routing.locales.includes(locale)) notFound()` (EC-03/RULE-05), `getMessages()`, `<html lang={locale}>` (bỏ `lang="en"` cứng), bọc `<NextIntlClientProvider messages={messages}>`; GIỮ NGUYÊN GTM scripts, fonts, providers (WebsiteQueryProvider, AnimationHeaderScroll), Toaster, QuickCartModal, FloatingActions, Header/Footer, `getUIConfigsByKeyCached("layout")`, `export const dynamic = "force-dynamic"`.
  Serves: AC-02.1, AC-02.2, AC-02.3, AC-04.1, AC-04.2, AC-04.3, EC-03, EC-10, RULE-05, RULE-06, RULE-11, NFR-02, RI-03, RI-04, RI-09, RI-10, Story-04
  Design ref: §4 (cấu trúc thư mục, Render RSC), §10 (RI-03/04/09/10), §11 MOVED, §11 MODIFIED ([locale]/layout.tsx)
  Expected files: move 12 file trên vào `src/app/(web)/[locale]/…`; `src/app/(web)/[locale]/layout.tsx` (MODIFIED). KHÔNG đụng `src/app/(web)/api/**`.
  Dependencies: TASK-01, TASK-02
  Suggested skill: (none)
  Difficulty: high
  Justification: refactor di chuyển ~12 file route + rewrite layout lõi (params Promise, guard notFound, provider wrap) — regression rộng cho toàn bộ routing/render web user; lỗi (import tương đối vỡ, mất provider, sai render mode) khó lộ qua test đơn.
  Test: `/en` và `/vi` render; `/` redirect có prefix; `/fr/...` → 404; `<html lang>` khớp locale; font + datepicker css load; Header/Footer/QuickCartModal/FloatingActions còn; so sánh render `/en` với baseline (NFR-02).

- [x] TASK-04  (done)
  Description: Tạo `src/app/(web)/[locale]/not-found.tsx` — 404 đã dịch qua namespace `notFound`, tái sử dụng cấu trúc/tokens của `src/app/not-found.tsx` hiện có nhưng **KHÔNG tự render `<body>`** (đã nằm trong `[locale]/layout.tsx` có `<html>/<body>`). GIỮ NGUYÊN root `src/app/not-found.tsx` (English fallback cho path ngoài `[locale]`).
  Serves: AC-05.2 (404 text), EC-10, RI-06, DAC-09, Story-05
  Design ref: §7 (States — 404 trong locale), §10 (RI-06), §11 NEW ([locale]/not-found.tsx)
  Expected files: `src/app/(web)/[locale]/not-found.tsx` (NEW); (đảm bảo `messages` có namespace `notFound` — TASK-02)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: easy
  Test: điều hướng tới path không tồn tại trong locale → 404 dịch, `<html lang>` đúng, không render `<body>` lồng; root `not-found.tsx` không đổi.

- [x] TASK-05  (done)
  Description: Sửa `src/proxy.ts` compose: GIỮ NGUYÊN toàn bộ block auth admin (chạy TRƯỚC, return sớm cho `/admin/login` và `/admin/*`); thêm `if (pathname.startsWith('/api')) return NextResponse.next();` (bỏ qua i18n cho API — EC-04/RULE-09); còn lại → `createIntlMiddleware(routing)(request)` cho route web user (detect path > cookie `NEXT_LOCALE` > Accept-Language > default). Giữ matcher hiện tại (đủ; logic tự bỏ qua `/api`,`/admin`). Không đổi hành vi auth admin.
  Serves: AC-02.1, AC-03.2, AC-03.3, AC-03.4, AC-06.1, AC-06.2, EC-01, EC-02, EC-04, EC-05, RULE-02, RULE-03, RULE-09, RULE-10, NFR-04, RI-01, RI-02, Story-03
  Design ref: §4 (Luồng request), §6 (bảng hành vi middleware), §10 (proxy.ts compose, RI-01/02)
  Expected files: `src/proxy.ts` (MODIFIED)
  Dependencies: TASK-01
  Suggested skill: (none)
  Difficulty: high
  Justification: compose auth/middleware — thứ tự sai gây mất auth admin, redirect loop, hoặc chèn locale vào `/api`; lỗi authz/redirect surface tinh vi, không lộ hết qua unit test.
  Test: `/` không cookie → 307 `/en`; Accept-Language vi → `/vi`; cookie `NEXT_LOCALE=vi` + gõ `/en/...` → giữ en (path thắng cookie); `/admin/dashboard` chưa login → `/admin/login?callback_url=...` không prefix locale; `/api/products/ids` khi ở `/vi` → path giữ `/api/...` trả 200; không redirect loop.

- [x] TASK-06  (done)
  Description: Đổi import `Link`/`redirect`/`useRouter`/`usePathname` từ `next/link`+`next/navigation` sang `@/i18n/navigation` ở 23 file web user (để nav tự nối/giữ prefix locale). `webRoutes` GIỮ NGUYÊN, feed vào href/push như cũ. Danh sách: `src/app/(web)/[locale]/dish/page.tsx`, `[locale]/dish/[slug]/page.tsx`, `[locale]/menu/page.tsx` (dùng `redirect`); `components/web/features/cart/CartSubmit.tsx`, `EmptyCart.tsx`, `features/checkout/CheckoutForm.tsx`, `CheckoutRender.tsx`, `features/home/HeroSection.tsx`, `ReviewsSection.tsx`, `features/menu/FoodCategories.tsx`, `NewFood.tsx`, `features/reservation/ReservationInformation.tsx`, `ReservationSubmitSuccess.tsx`, `shared/CallToWhatsApp.tsx`, `shared/Footer.tsx`, `shared/GoToMenuButton.tsx`, `shared/NotFound.tsx`, `shared/ProductCard.tsx`, `shared/header/CartButton.tsx`, `shared/header/DesktopMenu.tsx`, `shared/header/Logo.tsx`, `shared/header/MobileMenu.tsx`, `ui/button/index.tsx`. (Lưu ý: `quick-cart/QuickCartModal.tsx` — kiểm tra, chỉ đổi nếu có import nav.)
  Serves: AC-01.2, EC-08, RULE-12, RI-07, Story-02
  Design ref: §1 (Navigation locale-aware), §4, §10 (RI-07), §11 MODIFIED (danh sách file Link/webRoutes, dish/menu redirect)
  Expected files: 23 file kể trên (MODIFIED)
  Dependencies: TASK-01, TASK-03
  Suggested skill: (none)
  Difficulty: normal
  Test: build/typecheck pass; ở `/vi`, click ProductCard → `/vi/dish/[slug]`, Add to cart → `/vi/cart`, footer/header links giữ `/vi`; `redirect` trong dish/menu page giữ locale; không còn import `next/link`/`next/navigation` trong 23 file (trừ chuỗi kỹ thuật hợp lệ).

- [x] TASK-07  (done)
  Description: Tạo `src/components/web/shared/header/LanguageSwitcher.tsx` (client component, segmented toggle `EN | VI` theo ui-design.md — tokens `web-*`, active `bg-web-secondary-1`, focus `outline-web-primary`, `aria-current` cho locale đang chọn, a11y keyboard, render 1 segment/locale từ `routing.locales` → locale-agnostic DAC-06). **Cơ chế đổi locale theo design.md §7 (reviewer-locked)**: `usePathname()`/`useRouter()` từ `@/i18n/navigation`, `useLocale()`, `useSearchParams()`; chọn locale mới → `router.replace(<pathname + query string>, { locale: nextLocale })` để giữ path + dynamic segment + query (EC-09). Labels `EN`/`VI` KHÔNG lấy từ messages (locale-stable — DAC-07). Wire vào `Header.tsx` upper utility bar (nhóm phải, cạnh welcome text; visible mọi breakpoint).
  Serves: AC-01.1, AC-01.2, AC-01.3, EC-09, RULE-04, NFR-03, DAC-01, DAC-02, DAC-03, DAC-04, DAC-05, DAC-06, DAC-07, Story-01
  Design ref: design.md §7 (Language Switcher — cơ chế `router.replace`+`useSearchParams`), ui-design.md (component spec, DAC-01..07)
  Expected files: `src/components/web/shared/header/LanguageSwitcher.tsx` (NEW), `src/components/web/shared/header/Header.tsx` (MODIFIED)
  Dependencies: TASK-01, TASK-06
  Suggested skill: (none)
  Difficulty: normal
  Test: ở `/vi/dish/pho-bo?ref=abc` chọn EN → `/en/dish/pho-bo?ref=abc` (giữ slug + query); active state đúng theo locale hiện tại; cookie `NEXT_LOCALE` được set; keyboard focusable + `aria-current`; responsive @360px không wrap/overflow; import từ `@/i18n/routing` + `@/i18n/navigation` (KHÔNG `src/i18n/config.ts`).

- [x] TASK-08  (done)
  Description: Trích chuỗi tĩnh Loại C trong `src/components/web/features/reservation/*` (vd ReservationForm: "Make a Reservation", "Reservation Details", "Preferred Date (GMT +7) *", "Please fill out all required fields…") ra namespace `reservation` trong `messages/en.json` (nguyên văn) + `messages/vi.json` (dịch). RSC → `getTranslations`, client → `useTranslations`. Chuỗi nội suy dùng ICU placeholder (EC-11). Bỏ literal JSX.
  Serves: AC-05.1, AC-05.2, AC-05.4, EC-11, RULE-07, NFR-01, NFR-02, Story-05
  Design ref: §1 (Loại C), §5 (namespaces, ICU), §11 MODIFIED (~32+ component)
  Expected files: `src/components/web/features/reservation/*` (MODIFIED), `messages/en.json` + `messages/vi.json` (namespace `reservation`)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: normal
  Test: `/en/reservation` chuỗi English y hệt baseline; `/vi/reservation` hiện tiếng Việt; không còn literal user-facing trong file feature reservation; chuỗi ICU render đúng biến.

- [x] TASK-09  (done)
  Description: Trích chuỗi tĩnh Loại C trong `src/components/web/features/checkout/*` (CheckoutForm, CheckoutRender, …) ra namespace `checkout` (en nguyên văn + vi dịch). RSC `getTranslations` / client `useTranslations`; ICU cho chuỗi nội suy (tổng tiền để component truyền giá trị đã format — EC-11).
  Serves: AC-05.1, AC-05.2, AC-05.4, EC-11, RULE-07, NFR-01, NFR-02, Story-05
  Design ref: §1, §5, §11 MODIFIED
  Expected files: `src/components/web/features/checkout/*` (MODIFIED), `messages/*.json` (namespace `checkout`)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: normal
  Test: `/en/checkout` == baseline; `/vi/checkout` tiếng Việt; không còn literal user-facing.

- [x] TASK-10  (done)
  Description: Trích chuỗi tĩnh Loại C trong `src/components/web/features/cart/*` (CartSummary, CartSubmit, EmptyCart, CartIntro, …) ra namespace `cart` (en nguyên văn + vi dịch). ICU cho số lượng/tổng tiền (EC-11).
  Serves: AC-05.1, AC-05.2, AC-05.4, EC-11, RULE-07, NFR-01, NFR-02, Story-05
  Design ref: §1, §5, §11 MODIFIED
  Expected files: `src/components/web/features/cart/*` (MODIFIED), `messages/*.json` (namespace `cart`)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: normal
  Test: `/en/cart` == baseline; `/vi/cart` tiếng Việt; empty cart state dịch đúng; không còn literal user-facing.

- [x] TASK-11  (done)
  Description: Trích chuỗi tĩnh Loại C trong `src/components/web/features/products/*` (AddToCartButton, ProductAddOns, ProductInformation, …) ra namespace `products` (en nguyên văn + vi dịch). LƯU Ý: KHÔNG dịch nội dung động (tên/mô tả sản phẩm — RULE-11/EC-07), chỉ nhãn UI tĩnh.
  Serves: AC-05.1, AC-05.2, AC-05.4, EC-07, RULE-07, RULE-11, NFR-02, Story-05
  Design ref: §1, §5, §11 MODIFIED
  Expected files: `src/components/web/features/products/*` (MODIFIED), `messages/*.json` (namespace `products`)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: normal
  Test: nhãn tĩnh dịch ở `/vi`; tên sản phẩm vẫn nguyên (dynamic) ở mọi locale; `/en` == baseline.

- [x] TASK-12  (done)
  Description: Trích chuỗi tĩnh Loại C trong `src/components/web/features/home/*` (Hero/Contact/Reviews/OurStory, …) ra namespace `home` (en nguyên văn + vi dịch). Nội dung động từ config `ui` GIỮ NGUYÊN (RULE-11).
  Serves: AC-05.1, AC-05.2, AC-05.4, EC-07, RULE-07, RULE-11, NFR-02, Story-05
  Design ref: §1, §5, §11 MODIFIED
  Expected files: `src/components/web/features/home/*` (MODIFIED), `messages/*.json` (namespace `home`)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: normal
  Test: `/en/` == baseline; chuỗi tĩnh home dịch ở `/vi`; config `ui` content không bị localize.

- [x] TASK-13  (done)
  Description: Trích chuỗi tĩnh Loại C trong `src/components/web/features/menu/*` (NoServeFood, AboutMenu, FoodCategories, NewFood, …) ra namespace `menu` (en nguyên văn + vi dịch).
  Serves: AC-05.1, AC-05.2, AC-05.4, RULE-07, RULE-11, NFR-02, Story-05
  Design ref: §1, §5, §11 MODIFIED
  Expected files: `src/components/web/features/menu/*` (MODIFIED), `messages/*.json` (namespace `menu`)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: normal
  Test: `/en/menu/all` == baseline; chuỗi tĩnh menu dịch ở `/vi/menu/all`; category/tên món (dynamic) nguyên trạng.

- [x] TASK-14  (done)
  Description: Trích chuỗi tĩnh Loại C trong `src/components/web/shared/*` ra namespace phù hợp (`footer`, `header`, `common`): Footer, header/* (nếu có text tĩnh), NotFound, GoToMenuButton, CallToWhatsApp, ProductCard (nhãn tĩnh), QuantityEditor, AddonsEditor (nếu user-facing). `Filter.tsx` optional (A-11 — không bắt buộc). en nguyên văn + vi dịch.
  Serves: AC-05.1, AC-05.2, AC-05.4, RULE-07, NFR-02, Story-05
  Design ref: §1, §5, §11 MODIFIED (shared/*)
  Expected files: `src/components/web/shared/*` (MODIFIED), `messages/*.json` (namespaces `footer`/`header`/`common`)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: normal
  Test: Footer/shared text dịch ở `/vi`; `/en` == baseline; không còn literal user-facing trong shared (trừ Filter placeholder nếu bỏ qua).

- [x] TASK-15  (done)
  Description: Trích chuỗi tĩnh Loại C còn lại: `src/components/web/ui/button/*` + chuỗi tĩnh cấp page trong `src/app/(web)/[locale]/**` (nếu có literal user-facing trong page.tsx: page dùng `getTranslations`). Namespace phù hợp (`common` cho nút chung, hoặc namespace feature của page). en nguyên văn + vi dịch.
  Serves: AC-05.1, AC-05.2, AC-05.4, RULE-07, NFR-01, NFR-02, Story-05
  Design ref: §1, §5, §11 MODIFIED (ui/button/*)
  Expected files: `src/components/web/ui/button/*` (MODIFIED), `src/app/(web)/[locale]/**/page.tsx` (MODIFIED nếu có literal)
  Dependencies: TASK-03, TASK-02
  Suggested skill: (none)
  Difficulty: normal
  Test: nút chung dịch ở `/vi`; `/en` == baseline; page-level literal (nếu có) đã trích.

- [x] TASK-16  (done)
  Description: Final sweep + cập nhật doc. (a) Grep toàn bộ `src/app/(web)/[locale]/**` + `src/components/web/**` tìm chuỗi user-facing hardcode còn sót (AC-05.4) — trừ chuỗi kỹ thuật/không hiển thị và `Filter.tsx` (A-11); đưa nốt vào messages. (b) Verify `en.json`/`vi.json` cùng tập key, mỗi vi key có giá trị hoặc chấp nhận fallback en (EC-06). (c) Verify EC-12 locale-agnostic: thêm `'ko'` vào `locales` (thử nghiệm) không cần sửa routing/middleware/nav — rồi revert. (d) Cập nhật `.sdlc/architecture.md` section i18n cho khớp implement (routing.ts/navigation.ts/request.ts, proxy compose, localePrefix always, EC-03=404).
  Serves: AC-05.3, AC-05.4, EC-06, EC-12, NFR-05, RULE-08, DoD (không còn hardcode, locale-agnostic, fallback)
  Design ref: §5, §8 (EC-06/EC-12), §11 MODIFIED (architecture.md)
  Expected files: `messages/*.json` (nếu còn sót), `.sdlc/architecture.md` (MODIFIED), (revert thử nghiệm `ko`)
  Dependencies: TASK-08, TASK-09, TASK-10, TASK-11, TASK-12, TASK-13, TASK-14, TASK-15
  Suggested skill: self-review
  Test: grep không còn chuỗi user-facing hardcode; key thiếu ở vi → render en (không hiện key thô); thêm locale thử chỉ đụng `routing.ts` + file messages; architecture.md khớp.

---

## Coverage — AC / EC / NFR / DAC → Task

### Acceptance Criteria (Stories)
| ID | Task |
|---|---|
| AC-01.1 | TASK-07 |
| AC-01.2 | TASK-06, TASK-07 |
| AC-01.3 | TASK-07 |
| AC-02.1 | TASK-03, TASK-05 |
| AC-02.2 | TASK-03, TASK-05 |
| AC-02.3 | TASK-03 |
| AC-03.1 | TASK-05 |
| AC-03.2 | TASK-05 |
| AC-03.3 | TASK-05 |
| AC-03.4 | TASK-05 |
| AC-04.1 | TASK-03 |
| AC-04.2 | TASK-03 |
| AC-04.3 | TASK-03 |
| AC-05.1 | TASK-08..15 |
| AC-05.2 | TASK-02, TASK-04, TASK-08..15 |
| AC-05.3 | TASK-01, TASK-16 |
| AC-05.4 | TASK-08..15, TASK-16 |
| AC-06.1 | TASK-05 |
| AC-06.2 | TASK-05 |
| AC-06.3 | TASK-05 (không đọc messages ở admin — không đụng admin) |

### Business Rules
| ID | Task |
|---|---|
| RULE-01 | TASK-01 |
| RULE-02 | TASK-01, TASK-05 |
| RULE-03 | TASK-05 |
| RULE-04 | TASK-07 |
| RULE-05 | TASK-03 (guard notFound) |
| RULE-06 | TASK-03 |
| RULE-07 | TASK-08..15 |
| RULE-08 | TASK-01, TASK-16 |
| RULE-09 | TASK-05 |
| RULE-10 | TASK-05 |
| RULE-11 | TASK-03, TASK-11, TASK-12, TASK-13 |
| RULE-12 | TASK-06, TASK-07 |

### Edge Cases
| ID | Task |
|---|---|
| EC-01 | TASK-05 |
| EC-02 | TASK-05 |
| EC-03 | TASK-03 (layout guard notFound) |
| EC-04 | TASK-05 |
| EC-05 | TASK-05 |
| EC-06 | TASK-01, TASK-16 |
| EC-07 | TASK-11, TASK-12, TASK-13 (không localize dynamic) |
| EC-08 | TASK-06 |
| EC-09 | TASK-07 |
| EC-10 | TASK-03 |
| EC-11 | TASK-08, TASK-09, TASK-10 (ICU) |
| EC-12 | TASK-01, TASK-16 |

### NFR
| ID | Task |
|---|---|
| NFR-01 | TASK-01, TASK-08..15 (ưu tiên getTranslations) |
| NFR-02 | TASK-02, TASK-03, TASK-08..15 (en nguyên văn, no visual change) |
| NFR-03 | TASK-03 (html lang), TASK-07 (switcher a11y) |
| NFR-04 | TASK-05 (no redirect loop) |
| NFR-05 | TASK-01, TASK-16 |
| NFR-06 | TASK-05 (cookie/auth) |
| NFR-07 | TASK-01 (routing.locales dùng chung) |

### Design AC (ui-design)
| ID | Task |
|---|---|
| DAC-01 | TASK-07 |
| DAC-02 | TASK-07 |
| DAC-03 | TASK-07 |
| DAC-04 | TASK-07 |
| DAC-05 | TASK-07 |
| DAC-06 | TASK-07 |
| DAC-07 | TASK-07 |
| DAC-08 | TASK-03 (no visual change pages — verify `/en` == baseline) |
| DAC-09 | TASK-04 (reuse 404 layout) |
| DAC-10 | TASK-03 (`<html lang>`) |

### Regression Impact
| RI | Task |
|---|---|
| RI-01 | TASK-05 |
| RI-02 | TASK-05 |
| RI-03 | TASK-03 |
| RI-04 | TASK-03 |
| RI-05 | (giữ nguyên sitemap — no task; verify không 404 loop trong test TASK-05) |
| RI-06 | TASK-04 |
| RI-07 | TASK-06 |
| RI-08 | TASK-01 |
| RI-09 | TASK-03 |
| RI-10 | TASK-03 |

> RI-05 (sitemap) và root `not-found.tsx`: KHÔNG đổi (design §11 "Không đụng"); an toàn được verify gián tiếp trong test TASK-05 (không redirect loop) và TASK-04 (root 404 giữ nguyên).

## Self-review (task-breakdown checklist)
- [x] Mọi AC-xx / EC-xx / NFR-xx / DAC-xx có ≥1 task sở hữu (bảng coverage trên).
- [x] Task song song đánh dấu theo Wave (Wave 2, Wave 5).
- [x] Phụ thuộc đúng thứ tự: foundation (01→02) → move/proxy (03,05) → not-found/nav (04,06) → switcher (07) → extraction (08–15) → sweep (16).
- [x] Mỗi task có tiêu chí test rõ để đánh done.
- [x] `Difficulty: high` chỉ ở TASK-03 (refactor rộng, regression) và TASK-05 (auth/middleware compose) — có justification; phần còn lại normal/easy.
