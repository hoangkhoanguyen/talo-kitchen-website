# Design — sprint-3-entity-i18n (Loại A: i18n cho entity DB)

> Project: Talo Kitchen (Next.js 16 App Router + RSC, TypeScript, Drizzle/Postgres)
> Phụ thuộc: sprint-1 (done), nhất quán pattern sprint-2-config-i18n (done). Nguồn: `requirements.md`,
> `architecture.md` (mục "Config i18n" + "Entity i18n").

---

# PART 1 — HUMAN REVIEW

## 1. Design Overview

- **Bảng translation riêng (không JSON)**: 3 bảng `*_translations` với `UNIQUE(entity_id, locale)` + FK
  `ON DELETE CASCADE`. Cột gốc trên bảng chính GIỮ NGUYÊN làm bản English + fallback cuối. Đây là schema
  migration thật (khác sprint-2 chỉ đổi JSON). *Vì sao:* requirements RULE-03/05; locale-agnostic, thêm
  ngôn ngữ = thêm row.
- **Resolve 1 query + COALESCE in-memory**: service user-facing dùng drizzle relational `with:
  { translations: { where locale } }` (kèm addon/category lồng), rồi `translation.field || cột gốc`.
  *Vì sao:* NFR-01 không N+1, giữ nguyên số round-trip; shape trả về không đổi → component không sửa.
- **Cache per-locale key, tag không kèm locale**: thêm `locale` vào key parts, tag giữ nguyên (nhất quán
  sprint-2 RULE-10). Revalidate 1 lần xoá mọi locale.
- **Admin: dải tab presentational + `activeLocale` nâng lên provider**: một component
  `LocaleTabStrip` (presentational, KHÔNG state/context) render dải tab `[Tiếng Anh][Tiếng Việt]` + badge
  "Chưa dịch" + nút "Copy từ English". State `activeLocale` do form/provider giữ; field bind TRỰC TIẾP RHF
  `translations.<locale>.<field>` qua Controller (không cần wrapper component riêng). Save upsert row
  translation + set cột gốc = bản `en`, trong transaction.
- **API/cart lấy locale tường minh**: `/api/products/quick/[id]` nhận `?locale=`; server action cart nhận
  `locale` từ `useLocale()`. Fallback thứ tự: query → cookie `NEXT_LOCALE` → `Accept-Language` → `en`.

## 2. Tech Decisions (user có thể override)

1. **Component tab admin: TẠO MỚI `LocaleTabStrip.tsx` (presentational)**, KHÔNG tái dụng
   `LocalizedFieldInput` của sprint-2, KHÔNG dùng context provider riêng cho tab. Chốt hướng
   presentational (khớp `ui-design.md`):
   - `LocaleTabStrip` chỉ render UI: dải tab `[Tiếng Anh][Tiếng Việt]` + badge "Chưa dịch" + nút "Copy từ
     English". Props: `activeLocale`, `onChange(locale)`, `untranslatedLocales` (để hiện badge),
     `onCopyFromDefault?`. KHÔNG giữ state, KHÔNG context.
   - **State `activeLocale`**: nâng vào `ProductDetailsProvider` cho trang product edit (để `AddonsEditor`
     ở card riêng dùng CHUNG một `activeLocale` master với card "Thông tin cơ bản"). Với `CreateProduct`
     modal + category forms (`CreateCategory`/`UpdateCategory`) → dùng `useState` local cho `activeLocale`.
   - **Field bind TRỰC TIẾP** RHF `translations.<locale>.<field>` và `addons.<i>.translations.<locale>.name`
     qua `Controller` (KHÔNG wrapper `LocalizedTextControl`). Input hiện có (ProductTitleInput,…) nhận
     value/onChange từ `Controller` như cũ, chỉ đổi `name`.
   Lý do không dùng `LocalizedFieldInput`: nó bind 1 field → object `{en,vi}` + render tab RIÊNG mỗi field
   (hợp form config render động). Entity form cần 1 dải tab điều khiển nhiều ô cùng lúc (AC-01.1) + lưu
   nested `translations.<locale>.<field>` (RULE-19). Tái dụng phần *visual* (class `tabs tabs-box`, badge)
   để đồng bộ UI. → Xem section 4/7.
2. **Resolve bằng drizzle relational `with` + `where locale`** (không viết raw SQL JOIN). Đồng bộ style
   code hiện tại (`db.query.products.findMany({ with })`). COALESCE làm in-memory (`x.translations[0]?.f ||
   base.f`). 1 round-trip.
3. **Helper locale mới `src/lib/locale.ts`**: `resolveLocale(input)` (string → `Locale` hợp lệ hoặc
   `defaultLocale`) + `getRequestLocale(request)` cho API route (query→cookie→Accept-Language→en). Không có
   `server-only` (để seed script/route dùng được).
4. **Seed & rollback script tsx** đặt tại `scripts/` theo đúng khuôn `migrate-configs-i18n.ts` (dotenv,
   `postgres` client riêng, backup JSON vào `scripts/backups/`, guard env). Thêm npm scripts
   `seed:entities-i18n`, `rollback:entities-i18n`.
5. **Zod `translations` schema**: mỗi entity thêm nhánh `translations: { en: {...}, vi: {...} }`. Bản `en`
   (defaultLocale) validate bắt buộc field required (title/name); bản `vi` optional (cho phép để trống →
   fallback). Field không dịch giữ nguyên validate cũ.

## 3. Risks / Trade-offs

- **Migration rủi ro (NFR-03/04)**: Drizzle `db:generate` chạy trên toàn bộ diff schema — nếu snapshot
  drizzle của dev đang lệch với DB thật, migration có thể phát sinh statement ngoài ý muốn. *Giảm thiểu:*
  review file SQL sinh ra trước khi `db:migrate`, xác nhận CHỈ có `CREATE TABLE` 3 bảng translation (+ FK/
  unique), KHÔNG có `ALTER`/`DROP` cột gốc. Backup DB schema `dev_multi_lang` trước. Rollback = DROP CASCADE
  3 bảng (cột gốc còn nguyên).
- **Seed idempotent**: dựa `INSERT ... ON CONFLICT (entity_id, locale) DO NOTHING` (không overwrite bản en
  admin đã sửa tay). Chạy lần 2 an toàn.
- **Discrepancy nguồn cart realtime (quan trọng)**: requirements liệt kê `getProductsDetailsByIds` +
  `/api/products/ids` là nguồn cart. Khảo sát thực tế: giỏ hàng client dùng **`getCartProductsByIdsAction`
  → `getCartProductsByIds` (`src/services/cart.ts`)**, KHÔNG dùng `/api/products/ids`. **Đã verify (grep
  toàn `src/`): `/api/products/ids` + hằng `productsByIdsApi` KHÔNG có client caller nào** (chỉ có định
  nghĩa hằng route). → An toàn localize `/api/products/ids` cho nhất quán mà không vỡ caller ẩn. Để AC-05.2
  (giỏ hiển thị đúng locale) thực sự đúng, PHẢI localize `getCartProductsByIds` (thêm vào scope, section
  4/8). → Xem section 8 (RULE-08 mở rộng).
- **Home page**: `page.tsx` hiện KHÔNG render NewFood/RelatedProducts/product card (chỉ Hero/OurStory/…).
  Nên KHÔNG cần sửa home cho product locale. NewFood/FoodCategories thuộc trang menu. (requirements đề cập
  "home NewFood/RelatedProducts" nhưng thực tế không tồn tại — bỏ khỏi File Change Plan, ghi rõ.)
- **OQ-02 KẾT LUẬN**: `order_items.productName` (varchar 255, notNull) + `order_item_addons.addonName`
  (varchar 255, notNull) LƯU SNAPSHOT text tại thời điểm đặt. → Order lịch sử KHÔNG dịch lại (ASM-07 đúng).
  Sprint-3 chỉ localize hiển thị realtime (cart trước khi đặt + quick-cart). KHÔNG đụng schema/service
  orders. Xem EC-12.
- **Admin RHF đổi `name` động theo tab**: khi đổi tab, Controller re-bind `translations.en.*` ↔
  `translations.vi.*`. Dùng `shouldUnregister: false` (mặc định RHF) để không mất giá trị tab kia. Đã note
  trong section 7.
- **`generateMetadata` dish page — làm rõ (NOTE reviewer)**: dòng `locale: "en_US"` trong `openGraph` là
  thuộc tính `og:locale` của OpenGraph, **KHÔNG gây vỡ build** và không phải lỗi cần sửa gấp ở sprint này
  (hoàn thiện og:locale theo locale để sprint-4-i18n-polish). Fix THỰC SỰ cần ở sprint-3: hiện
  `generateMetadata` gọi `getProductDetailsBySlugCached(slug)` **thiếu `locale`**, và page body cũng gọi
  thiếu `locale` → text metadata/trang không khớp locale. Đổi: nhận `params.locale`, truyền vào **CẢ HAI**
  lần gọi (metadata + page body) để title/description khớp locale trang. (og:locale giữ nguyên "en_US" ở
  sprint này.)

---

# PART 2 — AGENT REFERENCE

## 4. Architecture

```
                    ┌─────────────────────── USER-FACING (RSC) ──────────────────────┐
 [locale] page ─────┤ dish/[slug]/page.tsx  → getProductDetailsBySlugCached(slug,loc) │
 (params.locale)    │                        + getRelatedProductsCached(ids, loc)      │
                    │ menu/[category]/page   → <FoodCategories locale> <NewFood locale>│
                    │   FoodCategories.tsx   → getProductsByCategorySlugCached(key,loc)│
                    │   NewFood.tsx          → getProductBySlugCached(slug, loc)       │
                    └──────────────┬──────────────────────────────────────────────────┘
                                   │ (locale param)
        ┌──────────────────────────▼───────────────────────────┐
        │ src/services/cached/products.ts (per-locale KEY, tag  │
        │  không kèm locale) — createDynamicCachedFunction       │
        └──────────────────────────┬───────────────────────────┘
                                   │
        ┌──────────────────────────▼───────────────────────────┐
        │ src/services/products.ts (user-facing hàm nhận locale)│
        │  relational `with { translations where locale }`      │
        │  → COALESCE(translation.f, cột gốc) in-memory         │
        └──────────────────────────┬───────────────────────────┘
                                   │
        ┌──────────────────────────▼───────────────────────────┐
        │ Drizzle: products / product_categories / product_addons│
        │  + *_translations (FK CASCADE, UNIQUE(id,locale))     │
        └───────────────────────────────────────────────────────┘

 API (ngoài [locale], tự lấy locale qua getRequestLocale):
   /api/products/quick/[id]/route.ts → getProductDetailsForQuickCartByIdCached(id, loc)
   /api/products/ids/route.ts        → getProductsDetailsByIds(ids, loc)   [không cache]
 Cart realtime (server action, nhận locale từ client useLocale()):
   getCartProductsByIdsAction(ids, loc) → getCartProductsByIds(ids, loc)   [cart.ts]

 ADMIN (KHÔNG cache, KHÔNG resolve — trả TẤT CẢ translation):
   getAdminProductById / getCategoryWithProducts(+detail) / (addons kèm) → form {en,vi}
   save: updateProductById(tx) / createProduct / addProductCategory / updateProductCategory
         → upsertEntityTranslations(...) + set cột gốc = bản en
```

**Component mới / trách nhiệm:**
- `LocaleTabStrip.tsx` (client, **presentational, KHÔNG state/context**): render dải tab
  `[Tiếng Anh][Tiếng Việt]` + badge "Chưa dịch" + nút "Copy từ English". Props: `activeLocale`,
  `onChange(locale)`, `untranslatedLocales: Locale[]`, `onCopyFromDefault?()`. Dùng lại ở product form,
  create-product modal, category create/update.
- **`activeLocale` state**: nâng vào `ProductDetailsProvider` (product edit — để `AddonsEditor` card riêng
  dùng chung locale master); `useState` local ở `CreateProduct` modal + `CreateCategory`/`UpdateCategory`.
  Field bind trực tiếp `Controller name="translations.<activeLocale>.<field>"` /
  `"addons.<i>.translations.<activeLocale>.name"` (không wrapper).
- `src/lib/locale.ts`: `resolveLocale`, `getRequestLocale`.
- `src/services/products/translations.ts` (hoặc thêm vào `products.ts`): helper `upsertProductTranslations`,
  `upsertCategoryTranslations`, `upsertAddonTranslations` + resolver in-memory.

## 5. Data Model

> 3 bảng MỚI trong `dbSchema` (`pgSchema(process.env.DB_SCHEMA)`). Cột gốc bảng chính KHÔNG đổi.
> Định nghĩa Drizzle: thêm file `src/db/schemas/products/product-translations.ts`,
> `product-category-translations.ts`, `product-addon-translations.ts`; export qua `index.ts`.

### `product_translations`
| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| `id` | `serial` | PK |
| `product_id` | `integer` | NOT NULL, FK → `products.id` **ON DELETE CASCADE** |
| `locale` | `varchar(10)` | NOT NULL |
| `title` | `varchar(255)` | nullable (khớp `products.title` 255; nullable để không chặn bản vi thiếu) |
| `description` | `text` | nullable |
| `sub_description` | `text` | nullable |
| `allergen_info` | `text` | nullable |
| `created_at` | `timestamptz` | NOT NULL DEFAULT now |
| `updated_at` | `timestamptz` | NOT NULL DEFAULT now |
| — | — | **UNIQUE (`product_id`, `locale`)** |

Relation: `productTranslationsRelations` → `product: one(products)`. Thêm vào `productsRelations`:
`translations: many(productTranslations)`.

### `product_category_translations`
| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| `id` | `serial` | PK |
| `category_id` | `integer` | NOT NULL, FK → `product_categories.id` **ON DELETE CASCADE** |
| `locale` | `varchar(10)` | NOT NULL |
| `name` | `varchar(255)` | nullable (khớp `product_categories.name`) |
| `description` | `varchar(1024)` | nullable (khớp `product_categories.description`) |
| `created_at`/`updated_at` | `timestamptz` | NOT NULL DEFAULT now |
| — | — | **UNIQUE (`category_id`, `locale`)** |

Relation: thêm `translations: many` vào `productCategoriesRelations` (hiện `({ many })` — OK, thêm 1 dòng).

### `product_addon_translations`
| Cột | Kiểu | Ràng buộc |
|-----|------|-----------|
| `id` | `serial` | PK |
| `addon_id` | `integer` | NOT NULL, FK → `product_addons.id` **ON DELETE CASCADE** |
| `locale` | `varchar(10)` | NOT NULL |
| `name` | `varchar(255)` | nullable |
| `created_at`/`updated_at` | `timestamptz` | NOT NULL DEFAULT now |
| — | — | **UNIQUE (`addon_id`, `locale`)** |

Relation: **`productAddonRelations` hiện là `relations(productAddons, ({ one }) => ...)` → PHẢI đổi
destructure thành `({ one, many })`** và thêm `translations: many(productAddonTranslations)`.

**FK note (không đổi bảng chính):** `products.category_id` không có FK thật, `product_addons.product_id`
có `foreignKey` không kèm onDelete — GIỮ NGUYÊN. Chỉ 3 bảng translation mới khai báo FK + `onDelete:
"cascade"` tường minh (drizzle: `.references(() => parent.id, { onDelete: "cascade" })` hoặc
`foreignKey({...}).onDelete("cascade")`).

**Types bổ sung (`src/types/products.ts`, không phá type cũ):**
```ts
export type ProductTranslationDB = typeof productTranslations.$inferSelect;
export type NewProductTranslationDB = typeof productTranslations.$inferInsert;
export type ProductCategoryTranslationDB = typeof productCategoryTranslations.$inferSelect;
export type NewProductCategoryTranslationDB = typeof productCategoryTranslations.$inferInsert;
export type ProductAddonTranslationDB = typeof productAddonTranslations.$inferSelect;
export type NewProductAddonTranslationDB = typeof productAddonTranslations.$inferInsert;

// Admin form nested (RULE-19): translations record theo locale
export type ProductTranslationForm = Record<Locale, {
  title: string; description?: string; subDescription?: string; allergenInfo?: string;
}>;
export type CategoryTranslationForm = Record<Locale, { name: string; description?: string }>;
export type AddonTranslationForm = Record<Locale, { name: string }>;
```
`WebProduct`/`WebProductDetails` KHÔNG đổi (service resolve trả string như cũ — ASM-04).

## 6. API Contracts

### GET `/api/products/quick/[id]?locale=<en|vi>`
- **Auth:** none (public). **Locale:** `getRequestLocale(request)` (query→cookie→Accept-Language→en).
- **Path:** `id` number. **Query:** `locale` optional.
- **Success 200:** `{ product: { id, title, price, category, allergenInfo, addons:[{id,name,price}],
  images:[{url}] } | null }` — `title`/`addons[].name`/`allergenInfo` đã resolve theo locale (fallback en).
  Shape KHÔNG đổi so với hiện tại (client `QuickCartModal` không phải sửa type).
- **EC-11:** thiếu locale → default en, không lỗi. **EC-15:** locale sai (`fr`) → en. Product không tồn
  tại/inactive → `{ product: null }`.
- **Client caller:** `QuickCartModal.tsx` truyền `?locale=<useLocale()>` qua `webRoutes.productQuickApi(id,
  locale)` (cập nhật signature route constant để append query).

### GET `/api/products/ids?ids=1,2,3&locale=<en|vi>`
- **Auth:** none. **Locale:** `getRequestLocale(request)`.
- **Success 200:** `{ products: [{ id, slug, title, price, imageUrl, category, addons:[{id,name,price}] }] }`
  — text resolve theo locale. Shape không đổi.
- **EC-11/EC-15** như trên. `ids` rỗng → `{ products: [] }`.
- *Ghi chú:* route này hiện KHÔNG có client caller (giỏ dùng server action). Vẫn cập nhật cho nhất quán.

### Server action `getCartProductsByIdsAction({ ids, locale })` (nguồn cart realtime THẬT)
- **File:** `src/actions/web/cart.ts` → `getCartProductsByIds(ids, locale)` (`src/services/cart.ts`).
- **Input:** `{ ids: number[]; locale: Locale }` (client truyền `useLocale()`).
- **Output:** như cũ nhưng `title`/`addons[].name`/`category` resolve theo locale. Fallback en.
- **Error:** service throw → action trả `[]` (giữ hành vi hiện tại). locale sai → `resolveLocale` → en.
- **Client:** `useGetProductsDetailsByIds`/`useGetCartProducts` truyền `locale` (từ `useLocale()`).

> Không thêm endpoint/entity mới ngoài yêu cầu. Không đổi API orders (snapshot — EC-12).

## 7. UI / Interaction Flow (Admin)

**Product form (`ProductEditForm.tsx` + `CreateProduct.tsx`):**
- `activeLocale` do `ProductDetailsProvider` giữ (product edit) — expose qua context sẵn có
  (`{ activeLocale, setActiveLocale }`). `AddonsEditor` (card riêng) đọc cùng context → dùng chung locale
  master. `CreateProduct` modal dùng `useState` local.
- Đặt `<LocaleTabStrip activeLocale onChange untranslatedLocales onCopyFromDefault />` ở đầu card "Thông
  tin cơ bản". `slug` KHÔNG nằm trong tab (dùng chung). Cột phải (isActive/priority/category/price/related)
  + Images + Addons(price/isActive) ngoài tab.
- Mỗi ô text: `Controller name="translations.${activeLocale}.title"` → render `ProductTitleInput` như cũ
  (value/onChange từ field). Tương tự allergenInfo/subDescription/description. **Bind trực tiếp, không
  wrapper.**
- **Addon name theo tab (AddonsEditor):** `Controller name="addons.${i}.translations.${activeLocale}.name"`
  (activeLocale từ provider context). price/isActive giữ flat. 1 `activeLocale` toàn form → UX nhất quán.
- **States:** loading (form skeleton hiện có), empty (entity mới → tab en seed từ cột gốc/rỗng, tab vi
  rỗng — EC-05), error (zod: tab en thiếu title → lỗi hiển thị ở ô title; nên `setActiveLocale('en')` khi
  submit lỗi ở en để lộ ô lỗi).
- **Badge "chưa dịch" (RULE-17/AC-03.1):** `LocaleTabStrip` nhận `untranslatedLocales` (tính client từ
  `useWatch` giá trị `translations.<locale>` — locale non-default có field required rỗng). Ẩn khi đủ
  (AC-03.2).
- **Copy từ English (RULE-18/AC-03.3, tuỳ chọn):** nút trong `LocaleTabStrip` gọi `onCopyFromDefault` →
  form set field locale hiện tại = field `en` (client, chưa lưu).
- **RULE-16:** label vẫn tiếng Việt; chỉ thêm chỉ báo locale (Tiếng Anh/Tiếng Việt) + badge.

**Category form (`CreateCategory.tsx` + `categories/UpdateCategory.tsx` — CẢ HAI tồn tại):**
- `activeLocale` = `useState` local trong từng component. Đặt `LocaleTabStrip` ở đầu vùng nhập.
- **`CreateCategory.tsx`**: hiện CHỈ có `name`+`slug` (KHÔNG có input description) → chỉ bọc tab quanh
  `name` (`translations.<locale>.name`); `slug` ngoài tab. `description` EN/VI **KHÔNG** nhập ở form create.
  Khi lưu: upsert row en+vi với `name` (description để rỗng/null).
- **`categories/UpdateCategory.tsx`**: đã có Textarea `description` → bọc tab quanh CẢ `name` +
  `description` (`translations.<locale>.name` / `translations.<locale>.description`); `slug`/`isActive`
  ngoài tab. Đây là nơi DUY NHẤT nhập description EN/VI.

**Data shape form (RULE-19):**
```
product: { slug, price, categoryId, priority, isActive, images, relatedProducts,
           addons: [{ id?, price, isActive, translations: { en:{name}, vi:{name} } }],
           translations: { en:{title,description,subDescription,allergenInfo},
                           vi:{title,description,subDescription,allergenInfo} } }
category: { slug, isActive, translations: { en:{name,description}, vi:{name,description} } }
```
Khi load form (admin service trả mọi translation): map array translation → record `{en,vi}`; nếu thiếu
row en → seed từ cột gốc (EC-05). Khi submit: action map `translations.en` → cột gốc + gửi cả record
xuống service upsert.

## 8. Rule & Edge-case → nơi xử lý

| ID | Xử lý tại |
|----|-----------|
| RULE-01 | Cột dịch của 3 bảng translation (section 5); chỉ các field này có trong form tab |
| RULE-02 | Field không dịch giữ flat ngoài tab (section 7); schema translation không chứa chúng |
| RULE-03 | UNIQUE(entity_id, locale) + FK ON DELETE CASCADE (section 5) |
| RULE-04 | `resolveLocale` (`src/lib/locale.ts`): locale ∉ routing → defaultLocale; cột `locale` varchar |
| RULE-05 | Migration chỉ CREATE bảng mới; cột gốc không đổi (section 5, seed script backup) |
| RULE-06 | Seed script tạo row en = cột gốc; save admin set cột gốc = bản en (RULE-12) |
| RULE-07 | Resolver in-memory `translation.field \|\| cột gốc` (COALESCE); rỗng cả hai → `""`/`null` |
| RULE-08 | 6 hàm user-facing + `getCartProductsByIds` (7th) nhận `locale` (section 4/6) |
| RULE-09 | relational `with { translations where locale }` + addon lồng → 1 query (EC-14) |
| RULE-10 | cached: `getKeyParts` thêm locale; `getTags` giữ nguyên (section 4, `cached/products.ts`) |
| RULE-11 | Service trả string đã resolve; `WebProduct*` không đổi; component không sửa |
| RULE-12 | `upsert*Translations` INSERT ... ON CONFLICT (entity_id, locale) DO UPDATE + set cột gốc, trong tx `updateProductById` / create actions |
| RULE-13 | Admin service (`getAdminProductById`, `getCategoryWithProducts`, addon) thêm `with: { translations }` (mọi locale), KHÔNG resolve |
| RULE-14 | `getRequestLocale` (API) + client truyền `?locale=`/action param |
| RULE-15 | Drizzle forward migration + seed tsx idempotent + rollback SQL (section 10/11) |
| RULE-16 | Label admin giữ tiếng Việt; chỉ thêm tab + chỉ báo (section 7) |
| RULE-17 | Badge "chưa dịch" trên tab vi (section 7) |
| RULE-18 | Nút "Copy từ English" trong `LocaleTabStrip` (`onCopyFromDefault`) (section 7) |
| RULE-19 | Tab bọc input hiện có; path nested `translations.<locale>.<field>` (section 7) |
| RULE-20 | Locale-agnostic: locale varchar, resolver duyệt `routing.locales`, form map theo `routing.locales` |
| EC-01 | Seed copy null; resolver trả null; component `\|\| ""` |
| EC-02 | Thiếu row vi → resolver fallback cột gốc |
| EC-03 | Field vi rỗng → field đó fallback cột gốc, field khác giữ vi (COALESCE per-field) |
| EC-04 | Row vi rỗng + cột gốc rỗng → `""`/null, không lỗi |
| EC-05 | Entity mới chỉ cột gốc → resolver fallback; form seed tab en từ cột gốc, vi rỗng |
| EC-06 | `category.description` null → resolver trả null; menu render bỏ qua |
| EC-07 | Xoá product → CASCADE product_translations; addon không bị xoá (behavior cũ) → addon translation theo addon; xoá addon → CASCADE addon_translations |
| EC-08 | Addon đã có id → upsert theo addon_id; addon mới → tạo addon (returning id) rồi upsert, trong tx |
| EC-09 | Clear field vi → set rỗng (không xoá row) → resolver fallback en |
| EC-10 | Seed script guard: bảng chưa tồn tại → bắt lỗi, exit code ≠ 0 (như migrate-configs) |
| EC-11 | `getRequestLocale` không có nguồn → en |
| EC-12 | Order snapshot (`productName`/`addonName`) → không dịch lại; realtime cart theo locale (section 3 OQ-02) |
| EC-13 | /en & /vi khác key cache; revalidateTag BY_SLUG xoá cả 2 (tag không kèm locale) |
| EC-14 | addon translations lồng trong 1 relational query (RULE-09) |
| EC-15 | `resolveLocale('fr')` → en; translations rỗng → fallback |

## 9. NFR Design

- **NFR-01 (Perf/N+1):** relational query 1 round-trip, addon translations lồng `with`. Index: UNIQUE
  `(entity_id, locale)` phục vụ luôn lookup theo `entity_id` + filter `locale` (leftmost prefix). Không
  thêm query so với trước.
- **NFR-02 (Cache):** key thêm locale → 2 locale × slug (giới hạn, không bùng nổ). Tag không kèm locale →
  revalidate 1 lần. Áp dụng bugfix `{ expire: 0 }` (revalidate.ts) sẵn có.
- **NFR-03 (Data safety):** migration chỉ CREATE; seed idempotent `ON CONFLICT DO NOTHING`, backup JSON
  trước. Cột gốc không đổi.
- **NFR-04 (Reversibility):** rollback SQL `DROP TABLE ... CASCADE` 3 bảng; cột gốc còn → en nguyên vẹn.
- **NFR-05 (Compat):** đổi chữ ký service → cập nhật HẾT caller (section 11 File Change Plan liệt kê đủ).
- **NFR-06 (Maintainability):** thêm locale = routing + seed; resolver/form duyệt `routing.locales`.
- **NFR-07 (Admin UX):** không dịch label; tab rõ; badge; field không dịch ngoài tab.
- **NFR-08 (Robustness):** resolver + `resolveLocale` + `|| ""`/`?.` → không crash mọi edge (EC-01..06,11,15).
- **NFR-09 (Integrity):** ON DELETE CASCADE → không orphan.

## 10. Regression-safe Plan

| Module | Kế hoạch không phá vỡ |
|--------|----------------------|
| `src/services/products.ts` | Hàm admin (`getAdminProductTable`, `isExistingSlug`, `updateProductStatus`, search cột gốc…) GIỮ NGUYÊN chữ ký/hành vi. Chỉ thêm `locale` cho 6 hàm user-facing + thêm `with: { translations }` cho admin fetch (relation mới, không phá query cũ). |
| `src/services/cached/products.ts` | Thêm `locale` vào chữ ký + getKeyParts; tag giữ nguyên. Cập nhật MỌI caller (dish, FoodCategories, NewFood, quick API) — liệt kê section 11 để không sót (vỡ build). |
| `src/services/cart.ts` | `getCartProductsByIds` thêm `locale` + resolve; caller = server action (cập nhật cùng lúc). |
| `src/actions/admin/product.ts` + `category.ts` + hooks + `validations/product.ts` | Thêm nhánh `translations` vào zod + default values; upsert nằm TRONG tx `updateProductById` (không phá rollback tx). Slug uniqueness/revalidate giữ nguyên. |
| `src/db/schemas/products/*` + relations | Thêm 3 bảng + relation `translations`; `db.query...with` cũ (images/addons/category) vẫn resolve. **Sửa `productAddonRelations` `({ one })` → `({ one, many })`** (không phá relation `product`). Migration không đổi cột gốc. |
| `dish/[slug]/page.tsx` `generateMetadata` | Hiện gọi `getProductDetailsBySlugCached(slug)` **thiếu locale** ở CẢ generateMetadata lẫn page body. Fix: nhận `params.locale`, truyền vào CẢ HAI lần gọi để text metadata/trang khớp locale. `og:locale: "en_US"` (thuộc tính OpenGraph, KHÔNG phá build) GIỮ NGUYÊN — hoàn thiện theo locale ở sprint-4. |
| API `/api/products/quick` + `/ids` | Response shape giữ nguyên; chỉ nội dung text theo locale; thiếu locale → en (giỏ cũ không vỡ). |
| DB `dev_multi_lang` | Migration + seed giữ 100% dữ liệu; `/` (en) render y hệt trước. |

**Regression happy path (mục 10 requirements):** covered — admin create/edit product+category+addon lưu OK
+ nhập en/vi; `/` render như cũ; `/vi` fallback en; cart quick-add OK; xoá product/addon không orphan.

## 11. File Change Plan

**Tạo mới:**
- `src/db/schemas/products/product-translations.ts` — bảng + relations product.
- `src/db/schemas/products/product-category-translations.ts` — bảng + relations.
- `src/db/schemas/products/product-addon-translations.ts` — bảng + relations.
- `src/lib/locale.ts` — `resolveLocale`, `getRequestLocale`.
- `src/services/products/translations.ts` (hoặc thêm block trong `products.ts`) — `upsert*Translations` +
  resolver helper (`resolveProductFields`, `resolveAddon`, `resolveCategoryName`).
- `src/components/admin/features/products/form-elements/LocaleTabStrip.tsx` — presentational: tab strip +
  badge "Chưa dịch" + nút "Copy từ English" (props `activeLocale/onChange/untranslatedLocales/
  onCopyFromDefault`; KHÔNG state/context). (KHÔNG tạo `EntityLocaleTabs`/`LocalizedTextControl`.)
- `scripts/seed-entities-i18n.ts` — seed row en từ cột gốc (idempotent, backup, guard env).
- `scripts/rollback-entities-i18n.ts` — DROP 3 bảng CASCADE (guard + confirm).

**Sửa:**
- `src/db/schemas/products/index.ts` — export 3 bảng mới.
- `src/db/schemas/products/products.ts` — `productsRelations` thêm `translations: many`.
- `src/db/schemas/products/product-categories.ts` — thêm `translations: many`.
- `src/db/schemas/products/product-addons.ts` — `({ one })`→`({ one, many })` + `translations: many`.
- `src/types/products.ts` — types translation + form nested.
- `src/services/products.ts` — 6 hàm user-facing nhận `locale` + resolve; admin fetch thêm `with:
  { translations }`; `updateProductById`/`createProduct`/`updateProductCategory`/`addProductCategory` gọi
  upsert.
- `src/services/cached/products.ts` — thêm `locale` vào chữ ký + getKeyParts (5 hàm cached).
- `src/services/cart.ts` — `getCartProductsByIds` nhận `locale` + resolve.
- `src/actions/web/cart.ts` — `getCartProductsByIdsAction` nhận `locale`, forward.
- `src/actions/admin/product.ts` — nhận + forward `translations` (product + addons).
- `src/actions/admin/category.ts` — nhận + forward `translations`.
- `src/validations/product.ts` — thêm nhánh `translations` (en required, vi optional) cho product/category/
  addon schema.
- `src/hooks/admin/features/products/useUpdateProductForm.ts` + `useAddProductForm.ts` — default values
  `translations` + addon translations.
- `src/hooks/admin/features/categories/useCreateCategoryForm.ts` + `useUpdateCategoryForm.ts` — default
  `translations`.
- `src/components/admin/features/products/ProductDetailsProvider.tsx` — nâng state `activeLocale` +
  `setActiveLocale` vào context (product edit) để AddonsEditor dùng chung.
- `src/components/admin/features/products/ProductEditForm.tsx` — đặt `LocaleTabStrip` (activeLocale từ
  provider) + đổi `Controller name` các ô text sang `translations.<activeLocale>.<field>`.
- `src/components/admin/features/products/CreateProduct.tsx` — `useState` local activeLocale + `LocaleTabStrip`
  + bind `translations.<activeLocale>.title`.
- `src/components/admin/features/products/form-elements/AddonsEditor.tsx` — ô name bind
  `addons.<i>.translations.<activeLocale>.name` (activeLocale từ provider context).
- `src/components/admin/features/products/CreateCategory.tsx` — `useState` activeLocale + `LocaleTabStrip`
  quanh `name` (KHÔNG có description).
- `src/components/admin/features/categories/UpdateCategory.tsx` — `useState` activeLocale + `LocaleTabStrip`
  quanh `name` + `description` (nơi duy nhất nhập description EN/VI).
- `src/app/(web)/[locale]/dish/[slug]/page.tsx` — truyền `locale` (metadata + page + related).
- `src/app/(web)/[locale]/menu/[category]/page.tsx` — truyền `locale` xuống FoodCategories/NewFood.
- `src/components/web/features/menu/FoodCategories.tsx` — nhận `locale` prop → service.
- `src/components/web/features/menu/NewFood.tsx` — nhận `locale` prop → service.
- `src/app/(web)/api/products/quick/[id]/route.ts` — `getRequestLocale` → service.
- `src/app/(web)/api/products/ids/route.ts` — `getRequestLocale` → service.
- `src/constants/route.ts` — `productQuickApi(id, locale?)` append `?locale=`.
- `src/components/web/shared/quick-cart/QuickCartModal.tsx` — truyền `useLocale()` vào query.
- `src/hooks/web/products/useGetProductsDetailsByIds.ts` + `src/hooks/web/cart/useGetCartProducts.tsx` —
  truyền `locale` (từ `useLocale()`) vào action.
- `package.json` — scripts `seed:entities-i18n`, `rollback:entities-i18n`.

**KHÔNG sửa (ghi rõ):** home `page.tsx` (không render product), orders schema/service (snapshot — EC-12),
config/sprint-2, admin search (cột gốc — ASM-10), FK bảng chính.

## Migration & Seed Design

1. **Drizzle forward:** thêm 3 bảng → `npm run db:generate` (review SQL: chỉ CREATE TABLE + FK CASCADE +
   UNIQUE, KHÔNG ALTER/DROP cột gốc) → `DB_SCHEMA=dev_multi_lang npm run db:migrate`.
2. **Seed (`scripts/seed-entities-i18n.ts`):** dotenv `.env.local`/`.env`, `postgres` client riêng, guard
   `DB_SCHEMA`+`DATABASE_URL` (exit 1 nếu thiếu — EC-10). Backup JSON (products/categories/addons cột gốc)
   vào `scripts/backups/`. Với mỗi entity:
   `INSERT INTO <schema>.product_translations (product_id, locale, title, description, sub_description,
   allergen_info) SELECT id, 'en', title, description, sub_description, allergen_info FROM <schema>.products
   ON CONFLICT (product_id, locale) DO NOTHING;` (tương tự category/addon). Idempotent (AC-06.3), copy cả
   null (EC-01). Chạy: `DB_SCHEMA=dev_multi_lang npm run seed:entities-i18n`.
3. **Rollback (`scripts/rollback-entities-i18n.ts` / SQL):** `DROP TABLE <schema>.product_addon_translations,
   <schema>.product_category_translations, <schema>.product_translations CASCADE;` — cột gốc còn nguyên →
   en không mất (OQ-04/ASM-09).

---

## Self-review
- Mọi RULE-01..20, EC-01..15, NFR-01..09 có trong bảng section 8/9. ✓
- Mọi EC có error handling trong API contracts (section 6) / UI flow (section 7). ✓
- Mọi module Regression Impact có kế hoạch (section 10). ✓
- Không thêm endpoint/entity ngoài yêu cầu (chỉ 3 bảng + localize hàm/route đã có; `getCartProductsByIds`
  là nguồn cart THẬT thay cho `/api/products/ids` mà requirements nhầm). ✓
- Không xung đột convention (drizzle relational, cache helper, script tsx theo sprint-2). ✓

**Summary:** 3 entity translation (product/category/addon). Endpoint chạm: 2 API route
(`/api/products/quick/[id]`, `/api/products/ids`) + 1 server action cart. 7 hàm service user-facing localize
(6 theo RULE-08 + `getCartProductsByIds`). **Tech decisions cần user chú ý:** (1) tạo mới `LocaleTabStrip`
presentational + nâng `activeLocale` vào `ProductDetailsProvider` (product edit) / local state (create +
category), bind RHF trực tiếp — KHÔNG context/wrapper riêng; (2) localize `getCartProductsByIds` (nguồn cart
thật; `/api/products/ids` đã verify KHÔNG có caller); (3) OQ-02: order lưu snapshot → không dịch lại lịch
sử.
</content>
</invoke>
