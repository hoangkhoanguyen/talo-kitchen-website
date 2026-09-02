# Requirements — sprint-1-i18n-foundation (v1 i18n)

> Skill: requirements-analysis. Scope: CHỈ sprint-1 (nền tảng i18n + chuỗi tĩnh Loại C). Không lấn sprint-2/3/4.

---

# PART 1 — HUMAN REVIEW

## 1. Sprint Goal & Scope

**Goal:** Dựng nền tảng i18n cho **web USER** của Talo Kitchen bằng **next-intl** (App Router / RSC), thêm routing theo path `/en/...` và `/vi/...` (`en` mặc định), middleware phát hiện locale, language switcher EN/VI ở Header, và trích **toàn bộ chuỗi tĩnh user-facing hardcode trong JSX (Loại C)** ra `messages/en.json` + `messages/vi.json`. Kiến trúc phải locale-agnostic để thêm ngôn ngữ thứ 3 sau này mà không đập lại.

**For whom:** Khách truy cập website (user-facing). Không phục vụ admin trong sprint này.

### ✅ In scope
- Cài + cấu hình `next-intl` cho App Router/RSC (config request, plugin next.config, provider).
- Bọc các trang web user dưới segment `src/app/(web)/[locale]/`; URL `/en/...`, `/vi/...`; `en` default.
- Danh sách locale tập trung một chỗ (locale-agnostic; thêm locale = sửa 1 config).
- Tích hợp phát hiện locale vào middleware hiện có (`src/proxy.ts`): path → cookie `NEXT_LOCALE` → `Accept-Language`; redirect về path có locale; giữ locale khi refresh.
- Language switcher (EN/VI) ở Header web user; đổi locale nhưng giữ nguyên trang hiện tại.
- Trích chuỗi tĩnh hardcode (Loại C) ở tất cả trang/component web user ra `messages/en.json` + `messages/vi.json`; thay bằng hàm dịch next-intl. `en` = chuỗi hiện tại nguyên văn; `vi` = dịch mới.
- `<html lang>` set đúng theo locale (thay `lang="en"` cứng).
- Điều hướng client (Link/router) trong web user thành locale-aware để không rớt về `en` khi đang ở `vi`.

### ❌ Out of scope (thuộc sprint khác / không làm)
- **KHÔNG dịch giao diện admin.** Không bọc `src/app/(admin)/` vào `[locale]`; label admin giữ tiếng Việt.
- **KHÔNG** đổi schema DB, không đổi cấu trúc nội dung động (`configs` UI, products…). (sprint-2/3)
- **KHÔNG** dịch nội dung động (config `ui`, tên/mô tả sản phẩm, category, addon, reviews). Trong sprint-1 nội dung động vẫn hiển thị **nguyên như hiện tại ở MỌI locale**. (sprint-2/3)
- **KHÔNG** làm SEO hreflang / `alternates.languages` / `generateMetadata` theo locale, không đổi format tiền/ngày (`moment`). (sprint-4)
- **KHÔNG** dịch chuỗi trong API responses / toast lỗi backend (chỉ chuỗi UI render trong JSX web user).

## 2. Open Questions (cần user quyết; nếu không trả lời sẽ dùng assumption đã ghi)

- **OQ-01 — API routes dưới `app/(web)/api/`:** Xác nhận **loại trừ khỏi locale routing** (giữ URL `/api/...` không prefix locale). → Assumption A-01: có, loại trừ; giữ API tại `src/app/(web)/api/` (không di chuyển vào `[locale]`), matcher middleware bỏ qua `/api`.
- **OQ-02 — sitemap.ts:** Sprint-1 có cần sitemap phát ra URL kèm locale (`/en`, `/vi`) chưa, hay giữ nguyên (URL không locale, để middleware redirect)? → Assumption A-02: **giữ nguyên sitemap** trong sprint-1; hreflang + URL đa locale làm ở sprint-4. Redirect middleware đảm bảo URL cũ vẫn tới đúng trang.
- **OQ-03 — `not-found.tsx` (404):** Trang 404 hiện ở root và tự render `<body>` với chuỗi English cứng. Sprint-1 có cần 404 theo locale (dịch + `<html lang>` đúng) không? → Assumption A-03: thêm `not-found` trong `[locale]` dùng messages đã dịch; giữ 404 global (root) làm fallback cho path ngoài locale, chuỗi English. Nếu user muốn tối giản, có thể để nguyên 404 hiện tại (English) trong sprint-1 và dịch ở sprint-4.
- **OQ-04 — `localePrefix` strategy:** Dùng `always` (mọi URL đều có `/en` hoặc `/vi`, kể cả default) hay `as-needed` (`en` không prefix)? → Assumption A-04: dùng **`always`** để nhất quán với yêu cầu "URL `/en/...` và `/vi/...`" và để cache/hreflang sprint-4 đơn giản. (Nếu chọn `as-needed`, `/en` sẽ hiển thị không prefix — cần user xác nhận vì ảnh hưởng SEO/redirect.)
- **OQ-05 — Cache tag theo locale:** Sprint-1 chỉ đụng chuỗi tĩnh (không đọc DB theo locale), nhưng layout đang gọi `getUIConfigsByKeyCached("layout")`. Có cần thêm `locale` vào cache key/tag ngay ở sprint-1 không? → Assumption A-05: **CHƯA** đổi cache trong sprint-1 (nội dung động chưa localized nên cache theo locale vô nghĩa và có rủi ro regression). Đặt nền + chi tiết hoá ở sprint-2/3 như plan.

## 3. Key Assumptions (tự quyết từ business logic; user có thể override)

- **A-01:** API routes (`app/(web)/api/products/ids`, `app/(web)/api/products/quick/[id]`) KHÔNG nằm dưới `[locale]`; giữ nguyên đường dẫn `/api/...`. Middleware next-intl bỏ qua `/api`, `/_next`, `/admin`, static assets.
- **A-02:** sitemap giữ nguyên (deferred to sprint-4).
- **A-03:** Thêm `[locale]/not-found` đã dịch; 404 global giữ English làm fallback.
- **A-04:** `localePrefix: "always"`.
- **A-05:** Không đổi cache trong sprint-1.
- **A-06:** Middleware = kết hợp (compose) logic next-intl với `proxy.ts` hiện có. Auth admin chạy TRƯỚC/độc lập cho `/admin/*`; next-intl chỉ xử lý route web user. Không được phá luồng redirect login admin.
- **A-07:** Danh sách locale + default khai báo tập trung tại một module (vd `src/i18n/config.ts`): `locales = ["en","vi"]`, `defaultLocale = "en"`. Thêm ngôn ngữ = thêm vào mảng + thêm file `messages/<locale>.json`.
- **A-08:** `en` messages = trích **nguyên văn** chuỗi English hiện có (không được đổi câu chữ) để không thay đổi giao diện English hiện hành. `vi` là bản dịch mới do team dịch (giá trị placeholder chấp nhận được nếu chưa có bản dịch cuối, miễn không rỗng gây vỡ layout).
- **A-09:** Cookie locale dùng đúng tên chuẩn next-intl: `NEXT_LOCALE`.
- **A-10:** Nội dung động (configs `ui`, product name/description, reviews) trong sprint-1 **hiển thị y như hiện tại** ở cả `/en` và `/vi` (chưa dịch). Đây là hành vi mong đợi, không phải bug.
- **A-11:** Component `Filter.tsx` hiện chỉ render literal `Filter` (placeholder). Vẫn trích chuỗi này vào messages nếu nó user-facing; nếu component chưa dùng thật thì ghi nhận nhưng không bắt buộc.

---

# PART 2 — AGENT REFERENCE

> Baseline khảo sát thực tế (đường dẫn xác nhận trong repo):
> - Layout web user: `src/app/(web)/layout.tsx` — có `<html lang="en">` cứng (dòng 104), `export const dynamic = "force-dynamic"`, gọi `getUIConfigsByKeyCached("layout")`.
> - Trang web user: `src/app/(web)/page.tsx`, `dish/page.tsx`, `dish/[slug]/page.tsx`, `menu/page.tsx`, `menu/[category]/page.tsx`, `reservation/page.tsx`, `checkout/page.tsx`, `cart/page.tsx`, `cart/loading.tsx`.
> - API web user: `src/app/(web)/api/products/ids/route.ts`, `src/app/(web)/api/products/quick/[id]/route.ts`.
> - Middleware: **`src/proxy.ts`** (Next 16 dùng `proxy` thay `middleware`) — hiện chỉ xử lý auth admin; matcher loại trừ `_next/*`, `assets`, static ext. Không có xử lý locale.
> - Header: `src/components/web/shared/header/Header.tsx` (+ `HeaderContacts`, `Logo`, `DesktopMenu`, `MobileMenu`) — nơi đặt language switcher.
> - Route helpers: `src/constants/route.ts` (`webRoutes`, `WEB_ROUTE`) — trả path KHÔNG có locale; dùng khắp Link/navigation web user.
> - 404: `src/app/not-found.tsx` (chuỗi English cứng, tự render `<body>`).
> - sitemap: `src/app/sitemap.ts` (URL không locale, `force-dynamic`).
> - next.config: `src/next.config.ts` (chưa có next-intl plugin).
> - Chuỗi tĩnh hardcode (Loại C) tập trung nhiều ở: `components/web/features/reservation/*` (vd ReservationForm: "Make a Reservation", "Reservation Details", "Preferred Date (GMT +7) *", "Please fill out all required fields…"), `features/checkout/*`, `features/cart/*` (CartSummary, CartSubmit, EmptyCart, CartIntro), `features/products/*` (AddToCartButton, ProductAddOns, ProductInformation), `features/home/*` (Hero/Contact/Reviews/OurStory), `features/menu/*` (NoServeFood, AboutMenu), `shared/*` (Footer, Filter, QuantityEditor, AddonsEditor, header/*), `ui/button/*`. (~32+ file có chuỗi user-facing — grep xác nhận.)

## 4. User Stories + Acceptance Criteria

### Story-01 — Chọn ngôn ngữ hiển thị
As a **khách truy cập web**, I want **chọn EN hoặc VI trên Header**, so that **đọc website bằng ngôn ngữ tôi hiểu**.
- **AC-01.1:** GIVEN user đang ở bất kỳ trang web user WHEN mở language switcher và chọn "Tiếng Việt" THEN trang hiện tại được hiển thị bằng tiếng Việt và URL chuyển sang tiền tố `/vi/...` giữ nguyên phần path còn lại (bao gồm query & dynamic params).
- **AC-01.2:** GIVEN đang ở `/vi/reservation` WHEN chọn "English" THEN chuyển sang `/en/reservation`, giữ nguyên trang.
- **AC-01.3:** GIVEN switcher hiển thị WHEN đang ở locale `vi` THEN mục `vi` được đánh dấu là đang chọn (active state).

### Story-02 — URL phản ánh ngôn ngữ
As a **user**, I want **URL chứa locale (`/en`, `/vi`)**, so that **chia sẻ/bookmark đúng ngôn ngữ**.
- **AC-02.1:** GIVEN `localePrefix = always` WHEN truy cập `/dish/abc` (không locale) THEN middleware redirect tới `/<detected>/dish/abc`.
- **AC-02.2:** GIVEN truy cập `/en/menu/all` trực tiếp THEN trang render English, không redirect vòng.
- **AC-02.3:** GIVEN truy cập `/vi/menu/all` trực tiếp THEN trang render với chuỗi tĩnh tiếng Việt.

### Story-03 — Giữ ngôn ngữ khi quay lại
As a **user**, I want **website nhớ ngôn ngữ tôi đã chọn**, so that **không phải chọn lại mỗi lần vào**.
- **AC-03.1:** GIVEN đã chọn `vi` (cookie `NEXT_LOCALE=vi` được set) WHEN refresh trang THEN vẫn hiển thị `vi`.
- **AC-03.2:** GIVEN truy cập lần đầu không có cookie, `Accept-Language` ưu tiên `vi` WHEN vào `/` THEN redirect tới `/vi`.
- **AC-03.3:** GIVEN không cookie, `Accept-Language` không có `vi`/`en` khớp WHEN vào `/` THEN redirect tới `/en` (default).
- **AC-03.4:** Thứ tự ưu tiên phát hiện: **path có locale > cookie `NEXT_LOCALE` > `Accept-Language` > defaultLocale**.

### Story-04 — `<html lang>` đúng locale
As a **user / search engine**, I want **thẻ `<html lang>` khớp ngôn ngữ trang**, so that **trợ năng & SEO đúng**.
- **AC-04.1:** GIVEN trang `/vi/...` THEN `<html lang="vi">`.
- **AC-04.2:** GIVEN trang `/en/...` THEN `<html lang="en">`.
- **AC-04.3:** KHÔNG còn `lang="en"` hardcode trong `src/app/(web)/layout.tsx`.

### Story-05 — Chuỗi tĩnh hiển thị theo locale (Loại C)
As a **user**, I want **mọi nhãn UI tĩnh (nút, tiêu đề, label form) theo ngôn ngữ**, so that **trải nghiệm nhất quán**.
- **AC-05.1:** GIVEN `/en` THEN mọi chuỗi tĩnh user-facing hiển thị English **y hệt bản hiện tại** (không đổi câu chữ).
- **AC-05.2:** GIVEN `/vi` THEN các chuỗi tĩnh đó hiển thị bản tiếng Việt từ `messages/vi.json`.
- **AC-05.3:** GIVEN một key có trong `en.json` nhưng thiếu/rỗng ở `vi.json` WHEN render `/vi` THEN fallback sang `en` (không hiển thị key thô, không vỡ layout).
- **AC-05.4:** Không còn chuỗi tĩnh user-facing hardcode trong JSX web user (trừ chuỗi thuần kỹ thuật/không hiển thị).

### Story-06 — Admin không bị ảnh hưởng
As **admin**, I want **giao diện admin giữ nguyên tiếng Việt và route cũ**, so that **công việc vận hành không gián đoạn**.
- **AC-06.1:** GIVEN truy cập `/admin/...` THEN KHÔNG bị thêm prefix locale, KHÔNG bị next-intl redirect.
- **AC-06.2:** GIVEN admin chưa đăng nhập truy cập `/admin/dashboard` THEN vẫn redirect tới `/admin/login?callback_url=...` như trước (auth proxy nguyên vẹn).
- **AC-06.3:** Label admin vẫn tiếng Việt, không đọc `messages/*.json`.

## 5. Business Rules

- **RULE-01:** Tập locale hợp lệ = `["en", "vi"]`, khai báo tập trung một module; `defaultLocale = "en"`. Thêm locale mới CHỈ cần sửa mảng này + thêm file `messages/<locale>.json` (locale-agnostic).
- **RULE-02:** `localePrefix = "always"` (A-04): mọi URL web user có tiền tố locale, kể cả default `en`.
- **RULE-03:** Thứ tự phát hiện locale khi path chưa có locale: cookie `NEXT_LOCALE` → `Accept-Language` → `defaultLocale`. Nếu path đã có locale hợp lệ, dùng luôn locale đó (không override bằng cookie).
- **RULE-04:** Khi user đổi locale qua switcher, set cookie `NEXT_LOCALE = <locale>` và điều hướng tới cùng path với prefix locale mới (giữ query + dynamic segments).
- **RULE-05:** Locale không hợp lệ trong path (vd `/fr/...`) → xử lý như path không locale (redirect về locale phát hiện được) hoặc 404 theo hành vi mặc định next-intl; KHÔNG được crash.
- **RULE-06:** `<html lang>` = locale hiện tại của request.
- **RULE-07:** Chuỗi tĩnh user-facing render trong JSX phải lấy từ next-intl (`getTranslations`/`useTranslations`) đọc `messages/<locale>.json`. Bản `en` = nguyên văn chuỗi hiện tại (RULE bất biến giao diện English).
- **RULE-08:** Thiếu key ở locale non-default → fallback về `defaultLocale` (`en`). Không hiển thị message key thô cho user.
- **RULE-09:** Admin (`/admin/*`), API (`/api/*` và `app/(web)/api/*`), `/_next/*`, static assets KHÔNG áp dụng locale routing.
- **RULE-10:** Auth proxy admin hiện có chạy độc lập và có ưu tiên cho `/admin/*`; việc thêm next-intl KHÔNG được đổi hành vi auth admin.
- **RULE-11:** Nội dung động (configs `ui`, product/category/addon, reviews) trong sprint-1 hiển thị nguyên trạng ở mọi locale (chưa dịch) — KHÔNG được vô tình localize hay làm mất nội dung.
- **RULE-12:** Mọi điều hướng client trong web user (Link/router.push) phải sinh URL có prefix locale hiện tại (dùng navigation API locale-aware của next-intl hoặc bọc `webRoutes` để nối prefix). KHÔNG được hardcode `/` mất locale.

## 6. Data Entities & Constraints

**Sprint-1 KHÔNG tạo/đổi entity DB nào** (không schema change — ràng buộc bắt buộc). Các "artifact" dữ liệu ở đây là cấu hình/tài nguyên tĩnh:

- **Locale config** (module code, vd `src/i18n/config.ts`): `locales: string[]`, `defaultLocale: string`. Ràng buộc: `defaultLocale ∈ locales`; giá trị là mã ngôn ngữ chuẩn (`en`, `vi`).
- **Message catalog** (`messages/en.json`, `messages/vi.json`): cây key→string (có thể lồng namespace theo trang/feature). Ràng buộc: `en.json` là nguồn key đầy đủ (superset); mỗi key `vi` nên tồn tại, nếu rỗng thì fallback `en`. Không được để giá trị là chuỗi rỗng gây layout trống nếu không có fallback.
- **Cookie `NEXT_LOCALE`**: giá trị ∈ `locales`. Do next-intl quản lý. Không chứa dữ liệu nhạy cảm.

## 7. Edge Cases Registry

- **EC-01 [RULE-02/03]:** Truy cập root `/` không cookie, không `Accept-Language` khớp → redirect `/en`.
- **EC-02 [RULE-03]:** Cookie `NEXT_LOCALE=vi` nhưng user gõ thẳng `/en/menu/all` → hiển thị `en` (path thắng cookie), KHÔNG redirect về `vi`.
- **EC-03 [RULE-05]:** Locale không hợp lệ `/fr/dish/x` → không crash; redirect về locale phát hiện hoặc 404 (theo cấu hình), có hành vi xác định.
- **EC-04 [RULE-09]:** Fetch client tới `/api/products/ids` khi đang ở `/vi/...` → request vẫn đi tới `/api/...` (không bị chèn `/vi`), API trả bình thường.
- **EC-05 [RULE-10]:** Admin chưa login vào `/admin/orders` → redirect `/admin/login?callback_url=...` (không bị next-intl chèn locale, không lặp redirect).
- **EC-06 [RULE-08]:** Key có ở `en.json`, thiếu ở `vi.json` → render `/vi` hiển thị chuỗi English (fallback), không hiện key thô.
- **EC-07 [RULE-11]:** Trang menu/dish ở `/vi` — tên/mô tả sản phẩm vẫn tiếng Anh (nội dung động) trong khi nhãn tĩnh là tiếng Việt → đây là hành vi ĐÚNG của sprint-1 (không coi là lỗi).
- **EC-08 [RULE-12]:** Bấm link nội bộ (vd "Add to cart" → `/cart`, product card → `/dish/[slug]`) khi đang ở `/vi` → điều hướng tới `/vi/cart`, `/vi/dish/[slug]` (không rớt về không-locale hoặc `en`).
- **EC-09 [RULE-04]:** Đổi locale ở trang dynamic `/vi/dish/pho-bo?ref=abc` → sang `/en/dish/pho-bo?ref=abc` (giữ slug + query).
- **EC-10 [RULE-06]:** Refresh `/vi/...` → `<html lang="vi">` (không nhấp nháy về `en`).
- **EC-11 [RULE-07]:** Chuỗi có nội suy (vd số lượng, tổng tiền, "GMT +7") — dùng ICU/placeholder của next-intl, không nối chuỗi thủ công gây sai ngữ pháp; giữ đúng phần biến động.
- **EC-12 [RULE-01]:** Thêm locale thứ 3 giả định (vd `ko`) chỉ bằng sửa mảng `locales` + thêm `messages/ko.json` → hệ thống không cần sửa routing/middleware (kiểm chứng tính locale-agnostic).

## 8. Integration Touchpoints

- **next-intl ↔ next.config (`src/next.config.ts`):** bọc `createNextIntlPlugin()` quanh config hiện tại; giữ nguyên `images.remotePatterns`/`qualities`. Lỗi cần tránh: mất cấu hình images khi bọc plugin.
- **next-intl ↔ middleware (`src/proxy.ts`):** compose middleware next-intl với auth proxy admin. Thứ tự: nếu path `/admin/*` → chạy auth proxy hiện có; else → next-intl middleware. Cập nhật `matcher` để (a) áp next-intl cho web user, (b) loại trừ `/admin/*` (giữ auth cũ), `/api/*`, `app/(web)/api` paths, `_next`, static. Lỗi cần tránh: vòng redirect, mất auth admin, chèn locale vào `/api`.
- **next-intl ↔ layout (`src/app/(web)/[locale]/layout.tsx`):** cung cấp `NextIntlClientProvider` (nếu cần client components dịch) + `getMessages()`; set `<html lang={locale}>`. Layout vẫn gọi `getUIConfigsByKeyCached("layout")` như cũ (A-05).
- **Language switcher ↔ navigation:** dùng `Link`/`useRouter`/`usePathname` từ `next-intl/navigation` (tạo từ locale config) để đổi locale giữ path.
- **`webRoutes` (`src/constants/route.ts`) ↔ Link web user:** cân nhắc bọc helper để nối prefix locale hoặc thay bằng `Link` locale-aware. Ảnh hưởng mọi chỗ dùng `webRoutes.*` trong web user. Lỗi cần tránh: link mất locale.
- **Không đụng:** services, cached services (A-05), DB, admin API.

## 9. Non-functional Requirements (NFR)

- **NFR-01 (Performance/RSC):** Ưu tiên `getTranslations` phía server (RSC) để không tăng bundle client; chỉ dùng `useTranslations` ở client component thật sự cần. Middleware locale không được thêm độ trễ đáng kể (redirect 1 lần, không lặp).
- **NFR-02 (Không vỡ giao diện English):** Bản `en` sau khi trích chuỗi phải render **giống hệt** hiện tại (pixel/nội dung). Đây là tiêu chí regression cứng.
- **NFR-03 (Accessibility):** `<html lang>` đúng locale (Story-04). Language switcher có nhãn/`aria` truy cập được bằng bàn phím; trạng thái active rõ ràng.
- **NFR-04 (SEO — an toàn tối thiểu):** Không tạo redirect loop; không phát sinh URL trùng lặp không kiểm soát. (hreflang/`alternates.languages` để sprint-4.)
- **NFR-05 (i18n mở rộng):** Kiến trúc locale-agnostic (RULE-01/EC-12) — thêm ngôn ngữ không cần sửa code routing/middleware.
- **NFR-06 (Security):** Không đưa dữ liệu nhạy cảm vào cookie `NEXT_LOCALE`. Không thay đổi luồng auth admin (đã ở RULE-10) — an ninh admin giữ nguyên.
- **NFR-07 (Consistency):** Cookie name chuẩn `NEXT_LOCALE`; mã locale nhất quán giữa config, cookie, `<html lang>`, URL prefix.

## 10. Regression Impact (codebase hiện có)

Khi bọc `[locale]` + thêm middleware, các phần SAU có nguy cơ vỡ — mỗi phần nêu điều "must not break":

- **RI-01 — Auth admin (`src/proxy.ts`):** must not break redirect login admin & 401 cho `/admin/api`. Kiểm: chưa login vào `/admin/dashboard` vẫn redirect login đúng callback; đã login vào `/admin/login` vẫn redirect dashboard.
- **RI-02 — API web user (`app/(web)/api/products/ids`, `.../quick/[id]`):** must not break; URL giữ `/api/...` không prefix locale; client fetch (`webRoutes.productsByIdsApi`, `productQuickApi`) vẫn 200.
- **RI-03 — Route web user hiện có (`/`, `menu/[category]`, `dish/[slug]`, `reservation`, `checkout`, `cart`):** must not break; tất cả phải truy cập được dưới `/en/...` và `/vi/...`; URL cũ (không locale) redirect đúng, không 404.
- **RI-04 — Layout web user (`src/app/(web)/layout.tsx`):** must not break Header/Footer/FloatingActions/Toaster/QuickCartModal, GTM scripts, fonts, `getUIConfigsByKeyCached("layout")`. Sau di chuyển sang `[locale]`, các provider (`WebsiteQueryProvider`, `AnimationHeaderScroll`) vẫn hoạt động.
- **RI-05 — sitemap (`src/app/sitemap.ts`):** must not break; vẫn trả URL hợp lệ (A-02). Nếu URL không locale bị middleware redirect, crawler vẫn tới đúng trang (không 404 loop).
- **RI-06 — 404 (`src/app/not-found.tsx`):** must not break; path không tồn tại vẫn ra 404 (không redirect loop do middleware).
- **RI-07 — Điều hướng client dùng `webRoutes` (`src/constants/route.ts`):** must not break; mọi Link/redirect web user vẫn tới đúng trang, kèm locale (RULE-12). Đặc biệt ProductCard, AddToCart, quick-cart, header menu, footer links.
- **RI-08 — `next.config.ts` images:** must not break `remotePatterns`/`qualities` sau khi bọc next-intl plugin (ảnh R2/asset domains vẫn load).
- **RI-09 — Cache tag `getUIConfigsByKeyCached`:** must not break — sprint-1 KHÔNG đổi cache (A-05); layout config vẫn hiển thị đúng ở mọi locale.
- **RI-10 — Component `dynamic = "force-dynamic"` / rendering mode:** must not break SSR/RSC behavior khi lồng thêm segment `[locale]`.

## 11. Definition of Done

- [ ] `next-intl` cài + cấu hình (config request, plugin `next.config.ts`, provider) chạy được ở RSC.
- [ ] `src/app/(web)/[locale]/` chứa toàn bộ trang web user; `/en/...` & `/vi/...` truy cập được; `en` default (RULE-01/02).
- [ ] Locale config tập trung; chứng minh locale-agnostic (thêm locale = sửa mảng + thêm file) — EC-12.
- [ ] Middleware phát hiện locale theo thứ tự path → cookie → `Accept-Language` → default; redirect đúng; giữ locale khi refresh (Story-03).
- [ ] Auth admin (`proxy.ts`) không đổi hành vi (RI-01) — verify các case EC-05.
- [ ] Language switcher EN/VI ở Header; đổi locale giữ trang + query (Story-01, EC-08/09).
- [ ] `<html lang>` theo locale, bỏ `lang="en"` cứng (Story-04).
- [ ] Toàn bộ chuỗi tĩnh user-facing (Loại C) đã trích ra `messages/en.json`+`messages/vi.json`, thay bằng hàm dịch; `en` nguyên văn; `vi` có bản dịch; fallback `en` khi thiếu (Story-05).
- [ ] API `/api/*` không bị prefix locale, fetch client hoạt động (RI-02, EC-04).
- [ ] Không dịch admin; không đổi schema DB; nội dung động hiển thị nguyên trạng ở mọi locale (RULE-11, EC-07).
- [ ] NFR-01..07 thỏa; đặc biệt NFR-02 (giao diện English không đổi).
- [ ] Regression RI-01..RI-10 kiểm happy-path, không vỡ.
- [ ] Không còn chuỗi user-facing hardcode trong JSX web user (trừ chuỗi kỹ thuật).
- [ ] Open Questions OQ-01..05 đã được user xác nhận hoặc chấp nhận assumption tương ứng.
</content>
</invoke>
