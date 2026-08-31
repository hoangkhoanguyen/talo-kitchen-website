# Tasks — sprint-4-i18n-polish (SPRINT CUỐI v1)

> Sprint hoàn thiện: SEO metadata theo locale + hreflang + sitemap alternates, format tiền/ngày
> theo locale phía web user, fallback sweep + hardcode scan. KHÔNG entity DB mới, KHÔNG UI mới,
> KHÔNG đụng admin. Locale-agnostic (loop `routing.locales`). Giữ nguyên giá trị số/ngày.
>
> **Verify gate toàn sprint:** `tsc --noEmit` + `next build` (eslint repo hỏng sẵn — KHÔNG gate bằng eslint).
> **Ràng buộc chung:** KHÔNG sửa `formatCurrency`/`formatDateVN`/label admin, KHÔNG sửa
> service/cache/routing/middleware sprint-1/2/3 (chỉ tiêu thụ API hiện có). URL en KHÔNG đổi.

---

## Wave 1 — Foundation (song song; các task metadata/format phụ thuộc)

- [x] TASK-01  (done)
  Description: Tạo helper i18n metadata dùng chung `src/lib/i18n-meta.ts` (locale-agnostic, KHÔNG
    `server-only` để test được). Export 4 hàm:
    - `buildLocalizedUrl(locale, path)`: scheme `as-needed` — `locale===routing.defaultLocale` →
      `${APP_URL}${path}`; ngược lại `${APP_URL}/${locale}${path}`. `path` = pathname KHÔNG prefix,
      bắt đầu `/` hoặc `""` (home). URL tuyệt đối dùng APP_URL (`src/constants/app.ts`).
    - `buildAlternates(currentLocale, path)`: trả `{ canonical, languages }`. `languages[loc]` cho
      MỌI `loc` trong `routing.locales` (loop, KHÔNG hardcode 2 mục) + `languages["x-default"] =
      buildLocalizedUrl(routing.defaultLocale, path)`; `canonical = buildLocalizedUrl(currentLocale,
      path)` (self-referencing per-locale). Chỉ dùng pathname chuẩn (không kèm query).
    - `buildSitemapLanguages(path)`: `{ [loc]: buildLocalizedUrl(loc, path) }` loop `routing.locales`
      (KHÔNG x-default — format sitemap).
    - `getOgLocale(locale)`: map literal `{ en:"en_US", vi:"vi_VN" }`; miss → `undefined` (omit,
      không crash).
  Serves: Story-01 (AC-01.3), Story-02 (AC-02.1..4), EC-04, EC-05, EC-06, EC-12
  Design ref: §4 `i18n-meta.ts` API, §6 shape chung, §8 (RULE-02/03/04/06), §9 NFR-03/05
  Expected files: src/lib/i18n-meta.ts (NEW)
  Dependencies: none
  Suggested skill:
  Difficulty: normal
  Test: unit test buildLocalizedUrl (en no-prefix, vi `/vi`), buildAlternates (home `""`→
    en=APP_URL, vi=APP_URL/vi, x-default=APP_URL; canonical=self), getOgLocale (en/vi/miss→undefined).

- [x] TASK-02  (done)
  Description: Thêm namespace `metadata` vào `messages/en.json` + `messages/vi.json` (deep-merge
    fallback sprint-1 giữ nguyên; chỉ THÊM, không sửa namespace khác). Cấu trúc §5: `home`,
    `reservation`, `checkout`, `cart` (mỗi cái `title`+`description`); `menu` (`allLabel`,
    `allMenuTitle`, `titleFallback` với `{category}`, `description` ICU `{category}` — word-order
    safe cho vi); `dish` (`notFound`, `descriptionFallback` với `{title}`). Bản en giữ tương đương
    chuỗi English cũ (checkout `"Checkout | ..."`, dish `"Product Not Found"`, menu `"All"/"All Menu"`).
    Brand `"TALO Kitchen & Lounge"` giữ nguyên trong string cả 2 locale.
  Serves: Story-01 (AC-01.4), Story-03 (AC-03.2), Story-08 (AC-08.2), EC-01, EC-02, EC-03, EC-10
  Design ref: §5 Data Model (cấu trúc metadata namespace), §8 (RULE-05/13), OQ-04/ASM-05
  Expected files: messages/en.json, messages/vi.json
  Dependencies: none
  Suggested skill:
  Test: JSON hợp lệ (parse), `metadata` namespace tồn tại đủ key ở cả 2 file, ICU `{category}`/
    `{title}` đúng cú pháp; build không raw-key.

- [x] TASK-03  (done)
  Description: Tạo helper format ngày/giờ web user `src/lib/date-web.ts` (Intl, NEW; KHÔNG import/
    sửa `lib/date.ts formatDateVN`). Hai hàm:
    - `formatReservationDate(date, locale)`: parse `YYYY-MM-DD` → vi `31/08/2026`, en `08/31/2026`.
    - `formatReservationTime(time, locale)`: parse `HH:mm:ss` → vi 24h `19:30`, en 12h `7:30 PM`.
    null/sai format → `""` (không throw). **TIMEZONE-SAFE (bắt buộc, reviewer SHOULD):** wall-clock,
    KHÔNG áp offset +7 / tz-shift. Pin cơ chế: build `Date` từ các thành phần UTC
    (`Date.UTC(y,m-1,d)` / `Date.UTC(1970,0,1,h,mi,0)`) rồi format với `Intl.DateTimeFormat` truyền
    `timeZone:"UTC"` — đảm bảo ngày/giờ hiển thị = giá trị nguồn, không lệch ngày dù server TZ nào.
    Dùng map BCP47 nhỏ locale-agnostic (en→`en-US` để chắc `MM/DD`+12h, vi→`vi-VN`) để pin output ASM-03.
  Serves: Story-06 (AC-06.1, AC-06.2, AC-06.3), EC-08, EC-09
  Design ref: §4 `date-web.ts` API, §8 (RULE-08/09), §9 NFR-04, reviewer note (timezone-safe)
  Expected files: src/lib/date-web.ts (NEW)
  Dependencies: none
  Suggested skill:
  Test: unit — date vi/en đúng chuỗi; time `"19:30:00"` → vi `19:30`, en `7:30 PM`; null/`""`/sai →
    `""`; kiểm không lệch ngày (so nguồn vs output, ví dụ `"2026-08-31"` KHÔNG ra 30/08 hay 01/09).

- [x] TASK-04  (done)
  Description: Sửa `formatCurrencyWebsite` trong `src/lib/utils.ts`: THÊM param `locale?: Locale`
    (optional). `undefined` → default `"vi-VN"` (backward-compat cho callsite chưa update). Output:
    `${amount.toLocaleString(intlOf(locale))} VND` — giữ hậu tố text "VND" (ASM-02). Pin: en
    `1,000,000 VND`, vi `1.000.000 VND`. Dùng map nhỏ locale→BCP47 (en→`en-US`, vi→`vi-VN`).
    **KHÔNG đụng `formatCurrency` (admin, vi-VN).**
  Serves: Story-05 (AC-05.1, AC-05.2, AC-05.3), EC-07
  Design ref: §6 Format helpers, §8 (RULE-07/10/15), §10 regression, OQ-01a/ASM-02
  Expected files: src/lib/utils.ts
  Dependencies: none
  Suggested skill:
  Test: unit — `formatCurrencyWebsite(1000000,"en")`==="1,000,000 VND", `(...,"vi")`==="1.000.000 VND",
    `(1000000)`==="1.000.000 VND" (default), `(0,...)`==="0 VND", âm không crash; giá trị số không đổi.

---

## Wave 2 — Metadata trang + sitemap + callsite (song song; phụ thuộc Wave 1)

- [x] TASK-05  (done)
  Description: Refactor `generateMetadata` trang home `page.tsx`: dùng `resolveLocale(rawLocale)`
    (ở CẢ generateMetadata LẪN page component — reviewer note), truyền locale vào cached service
    (`homepage.seo.*`), thay canonical đơn → `buildAlternates(locale, "")`, thay og:locale hardcode
    → `getOgLocale(locale)`, `openGraph.url = canonical` (absolute qua APP_URL). Fallback khi seo
    trống → `getTranslations({locale, namespace:"metadata"})` → `metadata.home.title/description`.
    Xác nhận og:image relative resolve qua `metadataBase` (đã set ở `[locale]/layout.tsx`);
    alternates/openGraph.url absolute. Bản en title/description KHÔNG đổi.
  Serves: Story-01 (AC-01.1..4), Story-02 (AC-02.1..4), EC-02, EC-04
  Design ref: §6 bảng trang home, §8 (RULE-01/02/05/06), §10, reviewer note (home resolveLocale + og:image)
  Expected files: src/app/(web)/[locale]/page.tsx
  Dependencies: TASK-01, TASK-02
  Suggested skill:
  Test: metadata home: alternates.languages đủ en/vi/x-default, canonical=self, og:locale theo locale,
    seo trống → fallback ns không rỗng. Verify `tsc --noEmit`.

- [x] TASK-06  (done)
  Description: Refactor `generateMetadata` `menu/[category]/page.tsx`: đổi `locale as Locale` →
    `resolveLocale(rawLocale)` (EC-11), truyền locale vào cached service (`menu_page.seo.*` + category
    label/page_title), `buildAlternates(locale, "/menu/"+category)` + `getOgLocale`. i18n hoá fallback:
    dùng `metadata.menu.allLabel`/`allMenuTitle` cho key "all" (giữ slug "all" cho URL), `titleFallback`
    khi thiếu seo.title, `description` ICU `{category}` (category=label localized, word-order safe).
    openGraph.url=canonical absolute. Bản en KHÔNG đổi.
  Serves: Story-01 (AC-01.1..4), Story-02 (AC-02.1..4), Story-08 (AC-08.2), EC-02, EC-05, EC-10, EC-11
  Design ref: §6 bảng menu, §8 (RULE-01/05/13), §4 (ICU MessageFormat)
  Expected files: src/app/(web)/[locale]/menu/[category]/page.tsx
  Dependencies: TASK-01, TASK-02
  Suggested skill:
  Test: `/menu/all` en → path `/menu/all`, vi → `/vi/menu/all`; label "All" qua ns không hardcode;
    description ICU render đúng cả 2 locale; seo trống → fallback. Verify `tsc --noEmit`.

- [x] TASK-07  (done)
  Description: Refactor `generateMetadata` `dish/[slug]/page.tsx`: giữ `resolveLocale` hiện có, thay
    canonical đơn → `buildAlternates(locale, "/dish/"+slug)`, og:locale hardcode `"en_US"` →
    `getOgLocale(locale)`. i18n fallback: product null → `title: t("dish.notFound")` (EC-01, thay
    "Product Not Found" cứng); description thiếu → `t("dish.descriptionFallback", {title})`.
    openGraph.url=canonical; og:image relative resolve qua metadataBase (giữ images shape). Bản en
    title (product.title) KHÔNG đổi.
  Serves: Story-01 (AC-01.1..4), Story-02 (AC-02.1..4), EC-01, EC-03
  Design ref: §6 bảng dish, §8 (RULE-01/02/05/06), §10
  Expected files: src/app/(web)/[locale]/dish/[slug]/page.tsx
  Dependencies: TASK-01, TASK-02
  Suggested skill:
  Test: `/vi/dish/x` → nội dung vi; product null → title từ ns (i18n) không crash; alternates 2 chiều
    khớp; og:locale theo locale. Verify `tsc --noEmit`.

- [x] TASK-08  (done)
  Description: Refactor `generateMetadata` `reservation/page.tsx`: đổi `locale as Locale` →
    `resolveLocale(rawLocale)` (EC-11), truyền locale vào cached service (`reservation_page.seo.*`),
    `buildAlternates(locale, "/reservation")` + `getOgLocale`, openGraph.url=canonical. Fallback seo
    trống → `metadata.reservation.title/description`. Bản en KHÔNG đổi.
  Serves: Story-01 (AC-01.1..4), Story-02 (AC-02.1..4), EC-02, EC-11
  Design ref: §6 bảng reservation, §8 (RULE-01/02/05/06)
  Expected files: src/app/(web)/[locale]/reservation/page.tsx
  Dependencies: TASK-01, TASK-02
  Suggested skill:
  Test: metadata reservation locale-đúng, alternates/canonical/og:locale đúng, fallback ns. `tsc --noEmit`.

- [x] TASK-09  (done)
  Description: Chuyển `checkout/page.tsx` và `cart/page.tsx` từ static `export const metadata`
    (English cứng) → `async generateMetadata({params})` nhận `locale`. Thêm `params: Promise<{locale}>`
    vào cả generateMetadata (và page component nếu cần lấy locale). Dùng `resolveLocale` +
    `getTranslations({locale, namespace:"metadata"})` → `metadata.checkout.*` / `metadata.cart.*`,
    `buildAlternates(locale, "/checkout")` / `("/cart")` + `getOgLocale`, openGraph.url=canonical.
    Bản en title/description tương đương chuỗi static cũ. KHÔNG làm vỡ render (2 trang client-heavy
    provider).
  Serves: Story-03 (AC-03.1, AC-03.2), Story-02 (AC-02.1..4), EC-02
  Design ref: §6 bảng checkout/cart, §10 (static→dynamic), OQ-04/ASM-05
  Expected files: src/app/(web)/[locale]/checkout/page.tsx, src/app/(web)/[locale]/cart/page.tsx
  Dependencies: TASK-01, TASK-02
  Suggested skill:
  Test: `/checkout` & `/cart` build có generateMetadata; vi → title/desc tiếng Việt; alternates/
    og:locale đúng; trang vẫn render. Verify `tsc --noEmit` + `next build`.

- [x] TASK-10  (done)
  Description: Sửa `src/app/sitemap.ts`: THÊM `alternates: { languages: buildSitemapLanguages(path) }`
    vào MỖI entry (path=pathname không prefix: `""`, `/menu/${key}`, `/reservation`, `/dish/${slug}`).
    GIỮ NGUYÊN: `force-dynamic`, tập URL gốc (bản defaultLocale, không prefix), đọc `menu_page` theo
    `defaultLocale`, filter null (`?.`). KHÔNG đổi số lượng/đường dẫn URL.
  Serves: Story-04 (AC-04.1, AC-04.2, AC-04.3), EC-10
  Design ref: §6 sitemap.ts, §8 (RULE-04/12), §9 NFR-02
  Expected files: src/app/sitemap.ts
  Dependencies: TASK-01
  Suggested skill:
  Test: mỗi entry có alternates.languages en (no-prefix) + vi (`/vi`); tập URL gốc không đổi; DB null
    không crash. Verify `tsc --noEmit`.

- [x] TASK-11  (done)
  Description: Cập nhật 9 callsite CLIENT của `formatCurrencyWebsite` truyền `locale` từ `useLocale()`
    (next-intl client): `AddToCartButton`, `CheckoutForm`, `CheckoutSummary`, `CheckoutRender`,
    `CartItem`, `CartSubmit`, `CartSummary`, `QuantityEditor`, `AddonsEditor`. Giá tiền hiển thị đúng
    số ở mọi callsite (chỉ đổi grouping theo locale).
  Serves: Story-05 (AC-05.4)
  Design ref: §10 (14 callsite, client → useLocale), §8 (RULE-10)
  Expected files: src/components/web/features/products/AddToCartButton.tsx,
    src/components/web/features/checkout/CheckoutForm.tsx,
    src/components/web/features/checkout/CheckoutSummary.tsx,
    src/components/web/features/checkout/CheckoutRender.tsx,
    src/components/web/features/cart/CartItem.tsx, src/components/web/features/cart/CartSubmit.tsx,
    src/components/web/features/cart/CartSummary.tsx, src/components/web/shared/QuantityEditor.tsx,
    src/components/web/shared/AddonsEditor.tsx
  Dependencies: TASK-04
  Suggested skill:
  Test: build; render các trang cart/checkout không lỗi; số tiền đúng. Verify `tsc --noEmit`.

- [x] TASK-12  (done)
  Description: Cập nhật 5 callsite SERVER (không `"use client"`) của `formatCurrencyWebsite` truyền
    `locale`: `ProductInformation`, `ProductCard`, `OrderItem` (checkout), `CartItemTotalPrice`,
    `QuickCartForm` — lấy locale qua prop (từ parent đã có locale) HOẶC `getLocale()` (next-intl/server).
    Chọn cách nhất quán với cấu trúc component hiện tại (ưu tiên prop nếu parent đã truyền locale,
    fallback `getLocale()`). Giá tiền đúng số.
  Serves: Story-05 (AC-05.4)
  Design ref: §10 (server → prop|getLocale), §8 (RULE-10)
  Expected files: src/components/web/features/products/ProductInformation.tsx,
    src/components/web/shared/ProductCard.tsx, src/components/web/features/checkout/OrderItem.tsx,
    src/components/web/features/cart/CartItemTotalPrice.tsx,
    src/components/web/shared/quick-cart/QuickCartForm.tsx
  Dependencies: TASK-04
  Suggested skill:
  Test: build; các component render đúng số tiền theo locale. Verify `tsc --noEmit`.

- [x] TASK-13  (done)
  Description: Sửa `ReservationSubmitSuccess.tsx`: bỏ `import moment`, thay 2 chỗ format
    `arrivalDate`/`arrivalTime` bằng `formatReservationDate`/`formatReservationTime` từ `date-web.ts`,
    lấy locale qua `useLocale()`. Giữ nguyên hiển thị mã/khách/ghi chú/layout; chỉ đổi CÁCH format,
    KHÔNG đổi giá trị. null/sai → `""` an toàn (EC-08).
  Serves: Story-06 (AC-06.1, AC-06.2, AC-06.3), EC-08, EC-09
  Design ref: §10 (ReservationSubmitSuccess), §2 (bỏ moment ở web user)
  Expected files: src/components/web/features/reservation/ReservationSubmitSuccess.tsx
  Dependencies: TASK-03
  Suggested skill:
  Test: vi ngày `DD/MM/YYYY`+24h, en `MM/DD/YYYY`+12h; wall-clock không lệch; null không crash.
    Verify `tsc --noEmit`.

---

## Wave 3 — Fallback sweep + hardcode scan + verify gate (CUỐI; phụ thuộc mọi task trên)

- [ ] TASK-14  (todo)
  Description: Task VERIFY tổng (không code lớn, chỉ vá chỗ sót nếu phát hiện). Chạy grep pattern §11:
    - `rg -n ">[A-Za-z ]{3,}<" src/components/web` và literal JSX English chưa qua `t()` →
      xử lý theo RULE-13 (i18n hoá; brand/danh từ riêng được giữ).
    - `rg -n "toLocaleString\(|moment\(|\"en-US\"|\"vi-VN\"|en_US" src/components/web "src/app/(web)"`
      → xác nhận không còn format tiền/ngày cứng hay og:locale hardcode sót phía user (trừ map trong
      helper i18n-meta/date-web/utils).
    - Rà fallback: config ui field localized (sprint-2 resolve — không rỗng), entity translation
      (sprint-3 COALESCE — không rỗng), message key thiếu vi (deep-merge en — không raw key); layout
      KHÔNG vỡ khi fallback dài (Story-07).
    - Xác nhận `<html lang>` = locale ở `[locale]/layout.tsx` (NFR-06, chỉ confirm không sửa).
    - Verify gate toàn sprint: `tsc --noEmit` + `next build` sạch.
  Serves: Story-07 (AC-07.1..4), Story-08 (AC-08.1, AC-08.2), Story-09 (AC-09.1..4), NFR-06, NFR-07
  Design ref: §11 VERIFY-ONLY (grep pattern), §9 NFR-06/07, requirements §11 DoD
  Expected files: (chủ yếu verify; nếu sót → file web tương ứng)
  Dependencies: TASK-05, TASK-06, TASK-07, TASK-08, TASK-09, TASK-10, TASK-11, TASK-12, TASK-13
  Suggested skill:
  Test: grep sạch (không literal English user-facing ngoài brand); build pass; đổi locale không lỗi
    runtime; `<html lang>` khớp.

---

## AC / EC / NFR / RULE → Task coverage

| ID | Task(s) |
|---|---|
| AC-01.1 | TASK-05, TASK-06, TASK-07 |
| AC-01.2 | TASK-05, TASK-06, TASK-07 |
| AC-01.3 | TASK-01, TASK-05..09 |
| AC-01.4 | TASK-02, TASK-05..08 |
| AC-02.1 | TASK-01, TASK-05..09 |
| AC-02.2 | TASK-01, TASK-05..09 |
| AC-02.3 | TASK-01, TASK-05..09, TASK-10 |
| AC-02.4 | TASK-01, TASK-05..09 |
| AC-03.1 | TASK-09 |
| AC-03.2 | TASK-02, TASK-09 |
| AC-04.1 | TASK-10 |
| AC-04.2 | TASK-10 |
| AC-04.3 | TASK-10 |
| AC-05.1 | TASK-04 |
| AC-05.2 | TASK-04 |
| AC-05.3 | TASK-04 |
| AC-05.4 | TASK-11, TASK-12 |
| AC-06.1 | TASK-03, TASK-13 |
| AC-06.2 | TASK-03, TASK-13 |
| AC-06.3 | TASK-03, TASK-13 |
| AC-07.1 | TASK-14 |
| AC-07.2 | TASK-14 |
| AC-07.3 | TASK-02, TASK-14 |
| AC-07.4 | TASK-14 |
| AC-08.1 | TASK-14 |
| AC-08.2 | TASK-02, TASK-06, TASK-14 |
| AC-09.1 | TASK-14 |
| AC-09.2 | TASK-14 |
| AC-09.3 | TASK-14 |
| AC-09.4 | TASK-14 |
| EC-01 | TASK-02, TASK-07 |
| EC-02 | TASK-02, TASK-05, TASK-06, TASK-08, TASK-09 |
| EC-03 | TASK-02, TASK-07 |
| EC-04 | TASK-01, TASK-05 |
| EC-05 | TASK-01, TASK-06 |
| EC-06 | TASK-01 |
| EC-07 | TASK-04 |
| EC-08 | TASK-03, TASK-13 |
| EC-09 | TASK-03, TASK-13 |
| EC-10 | TASK-02, TASK-06, TASK-10 |
| EC-11 | TASK-06, TASK-08 |
| EC-12 | TASK-01 |
| NFR-01 | TASK-05..09 (tái dùng cached service, 0 round-trip mới) |
| NFR-02 | TASK-10 |
| NFR-03 | TASK-01, TASK-05..09 |
| NFR-04 | TASK-03, TASK-04, TASK-13 |
| NFR-05 | TASK-01, TASK-03, TASK-04 (loop routing.locales, map nhỏ) |
| NFR-06 | TASK-14 |
| NFR-07 | TASK-05..09, TASK-14 |
| RULE-01 | TASK-05..09 |
| RULE-02 | TASK-01, TASK-05..09 |
| RULE-03 | TASK-01 |
| RULE-04 | TASK-01, TASK-10 |
| RULE-05 | TASK-02, TASK-05..09 |
| RULE-06 | TASK-01, TASK-05..09 |
| RULE-07 | TASK-04 |
| RULE-08 | TASK-03 |
| RULE-09 | TASK-03, TASK-13 |
| RULE-10 | TASK-11, TASK-12, TASK-13 |
| RULE-11 | TASK-02, TASK-14 |
| RULE-12 | TASK-10 |
| RULE-13 | TASK-02, TASK-06, TASK-14 |
| RULE-14 | (ràng buộc toàn sprint — không sửa service/cache/routing/middleware) |
| RULE-15 | (ràng buộc toàn sprint — không đụng formatCurrency/formatDateVN/label admin; TASK-04 chỉ sửa formatCurrencyWebsite) |

## Waves (execute chạy song song trong cùng wave)
- Wave 1: TASK-01, TASK-02, TASK-03, TASK-04
- Wave 2: TASK-05, TASK-06, TASK-07, TASK-08, TASK-09, TASK-10, TASK-11, TASK-12, TASK-13
- Wave 3: TASK-14

## Ghi chú vận hành
- Verify build bằng `tsc --noEmit` + `next build` (eslint repo hỏng sẵn — KHÔNG dùng để gate).
- `architecture.md` §"SEO / i18n metadata + format (sprint-4)" ĐÃ có sẵn — không cần task doc riêng.
- TASK-04 dùng default `vi-VN` khi thiếu locale → 3 callsite ADMIN dùng chung `utils.ts` KHÔNG bị
  ảnh hưởng (chúng gọi `formatCurrency`, không phải `formatCurrencyWebsite`).
- Không task nào `Difficulty: high`: TASK-11/12 tuy nhiều file nhưng mechanical + backward-compat
  default (rủi ro regression thấp), không thuộc nhóm high (thuật toán/đồng thời/transaction/crypto).
