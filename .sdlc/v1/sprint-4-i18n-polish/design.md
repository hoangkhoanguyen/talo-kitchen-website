# Design — sprint-4-i18n-polish

> Sprint CUỐI v1. KHÔNG entity DB mới, KHÔNG UI mới (design_ui = n/a). Chỉ SEO metadata theo
> locale + hreflang + sitemap alternates, format tiền/ngày theo locale phía web user, fallback
> sweep + hardcode scan. Locale-agnostic, không đụng admin, giữ nguyên giá trị số/ngày.

---

# PART 1 — HUMAN REVIEW

## 1. Design Overview

- **1 helper i18n metadata dùng chung (`src/lib/i18n-meta.ts`)** — tập trung toàn bộ logic
  build URL `as-needed`, `alternates.languages` (en/vi/x-default), canonical self-referencing,
  và map `og:locale`. Mọi trang gọi helper thay vì tự lắp chuỗi → locale-agnostic, một chỗ sửa
  khi thêm locale thứ 3. (Giải quyết RULE-02/03/04/06, NFR-05.)
- **generateMetadata đồng nhất 6 trang** — 4 trang hiện có được refactor để dùng helper +
  `resolveLocale`; cart/checkout chuyển từ `export const metadata` static → `async
  generateMetadata`. Nội dung localized đã có sẵn từ service sprint-2/3, sprint-4 chỉ truyền
  đúng `locale` và tiêu thụ (NFR-01: không thêm DB round-trip).
- **Fallback metadata i18n hoá qua namespace `metadata`** trong `messages/*.json` — thay các
  chuỗi English cứng ("Product Not Found", "All Menu", "Checkout | …", "Explore our delicious
  {category} menu"). Fallback description menu dùng **ICU message có tham số** (word-order safe
  cho vi). Brand name giữ nguyên mọi locale.
- **Format tiền/ngày locale-aware, tách biệt admin** — chỉ đổi `formatCurrencyWebsite`
  (`src/lib/utils.ts`), thêm param `locale`; `formatCurrency` (admin, vi-VN) và
  `lib/date.ts formatDateVN` (admin) KHÔNG đụng. Ngày/giờ reservation format bằng
  `Intl.DateTimeFormat` trong helper mới `src/lib/date-web.ts`, wall-clock, không tz-shift.
- **Sitemap chỉ THÊM `alternates.languages`** — tập URL gốc, `force-dynamic`, đọc theo
  `defaultLocale` giữ nguyên (RULE-12, NFR-02).

## 2. Tech Decisions

- **Intl thay moment ở web user** — dùng `Intl.NumberFormat` / `Intl.DateTimeFormat` built-in
  (không thêm dependency). `moment` vẫn còn ở admin (`lib/date.ts`) — không gỡ. Trong
  `ReservationSubmitSuccess.tsx` bỏ import `moment`, thay bằng helper `date-web.ts`.
- **ICU MessageFormat cho fallback có tham số** — `metadata.menu.description` nhận `{category}`
  để tránh ghép chuỗi thủ công sai trật tự từ trong tiếng Việt (next-intl hỗ trợ sẵn).
- **`formatCurrencyWebsite(amount, locale?)`** — thêm param optional; default giữ grouping
  `vi-VN` (backward-compatible cho bất kỳ callsite chưa truyền). Pin output: en `1,000,000 VND`,
  vi `1.000.000 VND` (giữ hậu tố text "VND" — ASM-02/OQ-01a).
- **Helper metadata đặt ở `src/lib/i18n-meta.ts`** (cạnh `src/lib/locale.ts`), không server-only
  để test được. Map `og:locale` là 1 object literal locale-agnostic có fallback an toàn.

## 3. Risks / Trade-offs

- **Canonical đổi sang self-referencing per-locale (ASM-04/OQ-03)** — thay đổi hành vi SEO hiện
  tại (canonical cũ luôn trỏ bản en). Đây là chuẩn khuyến nghị nhưng nếu chủ muốn gộp tín hiệu
  về 1 URL en thì cần override. URL bản en KHÔNG đổi → không hại SEO en hiện có.
- **Backward-compat `formatCurrencyWebsite`** — nếu bỏ sót callsite không truyền locale, nó vẫn
  chạy (default vi-VN) nhưng bản en sẽ hiển thị grouping vi. Cần rà đủ 14 callsite web.
- **Regression rủi ro cao nhất ở `utils.ts`** — file dùng chung web + admin. Bắt buộc chỉ sửa
  `formatCurrencyWebsite`, không chạm `formatCurrency`. Đã xác nhận admin chỉ gọi `formatCurrency`.
- **Fallback sweep là task kiểm tra thủ công** — không code lớn; rủi ro bỏ sót chuỗi hardcode,
  giảm thiểu bằng grep pattern liệt kê ở §8/§9.

---

# PART 2 — AGENT REFERENCE

## 4. Architecture

Không có tầng/kiến trúc mới. Thêm 2 module lib thuần + refactor tầng metadata trang.

```
routing.ts (locales, defaultLocale)  ─┐
lib/locale.ts (resolveLocale)         ├──> lib/i18n-meta.ts  (NEW)
constants/app.ts (APP_URL)            ─┘        │ buildLocalizedUrl / buildAlternates
                                               │ buildSitemapLanguages / getOgLocale
                                               ▼
        ┌──────────────────────────────────────────────────────────┐
        │ generateMetadata (6 trang [locale])   sitemap.ts          │
        │  - resolveLocale(rawLocale)                                │
        │  - getUIConfigsByKeyCached/getProductDetailsBySlugCached   │  (sprint-2/3, chỉ đọc)
        │  - getTranslations({locale, namespace:"metadata"}) fallback│
        │  - buildAlternates(locale, path) + getOgLocale(locale)     │
        └──────────────────────────────────────────────────────────┘

lib/utils.ts formatCurrencyWebsite(amount, locale)   ──> 14 web callsites (client: useLocale / server: prop|getLocale)
lib/date-web.ts (NEW) formatReservationDate/Time(v, locale) ──> ReservationSubmitSuccess.tsx (useLocale)
messages/en.json + vi.json : + namespace "metadata"  ──> fallback metadata + labels
```

### `src/lib/i18n-meta.ts` (NEW) — API

- `buildLocalizedUrl(locale: Locale, path: string): string`
  - path = pathname KHÔNG prefix locale, bắt đầu bằng `/` hoặc `""` (home).
  - `locale === routing.defaultLocale` → `${APP_URL}${path}` (không prefix).
  - ngược lại → `${APP_URL}/${locale}${path}`.
- `buildAlternates(currentLocale: Locale, path: string): { canonical: string; languages: Record<string,string> }`
  - `languages[loc] = buildLocalizedUrl(loc, path)` cho MỌI `loc` trong `routing.locales` (loop, RULE-03).
  - `languages["x-default"] = buildLocalizedUrl(routing.defaultLocale, path)` (RULE-04).
  - `canonical = buildLocalizedUrl(currentLocale, path)` (self-referencing, RULE-06).
- `buildSitemapLanguages(path: string): Record<string,string>`
  - `{ [loc]: buildLocalizedUrl(loc, path) }` loop `routing.locales` (en/vi, KHÔNG x-default — format sitemap).
- `getOgLocale(locale: Locale): string | undefined`
  - map literal `{ en: "en_US", vi: "vi_VN" }`; miss → `undefined` (omit, không crash — EC-06/RULE-02).
- (optional) `getAlternateOgLocales(locale)` → các og:locale còn lại (ASM-07, không bắt buộc).

Path lấy từ đường dẫn không-locale hiện có: home `""`, menu/[category] `/menu/${category}`,
dish/[slug] `/dish/${slug}`, reservation `/reservation`, cart `/cart`, checkout `/checkout`.

### `src/lib/date-web.ts` (NEW) — API (web user only)

- `formatReservationDate(date: string | null | undefined, locale: Locale): string`
  - parse `YYYY-MM-DD` wall-clock → `Intl.DateTimeFormat(locale, {day,month,year:"2-digit/numeric"})`
    → vi `31/08/2026`, en `08/31/2026`. null/sai format → `""` (EC-08).
- `formatReservationTime(time: string | null | undefined, locale: Locale): string`
  - parse `HH:mm:ss` wall-clock → vi 24h `HH:mm` (`19:30`), en 12h `h:mm A` (`7:30 PM`) (OQ-02).
  - KHÔNG áp offset +7 / tz-shift (RULE-09/EC-09). null/sai → `""` (EC-08).
- Locale→Intl BCP47: dùng chính `locale` ("en"/"vi") — hợp lệ cho Intl; hoặc map nhỏ nếu cần
  ép định dạng (en → `en-US` để chắc 12h/`MM/DD`, vi → `vi-VN`). Chọn map nhỏ locale-agnostic để
  pin output đúng ASM-03.

## 5. Data Model

**KHÔNG có thay đổi schema/entity/migration.** Chỉ tiêu thụ dữ liệu đã localized:
- UI Config `seo.*` — resolve theo locale bởi `getUIConfigsByKeyCached(key, locale)` (sprint-2).
- Product `title/description/...` — `getProductDetailsBySlugCached(slug, locale)` (sprint-3).
- Reservation `arrivalDate/arrivalTime` (wall-clock) — chỉ format hiển thị.

Thay đổi duy nhất ở "data": thêm namespace `metadata` vào `messages/en.json` + `messages/vi.json`
(deep-merge fallback sprint-1 giữ nguyên). Cấu trúc đề xuất:

```jsonc
"metadata": {
  "home":        { "title": "...", "description": "..." },
  "reservation": { "title": "...", "description": "..." },
  "checkout":    { "title": "...", "description": "..." },
  "cart":        { "title": "...", "description": "..." },
  "menu": {
    "allLabel": "All",                    // label hiển thị cho category "all"
    "allMenuTitle": "All Menu",           // page_title fallback
    "titleFallback": "Menu - {category}", // khi thiếu seo.title
    "description": "Explore our delicious {category} menu at ..." // ICU param, word-order safe
  },
  "dish": {
    "notFound": "Product Not Found",
    "descriptionFallback": "Discover {title} at ..."
  }
}
```
Brand `"TALO Kitchen & Lounge"` là danh từ riêng → append trong code hoặc giữ trong string cả 2
locale (thống nhất 1 cách; đề xuất giữ trong string để dịch giả kiểm soát).

## 6. API Contracts

Không có REST endpoint mới. "Contract" ở đây = shape `Metadata` / `MetadataRoute.Sitemap` mỗi
trang xuất ra.

### 6 trang generateMetadata — shape chung
- **Input:** `params: Promise<{ locale: string; ...slug|category }>`. `locale = resolveLocale(rawLocale)` (RULE-01, EC-11).
- **Output `Metadata`:**
  - `title`, `description`, `keywords` (giữ như hiện có).
  - `alternates`: `{ canonical, languages }` từ `buildAlternates(locale, path)` (RULE-03/04/06, EC-04/05/12).
  - `icons: APP_ICONS` (giữ).
  - `openGraph`: `{ title, description, url: canonical, siteName, images, type:"website", locale: getOgLocale(locale) }` (RULE-02, AC-01.3).
- **Fallback (khi service null/thiếu):** dùng `getTranslations({locale, namespace:"metadata"})`
  → không rỗng, không raw key (RULE-05, NFR-07). Không throw.

Chi tiết theo trang:

| Trang | path | Nội dung chính | Fallback (namespace metadata) |
|---|---|---|---|
| home `page.tsx` | `""` | `homepage.seo.*` | `metadata.home.title/description` |
| menu/[category] | `/menu/${category}` | `menu_page.seo.*` + category label/page_title | `menu.titleFallback`/`menu.description` (ICU `{category}`=label localized), `menu.allMenuTitle`/`menu.allLabel` cho key "all" |
| dish/[slug] | `/dish/${slug}` | product `title/description` + image | product null → `title: metadata.dish.notFound` (EC-01), desc thiếu → `dish.descriptionFallback {title}` |
| reservation | `/reservation` | `reservation_page.seo.*` | `metadata.reservation.*` |
| checkout | `/checkout` | (chỉ static) | `metadata.checkout.*` (AC-03) |
| cart | `/cart` | (chỉ static) | `metadata.cart.*` (AC-03) |

### sitemap.ts
- Mỗi entry giữ nguyên `url` (bản defaultLocale, không prefix) + `lastModified/changeFrequency/priority`.
- THÊM `alternates: { languages: buildSitemapLanguages(path) }` với `path` = pathname không
  prefix của entry (`""`, `/menu/${key}`, `/reservation`, `/dish/${slug}`).
- Tập URL gốc + `force-dynamic` + đọc `menu_page` theo `defaultLocale` KHÔNG đổi (RULE-12,
  AC-04.3, NFR-02). DB null → như hiện tại (filter `?.`), không crash.

### Format helpers (không phải endpoint)
- `formatCurrencyWebsite(amount: number, locale?: Locale): string` → `${amount.toLocaleString(intlOf(locale))} VND`. locale undefined → `vi-VN` (backward-compat). EC-07: amount 0 → "0 VND"; âm → không crash.
- `formatReservationDate/Time(value, locale)` — §4.

## 7. UI / Interaction Flow

design_ui = n/a. Không màn hình mới, không thay đổi luồng tương tác. Chỉ đổi chuỗi hiển thị
(số tiền, ngày/giờ) và metadata (không thấy trên UI). Trạng thái empty/error của
`ReservationSubmitSuccess`: giá trị date/time null → chuỗi rỗng an toàn (EC-08), giữ layout.

## 8. Rule & Edge-case Mapping

| ID | Xử lý ở đâu |
|---|---|
| RULE-01 | Mọi generateMetadata `resolveLocale(rawLocale)` rồi truyền vào cached service |
| RULE-02 | `getOgLocale(locale)` map literal, không hardcode "en_US" |
| RULE-03 | `buildAlternates` loop `routing.locales` + x-default |
| RULE-04 | `buildLocalizedUrl` scheme as-needed (default không prefix, khác có prefix) |
| RULE-05 | Service fallback en (sprint-2/3) → nếu vẫn trống dùng `metadata` namespace |
| RULE-06 | `buildAlternates.canonical = buildLocalizedUrl(currentLocale, path)` |
| RULE-07 | `formatCurrencyWebsite` `toLocaleString(intlOf(locale))` + "VND" |
| RULE-08 | `date-web.ts` `Intl.DateTimeFormat(locale)` |
| RULE-09 | date-web parse wall-clock, KHÔNG áp offset |
| RULE-10 | Helper nhận `locale` tường minh; client dùng `useLocale()`, server prop/`getLocale()` |
| RULE-11 | Chuỗi tĩnh qua next-intl; brand giữ nguyên |
| RULE-12 | sitemap chỉ thêm `alternates`, giữ tập URL |
| RULE-13 | "All"/"All Menu"/fallback metadata → namespace `metadata`; key kỹ thuật "all" giữ |
| RULE-14 | Không sửa service/cache/routing/middleware; chỉ gọi API hiện có |
| RULE-15 | `formatCurrency` + `formatDateVN` + label admin KHÔNG đụng |
| EC-01 | dish/[slug]: product null → `metadata.dish.notFound` |
| EC-02 | seo trống → fallback namespace `metadata` + brand |
| EC-03 | seo có en thiếu vi → service resolve fallback en (sprint-2) |
| EC-04 | home path `""` → en=APP_URL, vi=APP_URL/vi, x-default=APP_URL (buildAlternates) |
| EC-05 | menu key "all" → path `/menu/all`, vi `/vi/menu/all` (buildLocalizedUrl) |
| EC-06 | `getOgLocale` miss → undefined (omit), không crash |
| EC-07 | amount 0/âm → toLocaleString không crash |
| EC-08 | date/time null/sai → `""` placeholder, không throw |
| EC-09 | arrivalTime "19:30:00" en → "7:30 PM", không cộng offset |
| EC-10 | sitemap label "All" hardcode chỉ nội bộ (dùng key cho URL); không lọt user-facing |
| EC-11 | menu/[category] + reservation: đổi `locale as Locale` → `resolveLocale(rawLocale)` |
| EC-12 | `buildAlternates` chỉ dùng pathname chuẩn, không kèm query |

## 9. NFR Design

- **NFR-01/02 (Perf):** generateMetadata dùng lại cùng `getUIConfigsByKeyCached`/
  `getProductDetailsBySlugCached` mà page component gọi (cùng cache key per-locale) → 0 DB
  round-trip mới. sitemap build alternates từ dữ liệu đã fetch, không query thêm.
- **NFR-03 (SEO):** `buildAlternates` đảm bảo hreflang đối xứng (mỗi trang liệt kê tất cả
  locale gồm chính nó) + x-default; canonical self-referencing khớp với entry hreflang tương ứng.
- **NFR-04 (Correctness):** format chỉ đổi hiển thị. Test: `formatCurrencyWebsite(1000000,"en")`
  === "1,000,000 VND", `"vi"` === "1.000.000 VND"; parse ngược ra 1000000. date-web giữ
  wall-clock (so string nguồn vs output không tz-shift).
- **NFR-05 (i18n locale-agnostic):** mọi loop/map dựa `routing.locales`; thêm locale thứ 3 chỉ
  cần: thêm vào `routing.ts` + 1 nhánh `getOgLocale` + messages. Không sửa logic metadata/format.
- **NFR-06 (A11y):** `<html lang>` đã set theo locale ở sprint-1 (`[locale]/layout.tsx`) — chỉ
  xác nhận, không sửa.
- **NFR-07 (Robustness):** mọi generateMetadata luôn trả tối thiểu `title` từ namespace
  `metadata`; không nhánh nào throw khi service null.

## 10. Regression-safe Plan

- **`src/lib/utils.ts formatCurrencyWebsite`** — chỉ THÊM param `locale?` (optional, default
  vi-VN) → chữ ký cũ vẫn hợp lệ; callsite chưa update không vỡ. `formatCurrency` (admin) KHÔNG
  đụng. Cập nhật 14 callsite web truyền locale: client → `useLocale()`, server component
  (ProductInformation, ProductCard, OrderItem, CartItemTotalPrice, QuickCartForm) → nhận qua prop
  hoặc `getLocale()` từ next-intl/server. Giá tiền hiển thị đúng số ở mọi callsite.
- **`src/app/sitemap.ts`** — chỉ thêm field `alternates` vào mỗi entry; giữ `force-dynamic`, tập
  URL, đọc `menu_page` theo `defaultLocale`, filter null. Không đổi số lượng/đường dẫn URL.
- **4 generateMetadata hiện có** — extend: giữ nguyên title/description/keywords/openGraph/icons;
  chỉ (a) đổi `og:locale` hardcode → `getOgLocale`, (b) thay `canonical` đơn → `buildAlternates`
  (giữ URL bản en như cũ, thêm languages), (c) menu/reservation đổi `locale as Locale` →
  `resolveLocale`. Bản en title/description KHÔNG đổi.
- **checkout/cart** — chuyển `export const metadata` static → `async generateMetadata`; page
  component vẫn render bình thường (provider client). Bản en title/description tương đương chuỗi
  cũ (đặt trong `metadata.checkout/cart` của en.json).
- **`ReservationSubmitSuccess.tsx`** — bỏ `moment`, dùng `date-web.ts` + `useLocale()`; giữ hiển
  thị mã/khách/ghi chú; chỉ đổi cách format ngày/giờ, không đổi giá trị.
- **`lib/date.ts formatDateVN`** — KHÔNG import/sửa; web dùng `date-web.ts` riêng để tránh nhầm.
- **messages en/vi** — chỉ THÊM namespace `metadata`; deep-merge fallback giữ nguyên.

## 11. File Change Plan

**NEW**
- `src/lib/i18n-meta.ts` — buildLocalizedUrl / buildAlternates / buildSitemapLanguages / getOgLocale.
- `src/lib/date-web.ts` — formatReservationDate / formatReservationTime (Intl, wall-clock).

**MODIFY — metadata**
- `src/app/(web)/[locale]/page.tsx` — home: resolveLocale, buildAlternates, getOgLocale, fallback ns.
- `src/app/(web)/[locale]/menu/[category]/page.tsx` — resolveLocale (EC-11), buildAlternates, getOgLocale, i18n "All"/"All Menu"/description ICU.
- `src/app/(web)/[locale]/dish/[slug]/page.tsx` — buildAlternates, getOgLocale, i18n notFound/desc fallback.
- `src/app/(web)/[locale]/reservation/page.tsx` — resolveLocale (EC-11), buildAlternates, getOgLocale, fallback ns.
- `src/app/(web)/[locale]/checkout/page.tsx` — static→async generateMetadata(locale) + params.
- `src/app/(web)/[locale]/cart/page.tsx` — static→async generateMetadata(locale) + params.
- `src/app/sitemap.ts` — thêm `alternates.languages` mỗi entry.

**MODIFY — format**
- `src/lib/utils.ts` — `formatCurrencyWebsite(amount, locale?)`. (KHÔNG đụng `formatCurrency`.)
- 14 web callsite: `ProductCard`, `CartItem`, `CartSummary`, `CartItemTotalPrice`,
  `CheckoutSummary`, `CheckoutForm`, `CheckoutRender`, `OrderItem` (checkout), `ProductInformation`,
  `AddToCartButton`, `QuantityEditor`, `AddonsEditor`, `QuickCartForm`, `CartSubmit` — truyền locale.
- `src/components/web/features/reservation/ReservationSubmitSuccess.tsx` — dùng date-web + useLocale, bỏ moment.

**MODIFY — messages**
- `messages/en.json` + `messages/vi.json` — thêm namespace `metadata` (§5).

**MODIFY — docs**
- `.sdlc/architecture.md` — thêm mục "SEO/i18n metadata + format (sprint-4)".

**VERIFY-ONLY (task kiểm tra, không code lớn) — Fallback sweep + hardcode scan**
- Grep chuỗi English hardcode phía user:
  - `rg -n "\"[A-Z][a-z].*\"" src/app/\(web\)/\[locale\] src/components/web --type tsx` rồi
    lọc literal trong JSX chưa qua `t()`/dữ liệu động.
  - `rg -n "toLocaleString\(|moment\(|\"en-US\"|\"vi-VN\"|en_US" src/components/web src/app/\(web\)`
    → còn format cứng?
  - `rg -n ">[A-Za-z ]{3,}<" src/components/web` → text node literal.
- Danh mục rà: config ui field localized (sprint-2 resolve — không rỗng), entity translation
  (sprint-3 COALESCE cột gốc — không rỗng), message key thiếu vi (deep-merge en — không raw key),
  layout không vỡ khi fallback dài (Story-07). Brand/danh từ riêng được giữ.
- Xác nhận `<html lang>` = locale (`[locale]/layout.tsx`, NFR-06).

---

## Self-review

- Mọi RULE-01…15 + EC-01…12 + NFR-01…07 đều có dòng trong §8/§9. ✔
- checkout/cart chuyển dynamic có generateMetadata + fallback ns (AC-03). ✔
- Regression Impact §10 requirements: utils, sitemap, 4 metadata, checkout/cart,
  ReservationSubmitSuccess, formatDateVN, messages — đều có plan §10. ✔
- Không thêm endpoint/entity mới; không đụng admin/service/routing. ✔
- Locale-agnostic (routing.locales) toàn bộ. ✔

**Tóm tắt:** 0 endpoint REST mới, 0 entity/migration mới. 6 trang generateMetadata (4 refactor +
2 chuyển từ static) + sitemap alternates. 2 lib mới (`i18n-meta.ts`, `date-web.ts`), sửa
`formatCurrencyWebsite` + 14 callsite + `ReservationSubmitSuccess`, thêm namespace `metadata`.
**Tech Decisions cần user xem:** (1) canonical self-referencing per-locale — OQ-03/ASM-04; (2)
format tiền giữ hậu tố "VND" grouping-per-locale — OQ-01a/ASM-02; (3) format ngày/giờ reservation
en = MM/DD/YYYY + 12h — OQ-02/ASM-03.
</content>
</invoke>
