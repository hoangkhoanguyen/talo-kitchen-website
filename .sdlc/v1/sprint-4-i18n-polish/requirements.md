# Requirements — sprint-4-i18n-polish

> Sprint CUỐI của version v1 (i18n EN + VI cho web user). Hoàn thiện SEO theo locale
> (generateMetadata + hreflang + sitemap alternates), format tiền/ngày theo locale, rà
> fallback toàn bộ, quét chuỗi English hardcode còn sót, và QA acceptance toàn version.
> KHÔNG có entity DB mới. KHÔNG phá sprint-1/2/3. KHÔNG dịch label admin.

---

# PART 1 — HUMAN REVIEW

## 1. Sprint Goal & Scope

**Goal:** Đưa website 2 ngôn ngữ (EN/VI) lên mức "production-ready" về SEO và trải nghiệm định
dạng theo locale, đảm bảo fallback an toàn ở mọi loại nội dung và không còn chuỗi English hardcode
phía user. Đây là pass QA/hoàn thiện, không thêm tính năng nghiệp vụ mới.

**Đối tượng hưởng lợi:** end-user (đọc đúng ngôn ngữ, số/ngày đúng locale), search engine
(hreflang/metadata theo locale), chủ nhà hàng (SEO đúng cho cả 2 thị trường EN/VI).

### ✅ In scope
- `generateMetadata` theo locale ở mọi trang `[locale]` có metadata: `page.tsx` (home),
  `menu/[category]`, `dish/[slug]`, `reservation`, `checkout`, `cart`.
- Sửa `og:locale` đang hardcode `"en_US"` → map theo locale (en→en_US, vi→vi_VN).
- Thêm `alternates.languages` (hreflang en/vi + `x-default`) cho các trang, khớp scheme URL
  `as-needed` (en KHÔNG prefix, vi = `/vi/...`).
- Đưa `checkout`/`cart` từ static `export const metadata` (hardcode English) → metadata theo
  locale + hreflang.
- `src/app/sitemap.ts`: thêm `alternates.languages` (en/vi) cho mỗi URL.
- Format tiền (VND) theo locale: `formatCurrencyWebsite` / `formatCurrency` (`src/lib/utils.ts`)
  hiện hardcode `"vi-VN"`.
- Format ngày/giờ theo locale ở web user: `ReservationSubmitSuccess.tsx` (moment, format cứng).
- Rà soát fallback toàn bộ (config ui, entity, chuỗi tĩnh) — pass kiểm tra tổng, không vỡ layout.
- Quét & loại chuỗi English hardcode còn sót phía user (`src/app/(web)/[locale]/**`,
  `src/components/web/**`).
- Xác nhận `<html lang>` đúng theo locale (đã làm ở sprint-1).
- QA acceptance toàn version.

### ❌ Out of scope
- Bất kỳ entity DB / migration / schema mới nào (sprint này KHÔNG có entity DB mới).
- Dịch hoặc format lại giao diện ADMIN (label admin giữ tiếng Việt; format ngày admin qua
  `formatDateVN`/`lib/date.ts` GIỮ NGUYÊN — không thuộc web user).
- Thay đổi giá trị tiền/ngày (chỉ đổi cách HIỂN THỊ, không đổi số/giá trị).
- Thêm ngôn ngữ thứ 3.
- Order snapshot lịch sử (đã chốt ở sprint-3: KHÔNG dịch lại lịch sử).
- Thay đổi routing/middleware/cache đã chốt ở sprint-1/2/3.

## 2. Open Questions

- **OQ-01 — Ký hiệu/format tiền VND theo locale.** Hiện `formatCurrencyWebsite` in ra
  `"1.000.000 VND"` (grouping vi-VN + hậu tố "VND") cho cả 2 locale. Giá trị VND giống nhau, chỉ
  khác cách hiển thị. Bạn muốn:
  - (a) **[Assumption ASM-02]** Giữ hậu tố text "VND", chỉ đổi grouping theo locale
    (en → `1,000,000 VND`, vi → `1.000.000 VND`); HOẶC
  - (b) Dùng `Intl.NumberFormat` style currency đầy đủ (vi → `1.000.000 ₫`, en → `₫1,000,000`).
  → Mặc định dùng (a) vì ít rủi ro nhất về mặt thị giác/brand (giữ chữ "VND" quen thuộc). Nếu
    không trả lời sẽ theo (a).

- **OQ-02 — Format ngày đặt bàn (reservation) cho locale en.** VI hiện là `DD/MM/YYYY` +
  `hh:mm A`. Với en bạn muốn `MM/DD/YYYY` (kiểu US) hay giữ `DD/MM/YYYY`? Giờ dùng 12h (AM/PM)
  hay 24h?
  → **[Assumption ASM-03]** Dùng `Intl.DateTimeFormat(locale)`: vi → `31/08/2026`, en →
    `08/31/2026`; giờ vi → 24h (`19:30`), en → 12h (`7:30 PM`). Nếu không trả lời sẽ theo cách này.

- **OQ-03 — Canonical URL per-locale.** Hiện các trang set `canonical` là URL không prefix
  (bản en) cho MỌI locale. Chuẩn SEO khuyến nghị canonical tự-trỏ (self-referencing) theo locale
  (trang vi canonical về `/vi/...`).
  → **[Assumption ASM-04]** Chuyển canonical sang self-referencing per-locale, kèm
    `alternates.languages`. Nếu bạn muốn giữ canonical luôn trỏ bản en (gộp tín hiệu về 1 URL),
    hãy báo.

- **OQ-04 — Chuỗi metadata fallback (khi config seo trống).** Các fallback title/description
  trong `generateMetadata` (vd `"Reservation | TALO Kitchen & Lounge"`, `"Checkout | ..."`) hiện
  là chuỗi English cứng. Có cần i18n hoá các fallback này (thêm namespace `metadata` vào
  messages) không, hay chấp nhận fallback English (vì đây chỉ là phương án cuối khi admin chưa
  nhập seo)?
  → **[Assumption ASM-05]** i18n hoá các fallback metadata tĩnh qua namespace `metadata` trong
    messages (nhất quán với chủ trương "không chuỗi English hardcode phía user"). Brand name
    `"TALO Kitchen & Lounge"` là danh từ riêng → giữ nguyên mọi locale.

## 3. Key Assumptions

- **ASM-01 — Locale-agnostic.** Kế thừa nguyên tắc xuyên version: KHÔNG hardcode `"en"/"vi"`;
  luôn dùng `routing.locales` / `routing.defaultLocale`. Map og:locale và mọi logic phải hoạt
  động khi thêm locale thứ 3 (chỉ cần bổ sung 1 bảng map nhỏ).
- **ASM-02 — Format tiền:** theo OQ-01(a).
- **ASM-03 — Format ngày/giờ reservation:** theo OQ-02 (Intl.DateTimeFormat per-locale).
- **ASM-04 — Canonical:** self-referencing per-locale (OQ-03).
- **ASM-05 — Metadata fallback:** i18n hoá, brand name giữ nguyên (OQ-04).
- **ASM-06 — Nguồn nội dung metadata đã localized sẵn.** Config `seo.*` được
  `getUIConfigsByKeyCached(key, locale)` RESOLVE theo locale ở sprint-2 (trả string đã resolve,
  fallback en); product title/description được `getProductDetailsBySlugCached(slug, locale)`
  resolve ở sprint-3. Sprint-4 CHỈ cần truyền đúng `locale` vào các hàm này và tiêu thụ kết quả —
  KHÔNG tự xử lý i18n nội dung lần nữa.
- **ASM-07 — og:locale map:** `{ en: "en_US", vi: "vi_VN" }`. Có thể kèm `alternateLocale` là các
  locale còn lại (open, không bắt buộc).
- **ASM-08 — Build URL hreflang:** `en` = `${APP_URL}${path}` (không prefix), `vi` =
  `${APP_URL}/vi${path}`; `x-default` = URL bản `defaultLocale` (en). Path lấy từ đường dẫn
  không-locale hiện có của trang.
- **ASM-09 — Không đổi giá trị.** Mọi thay đổi format chỉ ảnh hưởng chuỗi hiển thị; số tiền
  (integer VND) và ngày/giờ (giá trị wall-clock khách chọn) KHÔNG bị dịch chuyển/round/tz-shift.
  Đặc biệt `arrivalDate`/`arrivalTime` là wall-clock (KHÔNG áp offset +7, theo cảnh báo
  `lib/date.ts`).
- **ASM-10 — `formatDateVN` (admin) không đụng.** Sprint chỉ chuẩn hoá format phía web user.

---

# PART 2 — AGENT REFERENCE

## 4. User Stories + Acceptance Criteria

### Story-01 — SEO metadata theo locale
**As** search engine / người chia sẻ link, **I want** mỗi trang trả về title/description/OG đúng
theo ngôn ngữ URL, **so that** kết quả tìm kiếm và preview mạng xã hội hiển thị đúng ngôn ngữ.

- **AC-01.1** GIVEN URL `/vi/dish/<slug>` WHEN render `generateMetadata` THEN `title`,
  `description`, `openGraph.title/description` lấy từ dữ liệu bản `vi` (product/config đã resolve),
  không phải English.
- **AC-01.2** GIVEN URL `/dish/<slug>` (en, không prefix) WHEN render metadata THEN nội dung là
  bản `en`.
- **AC-01.3** GIVEN bất kỳ trang metadata nào WHEN locale = vi THEN `openGraph.locale = "vi_VN"`;
  WHEN locale = en THEN `openGraph.locale = "en_US"` (không còn hardcode `"en_US"`).
- **AC-01.4** GIVEN product/config bản vi thiếu THEN metadata fallback về bản en (không rỗng,
  không raw key) — RULE-05.

### Story-02 — hreflang alternates trên trang
**As** search engine, **I want** mỗi trang khai báo các phiên bản ngôn ngữ thay thế, **so that**
đúng phiên bản được index cho từng thị trường.

- **AC-02.1** GIVEN trang `/dish/<slug>` (en) WHEN render metadata THEN `alternates.languages`
  chứa `en → ${APP_URL}/dish/<slug>` và `vi → ${APP_URL}/vi/dish/<slug>` và
  `x-default → ${APP_URL}/dish/<slug>`.
- **AC-02.2** GIVEN cùng trang trên bản vi `/vi/dish/<slug>` WHEN render metadata THEN
  `alternates.languages` chứa CÙNG tập URL như AC-02.1 (hreflang phải nhất quán 2 chiều).
- **AC-02.3** GIVEN bất kỳ trang nào trong scope THEN URL en KHÔNG có prefix `/en`, URL vi CÓ
  prefix `/vi` (khớp `localePrefix: "as-needed"`).
- **AC-02.4** GIVEN `canonical` THEN trỏ self-referencing theo locale hiện tại (ASM-04).

### Story-03 — checkout & cart có metadata theo locale
**As** người dùng chia sẻ link giỏ hàng/thanh toán, **I want** metadata 2 trang này cũng theo
locale, **so that** nhất quán với các trang còn lại.

- **AC-03.1** GIVEN `/checkout` và `/cart` (hiện dùng static `export const metadata` English) WHEN
  chuyển sang `generateMetadata(locale)` THEN title/description lấy theo locale (từ messages
  `metadata` namespace, ASM-05) và có `alternates.languages` + `openGraph.locale` đúng.
- **AC-03.2** GIVEN locale vi THEN title/description hiển thị tiếng Việt (không còn "Checkout | …"
  cứng).

### Story-04 — sitemap hreflang
**As** search engine, **I want** sitemap khai báo alternates cho từng URL, **so that** crawl đủ 2
ngôn ngữ.

- **AC-04.1** GIVEN `sitemap.xml` WHEN generate THEN mỗi entry có `alternates.languages` gồm
  `en` (URL không prefix) và `vi` (URL prefix `/vi`).
- **AC-04.2** GIVEN entry sản phẩm/category/reservation/home THEN URL en giữ nguyên như hiện tại
  (không đổi đường dẫn cũ → không hại SEO), vi là bản `/vi/...` tương ứng.
- **AC-04.3** GIVEN `sitemap.ts` đang `force-dynamic` + đọc menu config theo `defaultLocale` THEN
  hành vi build/DB giữ nguyên, chỉ THÊM alternates (không đổi số lượng URL gốc).

### Story-05 — Format tiền theo locale
**As** người dùng, **I want** số tiền hiển thị đúng quy ước locale, **so that** dễ đọc theo thói
quen ngôn ngữ.

- **AC-05.1** GIVEN amount = 1000000 WHEN locale = vi THEN hiển thị `1.000.000 VND` (grouping vi).
- **AC-05.2** GIVEN amount = 1000000 WHEN locale = en THEN hiển thị `1,000,000 VND` (grouping en)
  — theo ASM-02.
- **AC-05.3** GIVEN cùng amount ở 2 locale THEN giá trị số KHÔNG đổi, chỉ khác dấu phân cách/ký
  hiệu (ASM-09).
- **AC-05.4** GIVEN mọi component web user đang dùng `formatCurrencyWebsite` THEN sau sửa vẫn hoạt
  động (nhận được locale) và không component nào vỡ.

### Story-06 — Format ngày/giờ theo locale (web user)
**As** người đặt bàn, **I want** ngày/giờ hiển thị theo locale, **so that** đọc tự nhiên.

- **AC-06.1** GIVEN `ReservationSubmitSuccess` với `arrivalDate` WHEN locale = vi THEN ngày format
  `31/08/2026`; WHEN locale = en THEN `08/31/2026` (ASM-03).
- **AC-06.2** GIVEN `arrivalTime` WHEN locale = vi THEN `19:30` (24h); WHEN en THEN `7:30 PM`
  (12h) — ASM-03.
- **AC-06.3** GIVEN `arrivalDate`/`arrivalTime` là wall-clock THEN KHÔNG áp offset +7 / tz-shift
  (giá trị ngày/giờ giữ nguyên như khách chọn) — RULE-09, ASM-09.

### Story-07 — Fallback pass toàn bộ
**As** người dùng xem bản vi chưa dịch đủ, **I want** thấy nội dung en thay vì trống/rỗng,
**so that** trang không vỡ.

- **AC-07.1** GIVEN config ui field localized thiếu bản vi THEN hiển thị bản en (sprint-2 resolve)
  — không chuỗi rỗng.
- **AC-07.2** GIVEN entity (product/category/addon) thiếu translation vi THEN hiển thị cột gốc en
  (sprint-3) — không rỗng.
- **AC-07.3** GIVEN key message thiếu trong `vi.json` THEN dùng `en.json` (deep-merge sprint-1) —
  không hiện raw key.
- **AC-07.4** GIVEN mọi trường hợp fallback trên THEN layout KHÔNG vỡ (không cắt chữ gây tràn,
  không element rỗng làm sập grid).

### Story-08 — Không còn chuỗi English hardcode phía user
**As** người dùng bản vi, **I want** không thấy chữ English sót, **so that** trải nghiệm đồng nhất.

- **AC-08.1** GIVEN quét `src/app/(web)/[locale]/**` + `src/components/web/**` THEN mọi chuỗi tĩnh
  user-facing đã qua `useTranslations`/`getTranslations` hoặc là dữ liệu động localized — không
  còn literal English trong JSX (trừ danh từ riêng brand/tên).
- **AC-08.2** GIVEN chuỗi hardcode sót được phát hiện (vd fallback `label: "All"` ở
  menu/[category] và sitemap; fallback text metadata) THEN được xử lý theo RULE-13.

### Story-09 — QA acceptance toàn version
**As** chủ nhà hàng, **I want** toàn bộ luồng i18n hoạt động, **so that** yên tâm release v1.

- **AC-09.1** GIVEN đổi ngôn ngữ qua switcher THEN URL phản ánh locale (`as-needed`), refresh giữ
  ngôn ngữ (cookie `NEXT_LOCALE`).
- **AC-09.2** GIVEN admin THEN vẫn tiếng Việt, và nhập được cả en/vi cho config + entity.
- **AC-09.3** GIVEN dữ liệu English cũ THEN nguyên vẹn (là bản en/fallback), không mất mát.
- **AC-09.4** GIVEN toàn bộ trang user THEN không lỗi runtime khi chuyển locale; `<html lang>`
  khớp locale.

## 5. Business Rules

```
RULE-01: Mọi generateMetadata phải truyền `locale` (đã resolveLocale) vào service nội dung
         (getUIConfigsByKeyCached / getProductDetailsBySlugCached) — không đọc mặc định en.
RULE-02: og:locale map từ locale qua bảng { en:"en_US", vi:"vi_VN" } (locale-agnostic, ASM-07);
         KHÔNG hardcode "en_US".
RULE-03: alternates.languages phải liệt kê ĐỦ mọi locale trong routing.locales + x-default
         (= defaultLocale). Build lặp theo routing.locales, KHÔNG hardcode 2 mục.
RULE-04: URL trong hreflang/sitemap theo scheme as-needed: defaultLocale (en) KHÔNG prefix; locale
         khác = `/{locale}` prefix trước path. x-default = URL defaultLocale.
RULE-05: Metadata content thiếu bản locale → fallback về bản en (đã đảm bảo ở service sprint-2/3);
         nếu cả en trống → dùng fallback tĩnh i18n (namespace `metadata`) + brand name.
RULE-06: canonical = self-referencing per-locale (ASM-04): en → non-prefix URL, vi → `/vi/...`.
RULE-07: Format tiền dùng grouping theo locale (Intl.NumberFormat(locale)) + hậu tố "VND"
         (ASM-02); giá trị số không đổi.
RULE-08: Format ngày/giờ web user dùng Intl.DateTimeFormat(locale) (ASM-03); không đổi giá trị.
RULE-09: arrivalDate/arrivalTime là wall-clock → KHÔNG áp tz offset khi format (RULE kế thừa
         cảnh báo lib/date.ts).
RULE-10: Hàm format (currency/date) phải nhận `locale` tường minh (server) hoặc lấy từ
         useLocale()/getLocale() — KHÔNG suy đoán từ navigator hay hardcode "vi-VN".
RULE-11: Chuỗi tĩnh user-facing phải qua next-intl messages; brand name / danh từ riêng được
         phép giữ nguyên mọi locale.
RULE-12: sitemap giữ nguyên tập URL gốc (không thêm/bớt URL); chỉ bổ sung alternates.
RULE-13: Fallback string còn hardcode (vd category "All", metadata fallback) → chuyển sang
         messages hoặc dữ liệu localized; nếu là key kỹ thuật (slug "all") thì giữ, chỉ i18n phần
         LABEL hiển thị.
RULE-14: KHÔNG thay đổi service/cache/routing/middleware đã chốt sprint-1/2/3; chỉ tiêu thụ đúng
         API hiện có.
RULE-15: Admin (label + formatDateVN) KHÔNG đổi.
```

## 6. Data Entities & Constraints

**Sprint này KHÔNG tạo/không sửa entity DB nào.** Không migration, không bảng mới, không cột mới.
Chỉ tiêu thụ dữ liệu đã localized sẵn:
- **UI Config** (`configs`, `config_type='ui'`) — field `seo.*` (title/description/og_title/
  og_description/keywords/og_image) đã resolve theo locale ở sprint-2; sprint-4 chỉ đọc.
- **Product/Category/Addon** — title/description/subDescription/allergenInfo resolve theo locale
  ở sprint-3; sprint-4 chỉ đọc (dùng cho dish metadata + hiển thị).
- **Reservation** (`arrivalDate`, `arrivalTime`, `numberOfPeople`, …) — chỉ FORMAT hiển thị, không
  đổi dữ liệu.

## 7. Edge Cases Registry

```
EC-01 [RULE-05]: Product không tồn tại (dish/[slug]) → metadata title "Product Not Found | ..."
                 phải i18n theo locale (hiện đang English cứng ở dish/[slug]).
EC-02 [RULE-05]: Config seo trống hoàn toàn (admin chưa nhập) → fallback tĩnh i18n + brand name,
                 không rỗng.
EC-03 [RULE-05]: seo.title có bản en nhưng thiếu vi → hiển thị en (fallback), metadata không rỗng.
EC-04 [RULE-04]: Trang home (path "/") → hreflang en = `${APP_URL}`, vi = `${APP_URL}/vi`,
                 x-default = `${APP_URL}`.
EC-05 [RULE-04]: menu/[category] với key "all" → path `/menu/all`; hreflang vi = `/vi/menu/all`.
EC-06 [RULE-02]: Thêm locale thứ 3 tương lai → map og:locale phải có nhánh; nếu thiếu map → dùng
                 fallback an toàn (vd `${locale}` hoặc bỏ og:locale) chứ không crash.
EC-07 [RULE-07]: amount = 0 → "0 VND" đúng cả 2 locale; amount âm (không kỳ vọng) → vẫn format
                 không crash.
EC-08 [RULE-08]: arrivalDate/arrivalTime null hoặc sai format → không crash, hiển thị placeholder
                 rỗng an toàn (giữ hành vi hiện tại, không ném lỗi render).
EC-09 [RULE-09]: arrivalTime "19:30:00" ở locale en → "7:30 PM" (KHÔNG cộng offset thành giờ khác).
EC-10 [RULE-13]: sitemap category label "All" (hiện hardcode) → không ảnh hưởng URL (dùng key),
                 nhưng nếu label lọt ra output nào user-facing thì phải i18n.
EC-11 [RULE-01]: menu/[category] generateMetadata hiện truyền `locale as Locale` raw (không
                 resolveLocale) → chuẩn hoá qua resolveLocale để nhất quán, tránh locale rác.
EC-12 [RULE-03]: Path có query string / trailing khác → hreflang chỉ dùng pathname chuẩn, không
                 kèm query.
```

## 8. Integration Touchpoints

- **next-intl** — `routing` (`src/i18n/routing.ts`) là nguồn locale duy nhất cho map/loop hreflang;
  `getTranslations`/`getLocale` (server, next-intl/server) cho metadata + format server-side;
  `useTranslations`/`useLocale` (client) cho ReservationSubmitSuccess. Lỗi cần xử: locale không
  hợp lệ → resolveLocale fallback default.
- **Service cached (sprint-2/3)** — `getUIConfigsByKeyCached(key, locale)`,
  `getProductDetailsBySlugCached(slug, locale)`, `getAllProducts` (sitemap). Không đổi chữ ký;
  chỉ truyền đúng locale. Lỗi: null → dùng fallback metadata (EC-01/EC-02).
- **Next.js Metadata API** — `alternates.languages`, `alternates.canonical`, `openGraph.locale`;
  `MetadataRoute.Sitemap` với field `alternates.languages`. `metadataBase` đã set ở
  `(web)/[locale]/layout.tsx` (APP_URL).
- **Intl (built-in)** — `Intl.NumberFormat(locale)` cho tiền, `Intl.DateTimeFormat(locale)` cho
  ngày/giờ. Không thêm dependency; có thể bỏ dần `moment` ở web user (moment vẫn còn dùng ở admin
  qua lib/date.ts — không đụng).
- **APP_URL** (`src/constants/app.ts`, `https://www.talokitchenhg.com`) — base để build URL tuyệt
  đối cho hreflang/sitemap.

## 9. Non-functional Requirements (NFR)

```
NFR-01 [Perf] Không thêm DB round-trip mới trong generateMetadata: tái dùng dữ liệu đã cache
        per-locale của sprint-2/3 (metadata + page cùng gọi cached service, hưởng cùng cache).
NFR-02 [Perf] sitemap giữ `force-dynamic` hiện tại; thêm alternates KHÔNG thêm query DB (build từ
        dữ liệu đã fetch).
NFR-03 [SEO] hreflang phải hợp lệ & đối xứng 2 chiều (mỗi trang trỏ về tất cả locale gồm chính
        nó); có x-default. canonical không mâu thuẫn với hreflang.
NFR-04 [Correctness] Format tiền/ngày tuyệt đối không đổi giá trị (chỉ hiển thị) — kiểm bằng test
        so sánh số/giờ nguồn vs parse ngược.
NFR-05 [i18n] Locale-agnostic: mọi map/loop dựa routing.locales; thêm locale thứ 3 không phải sửa
        logic metadata/format (chỉ bổ sung map og:locale + messages).
NFR-06 [A11y] `<html lang>` khớp locale (đã có sprint-1) — xác nhận; đảm bảo lang đúng cho screen
        reader/công cụ dịch.
NFR-07 [Robustness] Không có generateMetadata nào ném lỗi khi service trả null/thiếu dịch → luôn
        trả metadata tối thiểu hợp lệ (title).
```

## 10. Regression Impact

Sprint thêm/hoàn thiện trên codebase đang chạy. Các điểm ĐANG DÙNG có thể bị ảnh hưởng — "must not
break":

- **`src/lib/utils.ts` → `formatCurrencyWebsite` / `formatCurrency`** — dùng ở ≥14 component web
  (`ProductCard`, `CartItem`, `CartSummary`, `CartItemTotalPrice`, `CheckoutSummary`,
  `CheckoutForm`, `CheckoutRender`, `OrderItem`, `ProductInformation`, `AddToCartButton`,
  `QuantityEditor`, `AddonsEditor`, `QuickCartForm`, `CartSubmit`) VÀ 3 component admin
  (`OrderSummary`, `OrderItems`, `NewOrderPopup`). **Must not break:** đổi chữ ký để nhận locale
  phải không làm vỡ các callsite; **component ADMIN dùng chung không được đổi format** (admin
  không theo locale) — cần giữ hành vi vi-VN mặc định khi không truyền locale (backward-compatible
  default), hoặc tách rõ hàm. Giá tiền hiển thị đúng số ở mọi callsite.
- **`src/app/sitemap.ts`** — đang production. Must not break: tập URL gốc + `force-dynamic` +
  đọc `menu_page` config giữ nguyên; sitemap vẫn build/serve, không lỗi khi DB null.
- **`generateMetadata` 4 trang hiện có (home/menu/dish/reservation)** — must not break: các field
  metadata hiện có (title/description/keywords/openGraph/icons/canonical) vẫn xuất; chỉ bổ sung/sửa
  og:locale + alternates.languages. Không làm mất canonical hay đổi title cho bản en (giữ SEO en
  hiện tại).
- **`checkout`/`cart` metadata** — chuyển static → dynamic: must not break render trang (2 trang
  này là client-heavy provider); bản en title/description giữ tương đương hiện tại.
- **`ReservationSubmitSuccess.tsx`** — luồng đặt bàn thành công: must not break hiển thị mã/ngày/
  giờ/khách; chỉ đổi cách format ngày/giờ. Không đổi giá trị.
- **`lib/date.ts` `formatDateVN`** — dùng ở admin (reservations/orders): KHÔNG đụng (out of scope);
  đảm bảo thay đổi web user không import/sửa nhầm file này.
- **Messages `en.json`/`vi.json`** — nếu thêm namespace `metadata`: must not break các namespace
  hiện có; giữ deep-merge fallback (sprint-1).

## 11. Definition of Done

- Tất cả AC (Story-01…09) pass; RULE-01…15 tuân thủ.
- 6 trang scope (home/menu[category]/dish[slug]/reservation/checkout/cart) có metadata theo locale
  + og:locale đúng + alternates.languages (en/vi/x-default) + canonical self-referencing.
- `sitemap.xml` có alternates hreflang cho mọi URL; tập URL gốc không đổi.
- Format tiền + ngày/giờ web user theo locale; giá trị KHÔNG đổi (NFR-04); admin không đổi.
- Fallback pass: không chuỗi rỗng/raw key ở bất kỳ loại nội dung nào; layout không vỡ (Story-07).
- Quét sạch chuỗi English hardcode phía user (Story-08); brand name được phép giữ.
- `<html lang>` xác nhận đúng (NFR-06).
- NFR-01…07 thoả.
- Không regression: các callsite `formatCurrencyWebsite`, sitemap, admin, luồng cart/checkout/
  reservation hoạt động bình thường (mục 10).
- QA acceptance toàn version (Story-09) pass: đổi ngôn ngữ/URL/refresh/admin/dữ liệu cũ.
- KHÔNG có migration/schema mới; sprint-1/2/3 nguyên vẹn.
