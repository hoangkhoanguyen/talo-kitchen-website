# Requirements — sprint-2-config-i18n (Loại B: i18n cho UI config động)

> Project: Talo Kitchen | Version v1 (i18n EN + VI) | Phụ thuộc: sprint-1-i18n-foundation (done)
> Phạm vi: localize nội dung động lưu trong bảng `configs` với `config_type='ui'`.

---

# PART 1 — HUMAN REVIEW (đọc phần này trước)

## 1. Sprint Goal & Scope

**Mục tiêu:** Cho phép admin nhập nội dung UI config động (bảng `configs`, `config_type='ui'`) theo từng
ngôn ngữ (EN + VI), và website user hiển thị đúng theo locale đang xem (`/en`, `/vi`), fallback về `en`
khi thiếu bản dịch. Kiến trúc locale-agnostic để thêm ngôn ngữ thứ 3 sau này không phải viết lại.

**Đối tượng hưởng lợi:** (a) khách xem web ở `/vi` thấy nội dung tiếng Việt; (b) admin nhập được cả 2
bản ngôn ngữ trên các trang settings hiện có (homepage, menu_page, reservation_page, layout).

### ✅ In scope
- Thêm cờ `localized?: boolean` vào metadata `FieldType` — **chỉ** áp cho `text`/`textarea`.
- Đổi kiểu giá trị của field được đánh dấu `localized`: `string` → object đa ngôn ngữ (`{ en, vi }` /
  `Partial<Record<Locale,string>>`) trong `src/types/configs.ts`.
- **Data migration** cấu trúc JSON trong cột `value` của MỌI config `config_type='ui'`: mỗi field
  localized `"abc"` → `{ en: "abc", vi: "" }`. KHÔNG đổi schema bảng DB. Chạy trên schema `dev_multi_lang`.
- Đánh dấu `localized: true` cho các field text/textarea là nội dung hiển thị thật (danh sách đầy đủ ở
  Business Rules RULE-20…, kể cả field lồng trong array/object).
- Một renderer field admin duy nhất: gặp `localized: true` → render nhóm ô nhập theo từng locale
  (tab/cạnh nhau), sửa 1 chỗ áp cho mọi trang settings.
- Badge "chưa dịch" khi field thiếu bản `vi`; (tuỳ chọn) nút "Copy từ English".
- Service resolve config theo locale (fallback `en`) TRƯỚC khi trả cho component user-facing.
- Cache config user-facing thêm `locale` vào key/tag.

### ❌ Out of scope
- Entity DB (products, categories, addons) → sprint-3-entity-i18n.
- Config `config_type='app'` (order/restaurant/reservation settings) — KHÔNG đụng.
- Field non-localized: ảnh, số, boolean, select, slug, href, icon, `title`/`sub_title` array (hiệu ứng
  xoay chữ), phone/email/URL.
- Dịch giao diện/label admin (giữ nguyên tiếng Việt).
- SEO hreflang / `generateMetadata` per-locale / format tiền-ngày → sprint-4-i18n-polish (chỉ đảm bảo
  seo config resolve đúng string ở sprint này; wiring metadata theo locale là sprint-4).

## 2. Open Questions (cần user quyết; nếu không trả lời → dùng Assumption kèm theo)

- **OQ-01 — Cấu trúc lưu giá trị localized.** `{ en: string; vi: string }` cố định, hay
  `Partial<Record<Locale, string>>` locale-agnostic?
  *Assumption (ASM-01):* dùng type locale-agnostic `LocalizedText = Partial<Record<Locale,string>>`
  (Locale lấy từ `src/i18n/routing.ts`), nhưng migration seed đủ 2 khoá `{ en, vi }`. Thêm ngôn ngữ 3
  chỉ cần thêm vào `routing.ts` + migration bổ sung, không sửa type.
- **OQ-02 — Các field "giờ/thời gian" có localize không?** `header.open_daily`, `contact.opening_hours[].items[].value`,
  `footer.opening_hours[].value`, `booking` time strings — chứa "AM/PM" nhưng chủ yếu là số giờ.
  *Assumption (ASM-02):* KHÔNG localize các field chỉ chứa giờ (value giờ dùng chung). Localize phần
  nhãn (`label`, `title`) đi kèm. Xem RULE-22.
- **OQ-03 — SEO keywords có localize không?** `seo.keywords[].keyword`.
  *Assumption (ASM-03):* CÓ localize (từ khoá SEO khác nhau theo ngôn ngữ). Nếu user muốn dùng chung →
  bỏ cờ localized ở field này.
- **OQ-04 — Nội dung do khách tạo trong reviews** (`reviews.reviews_list[].customer_name`, `.comment`, `.date`).
  *Assumption (ASM-04):* KHÔNG localize (là dữ liệu nguyên văn khách để lại, không dịch).
- **OQ-05 — Field localized đang có giá trị `null`/empty/thiếu khoá trong DB thực tế.**
  *Assumption (ASM-05):* migration coi mọi giá trị không phải object `{...}` là "bản en gốc":
  `string` → `{en: <string>, vi: ""}`; `null`/`undefined`/thiếu key → `{en: "", vi: ""}`. Đã là object
  hợp lệ (đã migrate) → giữ nguyên (idempotent). Xem RULE-14, EC-01…EC-04.
- **OQ-06 — Rollback migration.** Có cần script rollback đưa `{en,vi}` → `string` (lấy `en`) không, hay
  chỉ cần forward + backup?
  *Assumption (ASM-06):* cung cấp forward script idempotent + hướng dẫn backup cột `value` trước khi
  chạy; viết thêm rollback script (`{en,vi}` → `en`) vì đây là schema dev/test có thể phải chạy lại nhiều lần.

## 3. Key Assumptions (tôi tự quyết từ business logic — user có thể override)

- **ASM-07:** Việc resolve localized phải **duyệt cây metadata** (`uiMeta[configKey]`) song song với giá
  trị, vì field localized có thể **lồng trong array/object** (vd `gallery.images[].title`,
  `why_choose_us.reasons[].desc`, `contact.location.address`, `footer.services[].label`). Không thể chỉ
  xử lý field cấp 1. Đây là điểm cốt lõi của cả migration lẫn service resolve.
- **ASM-08:** Component user-facing **không đổi** với field localized: service trả về string đã resolve
  (giống trước sprint) nên `OurStorySection`, `SectionSubTitle…`, v.v. dùng như cũ. Field non-localized
  (ảnh/số/bool/array title) cũng không đổi.
- **ASM-09:** Admin (`getConfigsByKey` không cache, dùng ở trang settings) trả về **giá trị object đầy
  đủ `{en,vi}`** (KHÔNG resolve) để form nhập được cả 2 bản. Chỉ service **cached user-facing** mới resolve.
- **ASM-10:** `title`/`sub_title` kiểu array (`[{text}]`) KHÔNG localize (hiệu ứng xoay chữ) — kể cả khi
  item con là field `text`. Cờ localized KHÔNG được đặt trên `text` bên trong các array title/sub_title này.
- **ASM-11:** Locale hợp lệ lấy từ `src/i18n/routing.ts` (`en` default, `vi`). Fallback luôn về `en`.
  Nếu `en` cũng rỗng → trả chuỗi rỗng (component tự xử hiển thị trống, không crash).

---

# PART 2 — AGENT REFERENCE

## 4. User Stories + Acceptance Criteria

### Story-01 — (Admin) Nhập nội dung config theo từng ngôn ngữ
> Là **admin**, tôi muốn nhập nội dung của các field hiển thị theo cả EN và VI trong trang settings, để
> website phục vụ đúng ngôn ngữ cho khách.
- **AC-01.1** GIVEN một field metadata có `localized: true` WHEN admin mở trang settings tương ứng THEN
  renderer hiển thị nhóm ô nhập theo từng locale (EN, VI) thay vì 1 ô đơn.
- **AC-01.2** GIVEN admin nhập giá trị EN và VI khác nhau WHEN lưu THEN cột `value` lưu object
  `{ en: <EN>, vi: <VI> }` cho field đó, các field non-localized giữ nguyên kiểu cũ.
- **AC-01.3** GIVEN field `localized: true` là `textarea` WHEN render THEN mỗi locale là 1 textarea
  (không phải input 1 dòng).
- **AC-01.4** GIVEN field KHÔNG có `localized` (ảnh/số/bool/slug/array title) WHEN render THEN hiển thị 1
  ô đơn như trước sprint (không có tab ngôn ngữ).
- **AC-01.5** GIVEN label field đang là tiếng Việt WHEN render nhóm localized THEN label vẫn tiếng Việt
  (chỉ thêm chỉ báo locale EN/VI cho từng ô, không dịch label).

### Story-02 — (Admin) Biết field nào chưa được dịch
> Là **admin**, tôi muốn thấy field nào còn thiếu bản tiếng Việt, để không bỏ sót khi dịch.
- **AC-02.1** GIVEN field `localized: true` có `vi` rỗng/thiếu WHEN render THEN hiển thị badge "chưa dịch"
  gắn với field/ô VI đó.
- **AC-02.2** GIVEN field `localized: true` có cả `en` và `vi` không rỗng WHEN render THEN KHÔNG hiển thị badge.
- **AC-02.3** (tuỳ chọn) GIVEN field localized WHEN admin bấm "Copy từ English" THEN ô `vi` được điền
  bằng giá trị `en` hiện tại (chưa lưu, admin vẫn phải submit).

### Story-03 — (Khách) Xem nội dung theo ngôn ngữ đang chọn
> Là **khách xem web**, tôi muốn nội dung động (hero, our story, gallery, contact, seo…) hiển thị theo
> ngôn ngữ URL đang xem, để đọc bằng ngôn ngữ của mình.
- **AC-03.1** GIVEN đang ở `/vi` và field localized có bản `vi` WHEN trang render THEN hiển thị bản `vi`.
- **AC-03.2** GIVEN đang ở `/vi` và field localized **thiếu** bản `vi` WHEN trang render THEN fallback
  hiển thị bản `en`.
- **AC-03.3** GIVEN đang ở `/en` WHEN trang render THEN hiển thị bản `en`.
- **AC-03.4** GIVEN field non-localized (ảnh/số/bool/array title/slug) WHEN đổi locale THEN giá trị giữ
  nguyên ở mọi locale.
- **AC-03.5** GIVEN field localized nằm trong array/object (vd `gallery.images[].title`) WHEN render ở
  `/vi` THEN từng item được resolve đúng locale (fallback en).
- **AC-03.6** GIVEN component user-facing hiện tại (nhận string) WHEN nhận config đã resolve THEN không
  cần sửa logic component (nhận string như trước).

### Story-04 — (Hệ thống) Migrate dữ liệu hiện có không mất English
> Là **maintainer**, tôi muốn migrate cấu trúc JSON config an toàn, để dữ liệu English hiện tại trở thành
> bản `en` và không mất mát.
- **AC-04.1** GIVEN config `ui` có field localized đang là `"abc"` WHEN chạy migration THEN thành
  `{ en: "abc", vi: "" }`.
- **AC-04.2** GIVEN migration chạy lần 2 trên dữ liệu đã migrate WHEN chạy lại THEN không đổi (idempotent).
- **AC-04.3** GIVEN field non-localized và config `config_type='app'` WHEN chạy migration THEN KHÔNG bị đụng.
- **AC-04.4** GIVEN field localized lồng trong array/object WHEN chạy migration THEN mọi item được migrate
  đúng theo cây metadata.
- **AC-04.5** GIVEN chạy migration THEN chỉ tác động schema `dev_multi_lang` (theo `DB_SCHEMA`).

### Story-05 — (Hệ thống) Cache không phục vụ nhầm ngôn ngữ
> Là **maintainer**, tôi muốn cache user-facing tách theo locale, để `/vi` không nhận bản đã cache của `/en`.
- **AC-05.1** GIVEN service cached config user-facing WHEN gọi với `locale` khác nhau THEN key/tag cache
  khác nhau (chứa `locale`).
- **AC-05.2** GIVEN admin lưu config `key` WHEN revalidate THEN cache của MỌI locale cho `key` đó bị
  invalidate (không sót locale nào).

## 5. Business Rules

```
RULE-01: Cờ `localized?: boolean` được thêm vào metadata field và CHỈ hợp lệ cho field type "text" và
         "textarea". Đặt trên type khác (image/number/boolean/select/object/array) là sai cấu hình.
RULE-02: Giá trị của field `localized: true` lưu dạng object đa ngôn ngữ (ASM-01: LocalizedText =
         Partial<Record<Locale,string>>), KHÔNG còn là string.
RULE-03: Field KHÔNG có `localized` giữ nguyên kiểu giá trị cũ (string/number/boolean/image/array/object).
RULE-04: Locale hợp lệ = danh sách trong src/i18n/routing.ts (hiện: en, vi). defaultLocale = en.
RULE-05: Resolve field localized theo locale L: nếu value[L] tồn tại và khác rỗng → dùng; ngược lại
         fallback value["en"]; nếu en cũng rỗng/thiếu → chuỗi rỗng "".
RULE-06: Service cached user-facing (getUIConfigsByKeyCached / getConfigsByKeyCached) NHẬN thêm tham số
         `locale` và trả config ĐÃ resolve (mọi field localized → string theo RULE-05).
RULE-07: Service admin (getConfigsByKey, không cache) trả nguyên object {en,vi} — KHÔNG resolve.
RULE-08: Cache key user-facing = ["configs", configType, key, locale]; phải chứa locale (RULE tránh
         phục vụ nhầm ngôn ngữ).
RULE-09: Khi admin update 1 config key, phải invalidate cache của TẤT CẢ locale cho key đó (tag theo key
         đã bao trùm mọi locale, hoặc revalidate lặp qua từng locale).
RULE-10: Resolve và migration phải DUYỆT CÂY metadata (uiMeta[configKey]) song song value để tìm field
         localized ở mọi độ sâu (array/object lồng nhau).
RULE-11: Component user-facing KHÔNG tự xử lý i18n cho config; luôn nhận string đã resolve.
RULE-12: Renderer field admin: field localized → render 1 nhóm input cho mỗi locale (tab hoặc cạnh nhau);
         field non-localized → render như cũ. Sửa TẠI MỘT chỗ (SettingField / SettingTextField +
         SettingTextareaField), mọi trang settings tự áp dụng.
RULE-13: KHÔNG dịch label/description admin — giữ tiếng Việt. Chỉ thêm chỉ báo locale (EN/VI) cho ô nhập.
RULE-14: Migration chuyển đổi (theo cây metadata, chỉ tại field localized):
         - string s        → { en: s, vi: "" }
         - null/undefined/thiếu key → { en: "", vi: "" }
         - object đã có {en|vi} → giữ nguyên (idempotent, RULE ASM-05)
RULE-15: Migration KHÔNG được đụng: field non-localized, config_type != 'ui', schema DB (chỉ đổi nội dung
         cột value).
RULE-16: Migration chạy trên schema theo env DB_SCHEMA (dev/test = dev_multi_lang); phải backup value trước.
RULE-17: Badge "chưa dịch" hiển thị khi có ít nhất 1 locale non-default (vd vi) bị rỗng/thiếu ở field localized.
RULE-18: (tuỳ chọn) "Copy từ English" chỉ set giá trị ô vi = en trên form (client), không auto-save.
RULE-19: title/sub_title kiểu array KHÔNG được đánh localized (ASM-10) dù item con là text.
```

### Danh mục field được đánh dấu `localized: true` (RULE-20…RULE-25)

```
RULE-20 [config ui = "homepage"]:
  our_story.content (textarea)
  why_choose_us.description (textarea), why_choose_us.reasons[].title, why_choose_us.reasons[].desc
  gallery.images[].title, gallery.images[].sub_title
  reviews.description (textarea), reviews.below_box.title, reviews.below_box.description (textarea)
  contact.description (textarea), contact.location.address (textarea),
    contact.opening_hours[].title, contact.opening_hours[].items[].label,
    contact.opening_hours[].note (textarea)
  seo.title, seo.description, seo.og_title, seo.og_description
    (seo.keywords[].keyword → localized nếu ASM-03 giữ; hero.title array = KHÔNG, ASM-10)

RULE-21 [config ui = "menu_page"]:
  introduction.description (textarea)
  new_product.description (textarea), new_product.label, new_product.sub_label
  food_categories.categories_to_show[].label, food_categories.categories_to_show[].page_title
  why_choose_us.description, why_choose_us.reasons[].title, why_choose_us.reasons[].desc
  seo.title, seo.description, seo.og_title, seo.og_description (+ keywords[].keyword nếu ASM-03)
  (KHÔNG localize: hero.title array, hero.images, new_product.product_slug (slug!),
   food_categories.categories_to_show[].key)

RULE-22 [config ui = "reservation_page"]:
  booking.description (textarea), booking.reservation_info[].title,
    booking.reservation_info[].items[].text, booking.note (textarea),
    booking.success_title, booking.success_description (textarea)
  seo.title, seo.description, seo.og_title, seo.og_description (+ keywords[].keyword nếu ASM-03)
  (KHÔNG localize: hero.title array, hero.banner, booking.contact.phone/email,
   booking.reservation_info[].items[].type (select), booking.reservation_info[].icon)

RULE-23 [config ui = "layout"]:
  header.welcom_text, header.nav_bar[].label, header.nav_bar[].title
  footer.description, footer.quick_links[].label, footer.quick_links[].title,
    footer.services[].label, footer.contact.address (textarea), footer.opening_hours_title,
    footer.opening_hours[].label
  (KHÔNG localize: header.phone, header.open_daily (ASM-02 — OQ-02), header.nav_bar[].href,
   footer.socials[].*, footer.quick_links[].href, footer.contact.phone/email,
   footer.opening_hours[].value (ASM-02), floating_actions.* toàn bộ)

RULE-24: Field "giờ" (open_daily, opening_hours[].value, header.phone) KHÔNG localize (ASM-02, OQ-02).
RULE-25: Field slug/key/href/icon/URL/email/phone KHÔNG BAO GIỜ localize (dùng chung mọi ngôn ngữ).
```

## 6. Data Entities & Constraints

> Đây là thay đổi **CẤU TRÚC JSON trong cột `value`**, KHÔNG đổi schema bảng DB.

- **Bảng `configs`** (`src/db/schemas/configs.ts`) — KHÔNG đổi.
  - `key` (text), `config_type` (text; PK kép = key + config_type), `value` (jsonb `$type<Config>`),
    `updatedAt`.
  - Chỉ bản ghi `config_type='ui'` bị migrate (hiện có 4 key: `homepage`, `layout`, `menu_page`,
    `reservation_page` — nguồn `src/constants/settings/ui/index.ts`).
- **Kiểu `Config` / `ConfigValue` / `Value`** (`src/types/configs.ts`) — CẦN cập nhật.
  - Thêm `export type Locale = ...` (nên import/đồng bộ từ i18n routing) hoặc dùng `string`.
  - Thêm `export type LocalizedText = Partial<Record<Locale, string>>` (ASM-01).
  - `TextValue` cho field localized chuyển từ `string` → `string | LocalizedText` (union để type vẫn phủ
    cả field non-localized). Ràng buộc localized chỉ đảm bảo qua metadata + migration, không qua type
    ép buộc (vì value là jsonb runtime).
- **Kiểu `FieldType`** (`src/types/settings.ts`) — CẦN cập nhật.
  - Thêm `localized?: boolean` vào `TextField` và `TextareaField` (KHÔNG thêm vào các field type khác)
    hoặc thêm vào `CommonField` nhưng chỉ đọc/áp dụng ở nhánh text/textarea (RULE-01).
- **`LocalizedText` constraints:**
  - Khoá hợp lệ = tập locale từ routing (RULE-04).
  - Bản `en` là fallback bắt buộc về mặt logic (có thể rỗng nhưng luôn ưu tiên đọc khi thiếu locale khác).
  - Không ràng buộc unique/format.

## 7. Edge Cases Registry

```
EC-01 [RULE-14]: value localized đang là string "abc" → migrate { en:"abc", vi:"" }.
EC-02 [RULE-14]: value localized đang là null/undefined/thiếu key → { en:"", vi:"" } (không crash).
EC-03 [RULE-14]: value localized đã là object {en,vi} (đã migrate) → giữ nguyên (idempotent).
EC-04 [RULE-14]: value localized là object bất thường (vd {en:"x"} thiếu vi) → bổ sung vi:"" ; giữ en.
EC-05 [RULE-05]: đọc /vi nhưng vi rỗng → fallback en.
EC-06 [RULE-05]: đọc /vi, cả vi lẫn en rỗng → trả "" (component render trống, không lỗi).
EC-07 [RULE-10]: field localized nằm trong array rỗng (vd reviews_list: []) → không lỗi, bỏ qua.
EC-08 [RULE-10]: array trong DB dài/ngắn khác metadata (item thừa/thiếu) → duyệt theo từng item thực có,
                 không dựa vào index cố định của metadata.
EC-09 [RULE-15]: config_type='app' có field tên trùng (vd "description") → KHÔNG migrate (chỉ ui).
EC-10 [RULE-19]: hero.title là array [{text}] → KHÔNG bị nhận nhầm là localized, giữ nguyên array.
EC-11 [RULE-09]: sau khi admin lưu, /en và /vi đều phải phản ánh nội dung mới (không sót cache locale nào).
EC-12 [RULE-06]: config key tồn tại nhưng thiếu 1 section (vd homepage thiếu "reviews") → resolve trả
                 undefined cho section đó, component xử lý optional như hiện tại (page.tsx dùng ?.).
EC-13 [RULE-12]: admin đang xem form 1 field localized nhưng DB vẫn là string cũ (chưa migrate) →
                 renderer phải chịu được value string (coi như en) để không vỡ form trước khi migrate chạy.
EC-14 [RULE-02]: admin để trống cả en lẫn vi ở field isRequired → validation form báo lỗi như field text
                 thường (ít nhất bản en/bản mặc định phải có nếu isRequired).
EC-15 [RULE-18]: "Copy từ English" khi en rỗng → copy chuỗi rỗng (no-op hợp lệ), không lỗi.
```

## 8. Integration Touchpoints

- **next-intl (sprint-1)** — nguồn locale hiện hành:
  - Server component/page user-facing lấy locale qua `getLocale()` (next-intl/server) hoặc param
    `[locale]` để truyền vào `getUIConfigsByKeyCached(key, locale)`.
  - Danh sách locale + default lấy từ `src/i18n/routing.ts` (không hardcode).
- **Service layer** (`src/services/configs.ts`, `src/services/cached/configs.ts`):
  - `getConfigsByKey` (admin, không cache) giữ nguyên hành vi (trả object đầy đủ).
  - `getConfigsByKeyCached`/`getUIConfigsByKeyCached` nhận `locale`, resolve trước khi trả (RULE-06).
  - Cần helper resolve dùng chung: `resolveLocalizedConfig(value, metaFields, locale)` duyệt cây metadata
    (RULE-10). metaFields lấy từ `uiMeta[key]` (`src/constants/settings/ui/index.ts`).
- **Cache/Revalidate** (`src/lib/cache.ts`, `src/lib/revalidate.ts`, `src/constants/cache/tags.ts`):
  - `createDynamicCachedFunction`: getKeyParts thêm `locale`; getTags giữ `CONFIGS.BY_KEY(key)` (tag theo
    key không kèm locale → 1 lần revalidate xoá mọi locale) HOẶC thêm tag per-locale rồi revalidate lặp.
    Ưu tiên: tag theo key (đơn giản, thoả RULE-09/EC-11).
- **Caller user-facing** cần truyền locale:
  - `src/app/(web)/[locale]/page.tsx` (homepage: hero, our_story, why_choose_us, gallery, reviews, contact, seo/metadata)
  - `src/app/(web)/[locale]/layout.tsx` (layout: header/footer/floating_actions)
  - `src/app/(web)/[locale]/menu/[category]/page.tsx` (menu_page)
  - `src/app/(web)/[locale]/reservation/page.tsx` (reservation_page)
- **Admin form** (`src/components/admin/features/settings/*`):
  - `SettingField.tsx` (router theo type) + `SettingTextField.tsx` + `SettingTextareaField.tsx` +
    element inputs. `localized` chảy qua `omit(item,"type","key")` → tới field component (chú ý: cần cho
    `localized` đi vào props, tránh bị spread lung tung xuống DOM).
  - Save flow: `SettingEditor` → `useUpdateConfigs` → `updateConfigByKey` (giữ nguyên, chỉ lưu object).
  - **Error cases:** value string cũ chưa migrate (EC-13); react-hook-form path cho nested localized
    (`name.en`, `name.vi`) phải khớp cấu trúc lưu.

## 9. Non-functional Requirements (NFR)

```
NFR-01 (Perf): Resolve config theo locale chạy 1 lần/request/config, độ phức tạp O(số node trong value);
               không thêm truy vấn DB (resolve in-memory sau khi fetch). Không tăng số DB round-trip.
NFR-02 (Perf/Cache): Cache user-facing per-locale không làm bùng nổ key (2 locale × 4 ui key = 8 entry);
               revalidate 1 key xoá mọi locale (RULE-09).
NFR-03 (Data safety): Migration idempotent + có backup + giữ nguyên 100% dữ liệu English hiện tại (RULE-14).
NFR-04 (Compat): Component user-facing hiện tại không phải sửa để chạy đúng (RULE-11, AC-03.6).
NFR-05 (Maintainability): Thêm locale thứ 3 chỉ cần sửa routing + chạy migration bổ sung; KHÔNG sửa type,
               service, renderer (kiến trúc locale-agnostic, ASM-01).
NFR-06 (Admin UX): Không dịch label admin (RULE-13); phân biệt rõ ô EN/VI; badge "chưa dịch" dễ thấy.
NFR-07 (Robustness): Mọi edge case value bất thường (null/string/object thiếu key) không được crash render
               user hay form admin (EC-02, EC-06, EC-13).
```

## 10. Regression Impact (thêm feature vào codebase có sẵn)

Các điểm dùng chung có thể ảnh hưởng — phải KHÔNG làm hỏng:

- **`src/types/configs.ts` / `src/types/settings.ts`** — dùng bởi TẤT CẢ config (app + ui) và toàn bộ form
  settings. *Must not break:* config `app` (order/restaurant/reservation) và các field non-localized phải
  compile + hoạt động y như cũ. Đổi `TextValue` thành union không được làm vỡ type ở nơi đang dùng string.
- **`src/services/configs.ts`** — `getConfigsByKey` dùng ở cả admin lẫn (gián tiếp) cached. *Must not break:*
  chữ ký admin không đổi; trang settings vẫn load/save mọi config (app + ui).
- **`src/services/cached/configs.ts`** — dùng ở 4 trang web user + layout + generateMetadata. *Must not break:*
  đổi chữ ký thêm `locale` phải cập nhật MỌI caller (page.tsx, layout.tsx, menu, reservation) — nếu bỏ sót
  sẽ vỡ build hoặc phục vụ sai. Config `app` cached (nếu có) không được yêu cầu locale bắt buộc gây lỗi.
- **Renderer field admin (`SettingField` + text/textarea)** — dùng cho MỌI trang settings (ui + app). *Must
  not break:* field non-localized và toàn bộ form config `app` render + submit đúng như trước; chỉ field có
  `localized: true` đổi cách render.
- **Cache tag `CONFIGS.BY_KEY` + `revalidate.ts`** — revalidate config sau khi admin lưu. *Must not break:*
  lưu config bất kỳ vẫn làm mới trang user tương ứng (mọi locale).
- **Dữ liệu DB schema `dev_multi_lang`** — migration đụng cột `value` của 4 config ui. *Must not break:*
  config `app` và field non-localized không đổi; English hiện tại giữ nguyên; web user vẫn hiển thị đúng
  sau migration (regression happy path: mở `/en` homepage/menu/reservation, mọi section hiển thị như trước).

**Regression happy path cho qa-guard:**
1. Admin mở & lưu 1 config `app` (vd order settings) → vẫn load/save bình thường.
2. `/en` homepage, menu, reservation render đầy đủ mọi section (không mất nội dung sau migration).
3. Admin mở trang settings homepage → field non-localized (ảnh/số/array title) render + save như cũ.

## 11. Definition of Done

- [ ] `FieldType` có `localized?: boolean` chỉ áp text/textarea (RULE-01); `configs.ts` có `LocalizedText`.
- [ ] Các field theo RULE-20…RULE-23 được đánh dấu `localized: true` (kể cả nested), field non-localized và
      title/sub_title array KHÔNG bị đánh dấu.
- [ ] Migration JSON idempotent chạy trên `dev_multi_lang`: mọi field localized (mọi độ sâu) của 4 config
      ui → `{en:<gốc>, vi:""}`; English giữ nguyên; app + non-localized không đụng; có backup + (rollback).
- [ ] Renderer field admin sửa 1 chỗ: field localized render nhóm ô EN/VI; badge "chưa dịch"; label giữ
      tiếng Việt; (tuỳ chọn) nút Copy từ English. Field non-localized + form app không đổi.
- [ ] Service cached user-facing nhận `locale`, resolve theo cây metadata + fallback en; admin service trả
      object đầy đủ. Mọi caller (4 trang web + layout + metadata) truyền locale đúng.
- [ ] Cache key user-facing chứa `locale`; revalidate sau khi admin lưu làm mới mọi locale.
- [ ] AC-01..AC-05 pass; EC-01..EC-15 xử lý đúng; không crash với value bất thường.
- [ ] NFR-01..NFR-07 thoả; Regression happy path (mục 10) pass; không dịch admin UI; không đụng entity DB
      và config app.
```
