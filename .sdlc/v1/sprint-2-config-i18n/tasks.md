# Tasks — sprint-2-config-i18n (i18n cho UI config động)

> Input: `design.md`, `ui-design.md`, `requirements.md`, `.sdlc/architecture.md`
> Verify: `tsc --noEmit` + `next build` (eslint repo hỏng sẵn — KHÔNG dùng để gate).
> Migration chạy trên `DB_SCHEMA=dev_multi_lang`.

## Thứ tự bắt buộc (design R-01)
Type nền tảng → (helper traversal ∥ đánh dấu metadata) → migration (SAU khi metadata xong) + service resolve
→ call-site + renderer. Bỏ sót call-site hoặc đánh thiếu metadata trước migration = vỡ build / mất dữ liệu.

## Waves (gợi ý cho execute — task cùng wave chạy song song được)
- **Wave 1:** TASK-01
- **Wave 2 (∥):** TASK-02, TASK-03, TASK-04, TASK-05, TASK-06
- **Wave 3 (∥):** TASK-07, TASK-08, TASK-10, TASK-11
- **Wave 4 (∥):** TASK-09, TASK-12

---

- [x] TASK-01  (done)
  Description: Type nền tảng. Trong `src/types/configs.ts` thêm `Locale = (typeof routing.locales)[number]`,
    `LocalizedText = Partial<Record<Locale,string>>`, đổi `TextValue = string | LocalizedText` (union — giữ
    `NumberValue/BooleanValue/ImageValue/ObjectValue/ArrayValue/Value/ConfigValue/Config` NGUYÊN). Trong
    `src/types/settings.ts` thêm `localized?: boolean` CHỈ vào `TextField` và `TextareaField` (KHÔNG thêm
    vào field type khác — RULE-01). Đây là bước nền, mọi task khác phụ thuộc.
  Serves: RULE-01, RULE-02, RULE-03, RULE-04, NFR-05 (nền), Data Entities §6
  Design ref: design §5.2, §5.3, §10; architecture "Config i18n"
  Expected files: src/types/configs.ts, src/types/settings.ts
  Dependencies: none
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` compile sạch; `TextValue` union không vỡ chỗ đang dùng string (app + non-localized).

- [x] TASK-02  (done)
  Description: Helper traversal dùng chung `src/lib/localized-config.ts` (pure, KHÔNG `server-only`, để cả
    script tsx lẫn service import được). Export: `isLocalizedField(field)` (`(type==='text'||'textarea') &&
    localized===true`), `normalizeLocalized(v)` (string→`{[default]:v}`, null/undefined→`{}`, object→giữ),
    `resolveLocalizedString(v, locale)` (RULE-05: locale non-empty → dùng; else default; else `""`),
    `resolveFields(obj, fields, locale)` + `resolveConfig(value, sections, locale)` (duyệt object.fields &
    array.itemType.fields theo item THỰC CÓ trong value — thuật toán design §5.4), `migrateLocalized(v)`
    (seed đủ `routing.locales`, idempotent), `migrateFields`/`migrateConfig`. Nên gộp core walk thành
    `walkFields(obj, fields, transformLeaf)` để resolve/migrate chung một cơ chế.
  Serves: AC-03.1, AC-03.2, AC-03.3, AC-03.4, AC-03.5, AC-04.1, AC-04.2, AC-04.3, AC-04.4, EC-01, EC-02,
    EC-03, EC-04, EC-05, EC-06, EC-07, EC-08, EC-10, EC-12, RULE-05, RULE-10, RULE-14, NFR-05, NFR-07
  Design ref: design §4.1, §5.4; requirements §8 (helper resolveLocalizedConfig)
  Expected files: src/lib/localized-config.ts
  Dependencies: TASK-01
  Suggested skill:
  Difficulty: normal
  Test: unit test thuần (tsx/node) cho resolve (fallback en, cả hai rỗng→"", nested array/object, array rỗng,
    array lệch meta, section thiếu) + migrate (string, null, object đủ, object thiếu vi, idempotent).

- [x] TASK-03  (done)
  Description: Đánh `localized: true` cho metadata config `homepage`. Chỉ THÊM `localized: true` vào object
    field (kể cả field trong `itemType.fields` của array); KHÔNG đổi `newItem`/init value.
    - `our-story.ts`: `content`
    - `why-choose-us.ts`: `description`, `reasons[].title`, `reasons[].desc`
    - `gallery.ts`: `images[].title`, `images[].sub_title` (KHÔNG: `title`/`sub_title` array, `images[].image`, `autoplay`)
    - `reviews.ts`: `description`, `below_box.title`, `below_box.description` (KHÔNG: `reviews_list[].*`)
    - `contact.ts`: `description`, `location.address`, `opening_hours[].title`, `opening_hours[].items[].label`,
      `opening_hours[].note` (KHÔNG: `opening_hours[].items[].value` — giờ)
    - `seo.ts`: `title`, `description`, `og_title`, `og_description`, `keywords[].keyword` (KHÔNG: `og_image`)
  Serves: AC-01.1(data), AC-03.5, EC-10, RULE-19, RULE-20, RULE-24, RULE-25
  Design ref: design §5.5 (bảng homepage)
  Expected files: src/constants/settings/ui/homepage/{our-story,why-choose-us,gallery,reviews,contact,seo}.ts
  Dependencies: TASK-01
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; grep xác nhận `localized: true` đúng field, KHÔNG có trên field/title array bị loại trừ.

- [x] TASK-04  (done)
  Description: Đánh `localized: true` cho metadata config `menu_page` (chỉ thêm cờ, không đổi newItem).
    - `introduction.ts`: `description`
    - `new-product.ts`: `description`, `label`, `sub_label` (KHÔNG: `product_slug` — slug)
    - `food-categories.ts`: `categories_to_show[].label`, `categories_to_show[].page_title` (KHÔNG: `[].key`)
    - `why-choose-us.ts`: `description`, `reasons[].title`, `reasons[].desc`
    - `seo.ts`: `title`, `description`, `og_title`, `og_description`, `keywords[].keyword`
    - `hero.ts`: KHÔNG (title array, images)
  Serves: AC-01.1(data), AC-03.5, RULE-21, RULE-25
  Design ref: design §5.5 (bảng menu_page)
  Expected files: src/constants/settings/ui/menu-page/{introduction,new-product,food-categories,why-choose-us,seo}.ts
  Dependencies: TASK-01
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; grep xác nhận cờ đúng field, KHÔNG trên slug/key/hero.

- [x] TASK-05  (done)
  Description: Đánh `localized: true` cho metadata config `reservation_page` (chỉ thêm cờ).
    - `booking.ts`: `description`, `reservation_info[].title`, `reservation_info[].items[].text`, `note`,
      `success_title`, `success_description` (KHÔNG: `contact.phone/email`, `reservation_info[].items[].type`
      select, `reservation_info[].icon`)
    - `seo.ts`: `title`, `description`, `og_title`, `og_description`, `keywords[].keyword`
    - `hero.ts`: KHÔNG (title array, banner)
  Serves: AC-01.1(data), AC-03.5, RULE-22, RULE-25
  Design ref: design §5.5 (bảng reservation_page)
  Expected files: src/constants/settings/ui/reservation-page/{booking,seo}.ts
  Dependencies: TASK-01
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; grep xác nhận cờ đúng field, KHÔNG trên select/icon/phone/email.

- [x] TASK-06  (done)
  Description: Đánh `localized: true` cho metadata config `layout` (chỉ thêm cờ).
    - `header.ts`: `welcom_text`, `nav_bar[].label`, `nav_bar[].title` (KHÔNG: `phone`, `open_daily`, `nav_bar[].href`)
    - `footer.ts`: `description`, `quick_links[].label`, `quick_links[].title`, `services[].label`,
      `contact.address`, `opening_hours_title`, `opening_hours[].label` (KHÔNG: `socials[].*`,
      `quick_links[].href`, `contact.phone/email`, `opening_hours[].value` — giờ)
    - `floating-actions.ts`: KHÔNG (toàn bộ)
  Serves: AC-01.1(data), AC-03.5, RULE-23, RULE-24, RULE-25
  Design ref: design §5.5 (bảng layout)
  Expected files: src/constants/settings/ui/layout/{header,footer}.ts
  Dependencies: TASK-01
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; grep xác nhận cờ đúng field, KHÔNG trên href/phone/email/giờ/socials.

- [x] TASK-07  (done)
  Description: Migration + rollback. `scripts/migrate-configs-i18n.ts` (tsx standalone): load `.env`/`.env.local`
    qua dotenv, tự tạo `postgres` client từ `DATABASE_URL`, dùng `DB_SCHEMA` (mặc định cảnh báo nếu không set),
    SELECT 4 config `config_type='ui'` (`homepage`,`layout`,`menu_page`,`reservation_page`), ghi backup value
    ra `scripts/backups/configs-ui-<ts>.json` TRƯỚC khi update, rồi với mỗi config gọi
    `migrateConfig(value, uiMeta[key])` (import từ TASK-02 + `uiMeta` từ `src/constants/settings/ui/index.ts`)
    và UPDATE cột `value`. Idempotent (chạy lại không đổi). KHÔNG import `getDb()` (server-only). Chỉ query
    `config_type='ui'`. `scripts/rollback-configs-i18n.ts` đưa mỗi field localized `{en,vi}`→`en` (dùng helper).
    Thêm `.gitignore` cho `scripts/backups/` nếu cần. Thêm script `migrate:configs-i18n` & `rollback:configs-i18n`
    vào `package.json` (set `DB_SCHEMA` khi chạy).
  Serves: AC-04.1, AC-04.2, AC-04.3, AC-04.4, AC-04.5, EC-01, EC-02, EC-03, EC-04, EC-09, RULE-14, RULE-15,
    RULE-16, NFR-03
  Design ref: design §4 (luồng migration), §11 (File Change Plan), TD-03, R-01, R-02
  Expected files: scripts/migrate-configs-i18n.ts, scripts/rollback-configs-i18n.ts, scripts/.gitignore, package.json
  Dependencies: TASK-02, TASK-03, TASK-04, TASK-05, TASK-06 (metadata PHẢI xong trước — R-01)
  Suggested skill:
  Difficulty: normal
  Test: chạy `DB_SCHEMA=dev_multi_lang npm run migrate:configs-i18n` trên schema dev; verify field localized
    thành `{en,vi}`, `en` giữ nguyên English cũ, chạy lần 2 không đổi (idempotent), config `app` không đụng;
    kiểm tra file backup được tạo. Rollback khôi phục `en`.

- [x] TASK-08  (done)
  Description: Service resolve theo locale. Trong `src/services/cached/configs.ts` đổi `getUIConfigsByKeyCached`
    thành `(key, locale: Locale)`: fetch config (qua cached base, keyParts thêm `locale` =
    `["configs","ui",key,locale]`, tag GIỮ `CACHE_TAGS.CONFIGS.BY_KEY(key)` KHÔNG kèm locale), rồi
    `resolveConfig(value, uiMeta[key], locale)` in-memory và trả `{...config, value: resolved}`. KHÔNG thêm
    DB round-trip. `getConfigsByKeyCached`/`getAppConfigsByKeyCached` GIỮ NGUYÊN chữ ký (deviation §6.3 —
    app không localize). `getConfigsByKey` (admin) KHÔNG đổi.
  Serves: AC-03.1, AC-03.2, AC-03.3, AC-03.4, AC-03.6, AC-05.1, AC-05.2, EC-05, EC-06, EC-11, EC-12,
    RULE-06, RULE-07, RULE-08, RULE-09, NFR-01, NFR-02, NFR-04
  Design ref: design §6.1, §6.2, §6.3; requirements §8 (Cache/Revalidate)
  Expected files: src/services/cached/configs.ts
  Dependencies: TASK-02
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; unit/smoke: gọi với `en`/`vi` trả string đã resolve khác nhau, cache key khác theo
    locale, tag theo key. (Build gate cùng TASK-09.)

- [x] TASK-09  (done)
  Description: Cập nhật ĐỦ 8 call-site UI truyền `locale` cho `getUIConfigsByKeyCached`. Component nhận string
    như cũ (KHÔNG sửa component user).
    - `src/app/(web)/[locale]/page.tsx` ×2: `generateMetadata` (thêm/đọc `params.locale`) + `HomePage` (locale từ `params`)
    - `src/app/(web)/[locale]/menu/[category]/page.tsx` ×2: `generateMetadata` + `page` (đọc `locale` từ params)
    - `src/app/(web)/[locale]/reservation/page.tsx` ×2: `generateMetadata` (thêm `params`) + `page`
    - `src/app/(web)/[locale]/layout.tsx` ×1: đã có `locale` sẵn
    - `src/app/sitemap.ts` ×1 (root, KHÔNG có `[locale]`): truyền `routing.defaultLocale` (chỉ đọc field
      non-localized `food_categories[].key`)
  Serves: AC-03.6, NFR-04, RULE-11; R-03 (bỏ sót = vỡ build)
  Design ref: design §11 (Call-site UI), TD-04, R-03
  Expected files: src/app/(web)/[locale]/page.tsx, src/app/(web)/[locale]/menu/[category]/page.tsx,
    src/app/(web)/[locale]/reservation/page.tsx, src/app/(web)/[locale]/layout.tsx, src/app/sitemap.ts
  Dependencies: TASK-08
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` + `next build` sạch (không còn call-site thiếu arg locale); `/en` & `/vi` render.

- [x] TASK-10  (done)
  Description: Validation zod localized. Trong `src/validations/settings.ts` thêm
    `localizedTextSchema({ isRequired, variant })`: `z.preprocess(normalizeLocalized → object)` rồi `z.object`
    các locale key optional `string` (variant `text` áp `.max(255)`); refine: nếu `isRequired` → `en` (default)
    non-empty ("Nội dung không được để trống"). Coerce string cũ chưa migrate → không vỡ (EC-13). Trong
    `src/lib/zod.ts` `generateSettingFieldSchema`: nhánh `text`/`textarea` → nếu `item.localized` trả
    `localizedTextSchema`, else giữ hành vi cũ.
  Serves: AC-01.2(shape validate), EC-13, EC-14, RULE-02, NFR-07, DAC-08
  Design ref: design §7.3, TD-06
  Expected files: src/validations/settings.ts, src/lib/zod.ts
  Dependencies: TASK-01, TASK-02
  Suggested skill:
  Difficulty: normal
  Test: unit: object {en,vi} hợp lệ; isRequired + en rỗng → lỗi; string cũ preprocess → không throw;
    text >255 mỗi locale → lỗi max.

- [x] TASK-11  (done)
  Description: Component `src/components/admin/features/settings/elements/LocalizedFieldInput.tsx` (`"use client"`).
    Props: `control, name, variant:"text"|"textarea", label?, withLabel?, isRequired?, placeholder?, disabled?`.
    Render tab strip `role="tablist"` `tabs tabs-box tabs-xs` map theo `routing.locales` (defaultLocale trước),
    nhãn tab từ map `{en:"Tiếng Anh",vi:"Tiếng Việt"}` fallback `locale.toUpperCase()`. Mỗi locale 1 `Controller`
    tại `${name}.${locale}`, nội dung tab = `SettingsTextInput` (text) / `SettingsTextareaInput` (textarea, rows=5).
    Chuẩn hoá value qua `normalizeLocalized` (EC-13 string cũ → hiển thị tab default). Badge `badge badge-warning
    badge-xs` "Chưa dịch" trên tab locale non-default rỗng (ẩn khi đã điền). Nút `Copy từ English`
    (`btn btn-ghost btn-xs`) chỉ hiện khi tab non-default active & rỗng → set ô = `en` hiện tại (client, no-save;
    en rỗng → copy "" no-op). Label giữ VI. Chỉ dùng class daisyui (no hex/inline style); responsive 360px; giữ
    focus ring. KHÔNG leak prop lạ xuống DOM.
  Serves: AC-01.1, AC-01.2, AC-01.3, AC-01.5, AC-02.1, AC-02.2, AC-02.3, EC-13, EC-15, RULE-12, RULE-13,
    RULE-17, RULE-18, NFR-05, NFR-06, NFR-07, DAC-01, DAC-02, DAC-04, DAC-05, DAC-06, DAC-07, DAC-09,
    DAC-10, DAC-11, DAC-12, DAC-13
  Design ref: ui-design.md (Component spec, States, DAC); design §7.1, §7.2
  Expected files: src/components/admin/features/settings/elements/LocalizedFieldInput.tsx
  Dependencies: TASK-01, TASK-02
  Suggested skill:
  Difficulty: normal
  Test: render text field → count tabs === routing.locales.length; textarea → <textarea>; vi rỗng → badge
    "Chưa dịch"; đủ 2 locale → không badge; Copy từ English set vi=en không gọi network; string cũ không throw;
    grep không có hex/inline style.

- [x] TASK-12  (done)
  Description: Wiring renderer (sửa 1 chỗ — RULE-12). `SettingTextField.tsx`: nếu `localized` truthy → render
    `LocalizedFieldInput variant="text"` (truyền control, name, label, withLabel, isRequired, placeholder);
    else render như cũ. Tương tự `SettingTextareaField.tsx` với `variant="textarea"`. PHẢI destructure
    `localized` ra khỏi `...props` để KHÔNG spread xuống DOM input (R-04). Field non-localized và form config
    `app` render/submit y như cũ. `SettingField.tsx` router KHÔNG đổi.
  Serves: AC-01.1, AC-01.3, AC-01.4, AC-01.5, DAC-03, DAC-08, RULE-12, R-04 (DOM leak)
  Design ref: design §7.1, §10; ui-design.md (Reuse map, Non-localized unchanged)
  Expected files: src/components/admin/features/settings/fields/SettingTextField.tsx,
    src/components/admin/features/settings/fields/SettingTextareaField.tsx
  Dependencies: TASK-10, TASK-11
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` + `next build`; field localized → tab strip; field non-localized → 1 ô, no tablist,
    no attribute `localized` trên DOM; form config `app` không đổi.

---

## Coverage — AC / EC / NFR / DAC → task

| ID | Task(s) |
|---|---|
| AC-01.1 | TASK-03/04/05/06 (data), TASK-11, TASK-12 |
| AC-01.2 | TASK-10, TASK-11 |
| AC-01.3 | TASK-11, TASK-12 |
| AC-01.4 | TASK-12 |
| AC-01.5 | TASK-11, TASK-12 |
| AC-02.1 | TASK-11 |
| AC-02.2 | TASK-11 |
| AC-02.3 | TASK-11 |
| AC-03.1 | TASK-02, TASK-08 |
| AC-03.2 | TASK-02, TASK-08 |
| AC-03.3 | TASK-02, TASK-08 |
| AC-03.4 | TASK-02, TASK-08 |
| AC-03.5 | TASK-02, TASK-03/04/05/06 |
| AC-03.6 | TASK-08, TASK-09 |
| AC-04.1 | TASK-02, TASK-07 |
| AC-04.2 | TASK-02, TASK-07 |
| AC-04.3 | TASK-02, TASK-07 |
| AC-04.4 | TASK-02, TASK-07 |
| AC-04.5 | TASK-07 |
| AC-05.1 | TASK-08 |
| AC-05.2 | TASK-08 |
| EC-01 | TASK-02, TASK-07 |
| EC-02 | TASK-02, TASK-07 |
| EC-03 | TASK-02, TASK-07 |
| EC-04 | TASK-02, TASK-07 |
| EC-05 | TASK-02, TASK-08 |
| EC-06 | TASK-02, TASK-08 |
| EC-07 | TASK-02 |
| EC-08 | TASK-02 |
| EC-09 | TASK-07 |
| EC-10 | TASK-03, TASK-02 |
| EC-11 | TASK-08 |
| EC-12 | TASK-02, TASK-08 |
| EC-13 | TASK-10, TASK-11 |
| EC-14 | TASK-10 |
| EC-15 | TASK-11 |
| NFR-01 | TASK-08 |
| NFR-02 | TASK-08 |
| NFR-03 | TASK-07 |
| NFR-04 | TASK-08, TASK-09 |
| NFR-05 | TASK-01, TASK-02, TASK-11 |
| NFR-06 | TASK-11 |
| NFR-07 | TASK-02, TASK-10, TASK-11 |
| DAC-01 | TASK-11 |
| DAC-02 | TASK-11 |
| DAC-03 | TASK-12 |
| DAC-04 | TASK-11, TASK-12 |
| DAC-05 | TASK-11 |
| DAC-06 | TASK-11 |
| DAC-07 | TASK-11 |
| DAC-08 | TASK-10, TASK-12 |
| DAC-09 | TASK-11 |
| DAC-10 | TASK-11 |
| DAC-11 | TASK-11 |
| DAC-12 | TASK-11 |
| DAC-13 | TASK-11 |

## Regression happy path (qa-guard — requirements §10)
1. Admin mở & lưu config `app` (order settings) → load/save bình thường (TASK-08 giữ nguyên app; TASK-12 non-localized).
2. `/en` homepage/menu/reservation render đủ section sau migrate (TASK-07, TASK-08, TASK-09).
3. Admin form homepage field non-localized (ảnh/số/array title) render + save như cũ (TASK-12).

## Self-review
- Mọi AC-01..05, EC-01..15, NFR-01..07, DAC-01..13 có ≥1 task sở hữu (bảng trên). ✔
- Task song song đánh dấu theo Wave; phụ thuộc đúng thứ tự R-01 (metadata trước migration). ✔
- Mỗi task có tiêu chí test rõ. ✔
- Không task nào `high`: mọi task là mở rộng type/metadata/traversal/glue script/UI theo pattern có sẵn,
  logic khó (traversal, migrate idempotent) tập trung ở TASK-02 và được unit-test trực tiếp → không thuộc
  nhóm cần Opus-first. ✔
