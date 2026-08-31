# Design — sprint-2-config-i18n (Loại B: i18n cho UI config động)

> Project: Talo Kitchen | Next.js 16 App Router + RSC, TypeScript, Drizzle/Postgres | next-intl (sprint-1)
> Input: `.sdlc/v1/sprint-2-config-i18n/requirements.md`, `.sdlc/architecture.md`

---

# PART 1 — HUMAN REVIEW

## 1. Design Overview

Mục tiêu: localize nội dung động trong bảng `configs` (`config_type='ui'`) theo locale (`en`/`vi`), fallback
`en`, kiến trúc locale-agnostic. Các quyết định chính:

- **Metadata là nguồn chân lý, KHÔNG dựa type.** Value trong cột `value` là `jsonb` runtime; TypeScript
  union không ép buộc được field nào localized. Vì vậy cờ `localized: true` trong `uiMeta[key]`
  (`src/constants/settings/ui/*`) quyết định TẤT CẢ: migration, service resolve, renderer đều đọc metadata.
- **Một traversal đệ quy dùng chung** (`src/lib/localized-config.ts`) duyệt cây metadata SONG SONG với value,
  xử lý field localized ở mọi độ sâu (array/object lồng nhau). Cả migration lẫn service resolve gọi cùng bộ
  helper → không lệch logic.
- **Resolve chỉ ở service cached user-facing của UI.** `getUIConfigsByKeyCached(key, locale)` fetch rồi
  resolve in-memory (không thêm DB round-trip), trả string đã resolve → component user KHÔNG đổi. Admin
  service (`getConfigsByKey`, không cache) trả object `{en,vi}` nguyên vẹn để form nhập 2 bản.
- **Cache per-locale.** Key UI thêm `locale`; tag giữ `CONFIGS.BY_KEY(key)` (không kèm locale) → 1 lần
  revalidate xoá mọi locale (RULE-09).
- **Renderer admin sửa tại 1 chỗ.** `SettingTextField`/`SettingTextareaField` thêm nhánh `localized` → render
  nhóm ô nhập theo từng locale + badge "chưa dịch". Field non-localized và form config `app` không đổi.
- **Migration JSON idempotent** (script `tsx`, chạy schema theo `DB_SCHEMA=dev_multi_lang`): chỉ đổi nội dung
  cột `value` của 4 config `ui`; string→`{en:s, vi:""}`; null/empty→`{en:"",vi:""}`; đã object→giữ. Backup
  trước + rollback script.

## 2. Tech Decisions (user cần biết / có thể override)

- **TD-01 `LocalizedText = Partial<Record<Locale,string>>`** (ASM-01, OQ-01), `Locale` suy từ
  `routing.locales`. `TextValue = string | LocalizedText` (union — field non-localized giữ `string`). Đây là
  quyết định nền tảng, đã ghi vào `architecture.md`.
- **TD-02 Traversal dùng chung** đặt ở `src/lib/localized-config.ts` (pure, không `server-only`) để cả script
  `tsx` lẫn service import được.
- **TD-03 Migration bằng script `tsx` standalone**, tự tạo `postgres` client đọc `DATABASE_URL`/`DB_SCHEMA`
  qua `dotenv` (KHÔNG import `getDb()` vì `getDb`→`getEnv`→`server-only` sẽ vỡ ngoài Next runtime). Chạy SQL
  thô `SELECT/UPDATE <schema>.configs`. Tự ghi backup JSON trước khi update.
- **TD-04 `getUIConfigsByKeyCached` ĐỔI CHỮ KÝ** thành `(key, locale)`. `getConfigsByKeyCached`/
  `getAppConfigsByKeyCached` GIỮ NGUYÊN (app không cần locale). Tất cả **8 call-site UI** phải cập nhật
  (7 dưới `[locale]` + `src/app/sitemap.ts` ở root — truyền `routing.defaultLocale`, xem §11).
- **TD-05 SEO keywords[].keyword CÓ localize** (ASM-03, OQ-03). `title`/`sub_title` array KHÔNG localize
  (ASM-10). Field giờ (`open_daily`, `opening_hours[].value`) KHÔNG localize (ASM-02, OQ-02).
- **TD-06 Zod schema localized**: field text/textarea `localized` validate object đa-locale; `isRequired` yêu
  cầu bản default (`en`) non-empty; `.max(255)` áp cho text mỗi locale. Dùng `z.preprocess` coerce string cũ
  (chưa migrate) → object để không vỡ form (EC-13/EC-14).

## 3. Risks / Trade-offs

- **R-01 (migration) THỨ TỰ BẮT BUỘC:** phải đánh dấu `localized: true` đủ trong metadata TRƯỚC khi chạy
  migration (migration đọc metadata để biết field nào chuyển). Đánh thiếu → field đó không được migrate.
- **R-02 (migration) backup:** schema dev có thể chạy lại nhiều lần. Script idempotent + tự backup value ra
  `scripts/backups/`; vẫn khuyến nghị `pg_dump`/snapshot Supabase trước lần chạy đầu.
- **R-03 (build) đổi chữ ký cached:** bỏ sót 1 trong **8 call-site UI** (gồm cả `src/app/sitemap.ts` ở root,
  không có param `[locale]`) → vỡ build hoặc phục vụ sai locale. File Change Plan (§11) liệt kê đủ.
- **R-04 (DOM leak):** prop `localized` chảy qua `omit(item,"type","key")` xuống field component; phải
  destructure `localized` ra khỏi `...props` trước khi spread lên DOM input.
- **R-05 (EC-13) form trước migration:** nếu mở form khi DB còn string cũ, renderer + zod coerce string→`{en}`;
  đã xử lý nhưng cần test cả 2 trạng thái (trước/sau migrate).
- **R-06 (metadata drift):** value trong DB có thể lệch metadata (array dài/ngắn khác, thiếu section).
  Traversal duyệt theo item/section THỰC CÓ trong value, không theo index/section cố định của meta (EC-07,
  EC-08, EC-12).

---

# PART 2 — AGENT REFERENCE

## 4. Architecture

Các thành phần và tương tác:

```
                         uiMeta[key] (metadata — NGUỒN CHÂN LÝ, localized flag)
                              │                              │
        ┌─────────────────────┼──────────────────────────────┼─────────────────────┐
        ▼                     ▼                              ▼                       ▼
  scripts/migrate      src/lib/localized-config.ts     services/cached/configs   admin renderer
  (tsx, 1 lần)         (pure traversal helpers)         (resolve theo locale)    (SettingText*Field)
        │                     │                              │                       │
        │  migrateConfig()    │  resolveConfig()             │ getUIConfigsByKey-    │ đọc field.localized
        ▼                     ▼                              ▼  Cached(key,locale)   ▼ → group input/locale
   UPDATE configs.value   string↔{en,vi,..}            fetch getConfigsByKey       form {en,vi}
   (config_type='ui')     fallback default             → resolveConfig → string    → updateConfigByKey
```

Luồng chính:
1. **Build-time/metadata:** field content được đánh `localized: true` trong `src/constants/settings/ui/*`.
2. **Migration (1 lần, dev):** script đọc `uiMeta`, duyệt cây value của 4 config `ui`, chuyển field localized
   `string→{en,vi}`. Ghi backup trước.
3. **User request (`/vi` hoặc `/en`):** page/layout lấy `locale` từ `params` → `getUIConfigsByKeyCached(key,
   locale)` → fetch (cached) → `resolveConfig(value, uiMeta[key], locale)` → trả string đã resolve →
   component render như cũ.
4. **Admin:** trang settings dùng `getConfigsByKey` (không cache, không resolve) → form nhận object `{en,vi}`
   → renderer hiển thị nhóm ô/locale → submit lưu object → `revalidateConfigUpdate(key)` xoá cache mọi locale.

### 4.1 `src/lib/localized-config.ts` (mới — pure, KHÔNG server-only)

Export:
- `isLocalizedField(field: FieldType): boolean` — `(field.type==='text'||field.type==='textarea') &&
  field.localized === true`.
- `normalizeLocalized(v: unknown): LocalizedText` — `string`→`{ [defaultLocale]: v }`; `null/undefined`→`{}`;
  object→giữ nguyên (chỉ nhận key string). (Phục vụ resolve + renderer EC-13.)
- `resolveLocalizedString(v: unknown, locale: Locale): string` — RULE-05: `norm[locale]` nếu non-empty →
  dùng; else `norm[defaultLocale]`; else `""`.
- `resolveFields(obj, fields: FieldType[], locale): any` — traversal đệ quy (§ Data Model / thuật toán).
- `resolveConfig(value: Config, sections: MetaValue[], locale): Config` — lặp sections, gọi `resolveFields`.
- `migrateLocalized(v: unknown): LocalizedText` — seed đủ `routing.locales`: mỗi locale =
  `existing[locale] ?? (locale===defaultLocale ? stringValueNếuCó : "")`; idempotent.
- `migrateFields(obj, fields)` / `migrateConfig(value, sections)` — traversal biến đổi tương ứng.

`resolveFields` và `migrateFields` DÙNG CHUNG một cơ chế walk; chỉ khác hàm biến đổi tại lá localized. Có thể
refactor thành `walkFields(obj, fields, transformLeaf)`.

## 5. Data Model

> KHÔNG đổi schema bảng DB. Chỉ đổi **cấu trúc JSON** trong cột `value` + type TypeScript + metadata flag.

### 5.1 Bảng `configs` — KHÔNG đổi
- `key text`, `config_type text` (PK kép `key+config_type`), `value jsonb $type<Config>`, `updatedAt`.
- Bị migrate: chỉ 4 bản ghi `config_type='ui'`: `homepage`, `layout`, `menu_page`, `reservation_page`.
- `config_type='app'`: KHÔNG đụng.

### 5.2 `src/types/configs.ts` (sửa)
```ts
import { routing } from "@/i18n/routing";
export type Locale = (typeof routing.locales)[number];      // "en" | "vi"
export type LocalizedText = Partial<Record<Locale, string>>; // ASM-01, OQ-01
export type TextValue = string | LocalizedText;              // union — non-localized vẫn string (RULE-03)
// NumberValue/BooleanValue/ImageValue/ObjectValue/ArrayValue/Value/ConfigValue/Config: GIỮ NGUYÊN.
```
Ràng buộc: khoá hợp lệ = `routing.locales` (RULE-04); `en` là fallback logic (có thể rỗng); không
unique/format. Ràng buộc "localized" KHÔNG ép qua type — chỉ qua metadata + migration (jsonb runtime).

### 5.3 `src/types/settings.ts` (sửa)
```ts
export interface TextField     { type: "text";     placeholder?: string; withLabel?: boolean; localized?: boolean; }
export interface TextareaField { type: "textarea"; placeholder?: string; withLabel?: boolean; localized?: boolean; }
```
Chỉ 2 type này có `localized` (RULE-01). Các field type khác KHÔNG có → đặt localized ở nơi khác là lỗi type.

### 5.4 Thuật toán traversal (RULE-10 — cốt lõi)

`resolveFields(obj, fields, locale)`:
```
if (obj == null || typeof obj !== 'object') return obj    // EC-12: section/nhánh thiếu → giữ nguyên
result = { ...obj }
for field of fields:
  val = obj[field.key]
  if (val === undefined) continue
  if isLocalizedField(field):
      result[field.key] = resolveLocalizedString(val, locale)          // lá localized
  else if field.type === 'object':
      result[field.key] = resolveFields(val, field.fields, locale)     // object lồng
  else if field.type === 'array' && Array.isArray(val):
      if field.itemType.type === 'object':
          result[field.key] = val.map(item => resolveFields(item, field.itemType.fields, locale))  // EC-07/08
      // itemType 'image' → giữ nguyên
  // còn lại (number/bool/image/select/slug/array-title) → giữ nguyên (RULE-03)
return result
```
- **EC-07** array rỗng → `[].map` = `[]`, không lỗi.
- **EC-08** value array dài/ngắn khác meta → duyệt theo `val` thực có (map), không theo meta index.
- **EC-10/RULE-19** `title`/`sub_title` array: text con KHÔNG được đánh `localized` → nhánh này rơi vào
  "array itemType object có field text non-localized" → giữ nguyên array `[{text}]`. (Metadata quyết định.)
- **EC-12** section thiếu (vd homepage thiếu `reviews`) → `resolveConfig` gặp `value['reviews']===undefined`
  → bỏ qua, component dùng `?.` như hiện tại.

`migrateFields` giống hệt cấu trúc; tại lá localized thay bằng `migrateLocalized(val)`; **KHÔNG đụng** nhánh
non-localized (RULE-15). `migrateLocalized`:
```
norm = normalizeLocalized(val)              // string→{[default]:v}; null→{}; object→giữ
for locale of routing.locales:
   result[locale] = norm[locale] ?? (locale===defaultLocale ? (norm[defaultLocale] ?? "") : "")
return result   // EC-01 {en:s,vi:""}; EC-02 {en:"",vi:""}; EC-03 giữ; EC-04 bổ sung vi:""
```

### 5.5 Danh mục field đánh `localized: true` (RULE-20…RULE-25 — checklist implement)

| Config `ui` | File | Field đánh `localized: true` |
|---|---|---|
| homepage | `our-story.ts` | `content` (textarea) |
| homepage | `why-choose-us.ts` | `description`, `reasons[].title`, `reasons[].desc` |
| homepage | `gallery.ts` | `images[].title`, `images[].sub_title` (KHÔNG: `title`/`sub_title` array, `images[].image`, `autoplay`) |
| homepage | `reviews.ts` | `description`, `below_box.title`, `below_box.description` (KHÔNG: `reviews_list[].*` — ASM-04) |
| homepage | `contact.ts` | `description`, `location.address`, `opening_hours[].title`, `opening_hours[].items[].label`, `opening_hours[].note` (KHÔNG: `opening_hours[].items[].value` giờ — ASM-02) |
| homepage | `seo.ts` | `title`, `description`, `og_title`, `og_description`, `keywords[].keyword` (ASM-03) (KHÔNG: `og_image`) |
| menu_page | `introduction.ts` | `description` |
| menu_page | `new-product.ts` | `description`, `label`, `sub_label` (KHÔNG: `product_slug` — slug!) |
| menu_page | `food-categories.ts` | `categories_to_show[].label`, `categories_to_show[].page_title` (KHÔNG: `[].key`) |
| menu_page | `why-choose-us.ts` | `description`, `reasons[].title`, `reasons[].desc` |
| menu_page | `seo.ts` | `title`, `description`, `og_title`, `og_description`, `keywords[].keyword` |
| menu_page | `hero.ts` | KHÔNG (title array, images) |
| reservation_page | `booking.ts` | `description`, `reservation_info[].title`, `reservation_info[].items[].text`, `note`, `success_title`, `success_description` (KHÔNG: `contact.phone/email`, `reservation_info[].items[].type` select, `[].icon`) |
| reservation_page | `seo.ts` | `title`, `description`, `og_title`, `og_description`, `keywords[].keyword` |
| reservation_page | `hero.ts` | KHÔNG (title array, banner) |
| layout | `header.ts` | `welcom_text`, `nav_bar[].label`, `nav_bar[].title` (KHÔNG: `phone`, `open_daily` ASM-02, `nav_bar[].href`) |
| layout | `footer.ts` | `description`, `quick_links[].label`, `quick_links[].title`, `services[].label`, `contact.address`, `opening_hours_title`, `opening_hours[].label` (KHÔNG: `socials[].*`, `quick_links[].href`, `contact.phone/email`, `opening_hours[].value` ASM-02) |
| layout | `floating-actions.ts` | KHÔNG (toàn bộ) |

> Implement lưu ý: chỉ THÊM `localized: true` vào object field trong mảng `fields` (kể cả field bên trong
> `itemType.fields` của array). KHÔNG đổi `newItem`/init value (migration lo phần value).

## 6. API / Service Contracts

Sprint này KHÔNG thêm HTTP endpoint. Hợp đồng ở tầng **service**.

### 6.1 `getConfigsByKey(key, configType)` — `src/services/configs.ts` — KHÔNG ĐỔI
- Admin dùng (không cache). Trả `ConfigDB | undefined` với `value` NGUYÊN object `{en,vi}` (RULE-07, ASM-09).

### 6.2 `getUIConfigsByKeyCached(key, locale)` — `src/services/cached/configs.ts` — ĐỔI CHỮ KÝ
- **Input:** `key: string`, `locale: Locale`.
- **Hành vi:** fetch `getConfigsByKey(key,'ui')` (qua cached base) → nếu có, `resolveConfig(value,
  uiMeta[key], locale)` → trả `{ ...config, value: resolvedValue }` (RULE-06). Field localized→string
  (RULE-05, fallback default). Field non-localized giữ nguyên (RULE-03, AC-03.4).
- **Cache:** key = `["configs","ui",key,locale]` (RULE-08, AC-05.1); tag = `CONFIGS.BY_KEY(key)` (không kèm
  locale, RULE-09/AC-05.2/EC-11); revalidate = `DEFAULT` (thủ công qua tag).
- **Edge:** config không tồn tại → trả `undefined` (component dùng `?.`); section thiếu → EC-12.

### 6.3 `getConfigsByKeyCached(key, configType)` / `getAppConfigsByKeyCached(key)` — KHÔNG ĐỔI
- App config KHÔNG resolve, KHÔNG yêu cầu locale (regression, RULE ghi ở Regression §10). Key giữ
  `["configs",configType,key]`.
- **Deviation có chủ ý (so với RULE-06):** RULE-06 nêu cả `getConfigsByKeyCached` nhận `locale`, nhưng ta CỐ Ý
  KHÔNG đổi hai hàm này. Lý do: config `config_type='app'` NGOÀI SCOPE sprint và KHÔNG có field localized nào →
  thêm `locale` chỉ làm bùng key cache + rủi ro regression cho caller app (vd reservation dùng
  `getAppConfigsByKeyCached("reservation")`). Chỉ biến thể UI (`getUIConfigsByKeyCached`) nhận `locale` và
  resolve. Nếu tương lai config `app` cần localize → mở rộng riêng lúc đó.

### 6.4 `updateConfigByKey({key,value,config_type})` — KHÔNG ĐỔI
- Admin submit object `{en,vi}` cho field localized (AC-01.2). Sau update gọi `revalidateConfigUpdate(key)`
  (đã có) → xoá cache mọi locale (EC-11).

## 7. UI / Interaction Flow (admin)

### 7.1 Renderer field (sửa 1 chỗ — RULE-12)
`SettingField.tsx` giữ nguyên router; `SettingTextField.tsx` + `SettingTextareaField.tsx` thêm nhánh
(khi `localized` truthy → uỷ cho `LocalizedFieldInput` với `variant` tương ứng):
- **Field non-localized** (`localized` falsy) → render như cũ: 1 `SettingsTextInput`/`SettingsTextareaInput`
  (AC-01.4). Phải destructure `localized` ra khỏi `...props` để KHÔNG leak xuống DOM (R-04).
- **Field `localized: true`** → render component chung `LocalizedFieldInput` (§7.3), hiển thị **tab strip**
  theo `routing.locales` (chốt theo ui-design.md — KHÔNG "cạnh nhau"):
  - 1 `Controller` tại `name`; value chuẩn hoá qua `normalizeLocalized` (EC-13: string cũ → hiển thị ở tab
    default `en`).
  - Mỗi tab là 1 locale; nội dung tab: input (variant `text`) / textarea (variant `textarea`, AC-01.3);
    onChange cập nhật key locale đó rồi `field.onChange({ ...current, [locale]: v })`.
  - **Chỉ báo locale** trên nhãn tab ("EN"/"VI"); **label field GIỮ tiếng Việt** (RULE-13, AC-01.5).
  - **Badge "chưa dịch"** gắn trên tab locale non-default rỗng/thiếu (RULE-17, AC-02.1); ẩn khi mọi locale
    non-default non-empty (AC-02.2).
  - **(Tuỳ chọn) "Copy từ English"**: set ô locale khác = `en` hiện tại trên form, KHÔNG auto-save
    (RULE-18, AC-02.3); `en` rỗng → copy chuỗi rỗng, no-op hợp lệ (EC-15).

States: empty (badge chưa dịch trên tab) / error (message từ zod dưới ô) / normal.

### 7.2 `LocalizedFieldInput` (component chung — chuẩn theo ui-design.md)
- **Đường dẫn:** `src/components/admin/features/settings/elements/LocalizedFieldInput.tsx`.
- **Props:** `variant: "text" | "textarea"`, `value: LocalizedText | string`, `onChange(v: LocalizedText)`,
  `errorMessage?`, `isRequired?`, `placeholder?`, `label?` (giữ VI). KHÔNG nhận/không leak prop `localized`
  xuống DOM.
- **Hành vi:** render tab strip theo `routing.locales`; nội dung tab = `SettingsTextInput` (variant `text`)
  hoặc `SettingsTextareaInput` (variant `textarea`); chuẩn hoá value qua `normalizeLocalized`; badge "chưa
  dịch" trên tab locale non-default rỗng.
- Cả `SettingTextField` và `SettingTextareaField` gọi lại component này ở nhánh localized → logic "sửa 1 chỗ"
  (RULE-12) tập trung tại đây.

### 7.3 Validation (zod) — `src/lib/zod.ts` + `src/validations/settings.ts`
- Thêm `localizedTextSchema({ isRequired, variant })` (`variant: "text"|"textarea"`): `z.preprocess(normalize→object)` rồi
  `z.object` các locale key optional `string` (text `.max(255)`); refine: nếu `isRequired` → `en` (default)
  phải non-empty ("Nội dung không được để trống") (EC-14). Coerce string cũ → không vỡ (EC-13).
- `generateSettingFieldSchema`: nhánh `text`/`textarea` → nếu `item.localized` trả `localizedTextSchema`,
  else giữ hành vi cũ.

## 8. Rule & Edge-case & NFR Mapping

| ID | Xử lý ở đâu |
|---|---|
| RULE-01 | `localized?` chỉ trên `TextField`/`TextareaField` (types/settings.ts); zod/renderer chỉ đọc ở text/textarea |
| RULE-02 | migration `migrateLocalized` → object; type `LocalizedText` (configs.ts) |
| RULE-03 | traversal chỉ chạm field localized; non-localized giữ nguyên (resolveFields/migrateFields) |
| RULE-04 | `Locale`/locales lấy từ `routing` (configs.ts, localized-config.ts) |
| RULE-05 | `resolveLocalizedString` (fallback default → "") |
| RULE-06 | `getUIConfigsByKeyCached(key,locale)` resolve trước khi trả (deviation có chủ ý: `getConfigsByKeyCached`/app KHÔNG đổi — §6.3) |
| RULE-07 | `getConfigsByKey` (admin) không resolve |
| RULE-08 | cache key `["configs","ui",key,locale]` |
| RULE-09 | tag `CONFIGS.BY_KEY(key)` không kèm locale; `revalidateConfigUpdate` |
| RULE-10 | `resolveFields`/`migrateFields` duyệt object.fields + array.itemType.fields |
| RULE-11 | service trả string → component không đổi (page/layout) |
| RULE-12 | `SettingTextField`/`SettingTextareaField` nhánh localized (1 chỗ) |
| RULE-13 | renderer giữ label VI, chỉ thêm badge locale |
| RULE-14 | `migrateLocalized` (string/null/object) |
| RULE-15 | migrateFields bỏ non-localized; script filter `config_type='ui'`; không đổi schema |
| RULE-16 | script đọc `DB_SCHEMA`; tự ghi backup + hướng dẫn snapshot |
| RULE-17 | badge "chưa dịch" khi locale non-default rỗng (renderer) |
| RULE-18 | "Copy từ English" client-only (renderer, tuỳ chọn) |
| RULE-19 | title/sub_title array KHÔNG đánh localized (checklist §5.5); traversal giữ nguyên |
| RULE-20…23 | checklist §5.5 (đánh flag từng file meta) |
| RULE-24 | field giờ KHÔNG đánh localized (§5.5) |
| RULE-25 | slug/key/href/icon/URL/email/phone KHÔNG đánh localized (§5.5) |
| EC-01 | `migrateLocalized` string→{en:s,vi:""} |
| EC-02 | `migrateLocalized` null→{en:"",vi:""}; `normalizeLocalized` không crash |
| EC-03 | `migrateLocalized` idempotent (giữ object hợp lệ) |
| EC-04 | `migrateLocalized` bổ sung locale thiếu ="" |
| EC-05 | `resolveLocalizedString` fallback default |
| EC-06 | `resolveLocalizedString` trả "" khi cả hai rỗng |
| EC-07 | `resolveFields` array rỗng → `[].map` |
| EC-08 | duyệt theo `val` thực có (map), không theo meta index |
| EC-09 | script chỉ query `config_type='ui'` |
| EC-10 | title array text non-localized → traversal giữ nguyên |
| EC-11 | tag theo key → revalidate xoá mọi locale |
| EC-12 | `resolveFields`/`resolveConfig` bỏ qua section/nhánh undefined |
| EC-13 | `normalizeLocalized` + `z.preprocess` coerce string cũ ở form |
| EC-14 | `localizedTextSchema` refine `en` non-empty khi isRequired |
| EC-15 | "Copy từ English" khi en rỗng → copy "" no-op |
| NFR-01 | resolve in-memory sau 1 fetch; O(node); không thêm DB round-trip (§6.2) |
| NFR-02 | 2 locale × 4 key = 8 entry; revalidate 1 key xoá mọi locale |
| NFR-03 | migration idempotent + backup + giữ English (migrateLocalized, script) |
| NFR-04 | component user không sửa (service trả string) |
| NFR-05 | locale-agnostic: thêm locale = sửa routing + migration; không sửa type/service/renderer |
| NFR-06 | không dịch label admin; badge EN/VI + "chưa dịch" |
| NFR-07 | `normalizeLocalized`/resolve/preprocess chịu value bất thường không crash |

## 9. NFR Design (chi tiết)

- **NFR-01/02 (Perf/Cache):** resolve là duyệt cây in-memory ngay sau fetch đã cache, không query thêm. Cache
  per-locale chỉ nhân theo số locale (2) × số ui key (4) = 8 entry — không bùng nổ; tag không kèm locale nên
  invalidate O(1) cho mọi locale.
- **NFR-03 (Data safety):** `migrateLocalized` idempotent (object hợp lệ giữ nguyên); script backup value ra
  `scripts/backups/configs-ui-<ts>.json` trước UPDATE; rollback script khôi phục `en`. English hiện tại thành
  bản `en` — không mất.
- **NFR-04 (Compat):** service trả string đã resolve; `OurStorySection`, `SectionTitleFromConfigs`, Header,
  Footer… nhận string như trước (không sửa component).
- **NFR-05 (Maintainability):** `Locale`/locales suy từ `routing`; migrate seed theo `routing.locales`; renderer
  lặp `routing.locales`. Thêm `fr` = thêm vào routing + chạy migration bổ sung.
- **NFR-06 (Admin UX):** label/description admin giữ VI; ô EN/VI phân biệt bằng badge; badge "chưa dịch".
- **NFR-07 (Robustness):** mọi giá trị bất thường qua `normalizeLocalized`/`z.preprocess`, không throw.

## 10. Regression-safe Plan

| Module dùng chung | Cách đổi an toàn |
|---|---|
| `src/types/configs.ts`/`settings.ts` | Chỉ MỞ RỘNG: `TextValue` thành union (string vẫn hợp lệ → app + non-localized compile như cũ); `localized?` optional (default undefined). |
| `src/services/configs.ts` | KHÔNG đổi chữ ký; admin load/save app + ui như cũ. |
| `src/services/cached/configs.ts` | Chỉ đổi `getUIConfigsByKeyCached` (+`locale`); `getConfigsByKeyCached`/`getAppConfigsByKeyCached` GIỮ NGUYÊN → app cached không cần locale (deviation §6.3). Cập nhật ĐỦ 8 call-site UI (§11, gồm `sitemap.ts`) kẻo vỡ build. |
| Renderer `SettingField`+text/textarea | Nhánh localized chỉ kích hoạt khi `localized:true`; field non-localized và toàn bộ form config `app` render/submit y như cũ. Destructure `localized` tránh leak DOM. |
| Cache tag `CONFIGS.BY_KEY` + `revalidate.ts` | KHÔNG đổi tag/hàm; vì tag không kèm locale, `revalidateConfigUpdate(key)` tự xoá mọi locale. |
| DB schema `dev_multi_lang` | Migration chỉ đụng cột `value` của 4 config `ui`; app + field non-localized giữ nguyên; có backup + rollback. |

**Regression happy path (qa-guard):** (1) admin mở/lưu config `app` (order settings) OK; (2) `/en`
homepage/menu/reservation render đủ section sau migrate; (3) admin form homepage field non-localized
(ảnh/số/array title) render+save như cũ.

## 11. File Change Plan

**Tạo mới:**
- `src/lib/localized-config.ts` — traversal + resolve/migrate helpers (pure).
- `src/components/admin/features/settings/elements/LocalizedFieldInput.tsx` — tab strip nhập theo locale +
  badge "chưa dịch" + (tuỳ chọn) Copy từ English; prop `variant: "text"|"textarea"` (chuẩn ui-design.md).
- `scripts/migrate-configs-i18n.ts` — forward migration (tsx, dotenv, postgres client, backup + UPDATE).
- `scripts/rollback-configs-i18n.ts` — rollback `{en,vi}`→`en`.
- `scripts/backups/` — thư mục backup (script tự tạo; thêm `.gitignore` nếu cần).

**Sửa:**
- `src/types/configs.ts` — `Locale`, `LocalizedText`, `TextValue` union.
- `src/types/settings.ts` — `localized?` trên `TextField`/`TextareaField`.
- `src/services/cached/configs.ts` — `getUIConfigsByKeyCached(key, locale)` resolve + cache key per-locale.
- `src/lib/zod.ts` — nhánh localized trong `generateSettingFieldSchema`.
- `src/validations/settings.ts` — `localizedTextSchema`.
- `src/components/admin/features/settings/fields/SettingTextField.tsx` — nhánh localized (gọi `LocalizedFieldInput` variant `text`).
- `src/components/admin/features/settings/fields/SettingTextareaField.tsx` — nhánh localized (gọi `LocalizedFieldInput` variant `textarea`).
- Metadata (đánh `localized: true` theo §5.5):
  - `src/constants/settings/ui/homepage/{our-story,why-choose-us,gallery,reviews,contact,seo}.ts`
  - `src/constants/settings/ui/menu-page/{introduction,new-product,food-categories,why-choose-us,seo}.ts`
  - `src/constants/settings/ui/reservation-page/{booking,seo}.ts`
  - `src/constants/settings/ui/layout/{header,footer}.ts`
- Call-site UI (truyền `locale`) — 8 chỗ:
  - `src/app/(web)/[locale]/page.tsx` — `generateMetadata` (thêm `params`) + `HomePage` (locale từ `params`)
  - `src/app/(web)/[locale]/layout.tsx` — đã có `locale`
  - `src/app/(web)/[locale]/menu/[category]/page.tsx` — `generateMetadata` (thêm `locale` vào params) + `page`
  - `src/app/(web)/[locale]/reservation/page.tsx` — `generateMetadata` (thêm `params`) + `page`
  - `src/app/sitemap.ts` (root, KHÔNG có `[locale]`) — chỉ đọc field non-localized (`food_categories[].key`) →
    truyền `routing.defaultLocale` cho `getUIConfigsByKeyCached("menu_page", routing.defaultLocale)`.
- `package.json` — thêm script `migrate:configs-i18n`, `rollback:configs-i18n` (chạy qua `tsx`, set
  `DB_SCHEMA`).
- `.sdlc/architecture.md` — ĐÃ cập nhật (mục "Config i18n").

---

## Self-review
- Mọi RULE-01…25, EC-01…15, NFR-01…07 có trong bảng §8. ✔
- Mọi EC có error handling ở service/renderer/migration. ✔
- Mọi module trong Regression Impact có plan §10. ✔
- Không thêm endpoint/entity ngoài yêu cầu (sprint không có HTTP endpoint mới; không đụng entity DB/app). ✔
- Bám conventions codebase (createDynamicCachedFunction, revalidateConfigUpdate, uiMeta, tsx). ✔

## Summary
- **Endpoints:** 0 (thay đổi ở tầng service/metadata/migration).
- **Entities:** 0 bảng mới; đổi cấu trúc JSON cột `value` của 4 config `ui` + 1 type nền tảng `LocalizedText`.
- **Tech Decisions cần chú ý:** TD-01 (`LocalizedText` locale-agnostic), TD-03 (migration script tsx standalone
  + backup — R-01 thứ tự metadata trước migration, R-02 backup), TD-04 (đổi chữ ký `getUIConfigsByKeyCached` →
  cập nhật đủ 8 call-site UI gồm `sitemap.ts`; `getConfigsByKeyCached`/app GIỮ NGUYÊN — deviation có chủ ý so
  với RULE-06, xem §6.3), TD-06 (zod coerce string cũ cho EC-13/EC-14).
</content>
</invoke>
