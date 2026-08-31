# Tasks — sprint-3-entity-i18n (i18n cho entity DB: product / category / addon)

> Input: `design.md`, `ui-design.md`, `requirements.md`, `.sdlc/architecture.md`
> Verify: `tsc --noEmit` + `next build` (eslint repo hỏng sẵn — KHÔNG dùng để gate).
> Migration là schema THẬT → chạy trên `DB_SCHEMA=dev_multi_lang`, có backup + rollback, PHẢI verify DB.

## Thứ tự bắt buộc (design §3 THỨ TỰ PHỤ THUỘC)
Schema (TASK-01) → db:generate/migrate THẬT (TASK-02) → seed en THẬT (TASK-03). **3 bước NÀY tuần tự,
KHÔNG song song.** Sau đó: helper resolver/upsert (TASK-05) → service resolve products.ts (TASK-06) →
save upsert products.ts (TASK-07, cùng file nên sau TASK-06) → cached (TASK-08) → call-site + API +
cart (song song). Admin form: zod (TASK-14) + LocaleTabStrip (TASK-15) → hooks (TASK-16) → actions
(TASK-19) → forms (TASK-17/18). Bỏ sót call-site khi đổi chữ ký service = vỡ build.

## Waves (gợi ý cho execute — task cùng wave chạy song song được)
- **Wave 1:** TASK-01, TASK-04, TASK-15  (schema foundation ∥ locale helper ∥ LocaleTabStrip presentational)
- **Wave 2:** TASK-02  (db:generate + db:migrate THẬT — dep TASK-01)
- **Wave 3:** TASK-03, TASK-05, TASK-14  (seed THẬT dep 02 ∥ resolver/upsert helper dep 01 ∥ zod dep 01)
- **Wave 4:** TASK-06, TASK-09, TASK-16  (products.ts resolve dep 05 ∥ cart.ts dep 05 ∥ hooks dep 14)
- **Wave 5:** TASK-07, TASK-08  (products.ts save upsert dep 06 [cùng file] ∥ cached dep 06)
- **Wave 6:** TASK-10, TASK-11, TASK-12, TASK-13, TASK-19  (call-site/API/cart-client dep 08/09 ∥ actions dep 07+14)
- **Wave 7:** TASK-17, TASK-18  (product form dep 15/16/19 ∥ category forms dep 15/16/19)

---

- [x] TASK-01  (done)
  Description: Định nghĩa 3 bảng Drizzle translation trong `dbSchema` (`pgSchema(process.env.DB_SCHEMA)`) +
    relations + types. Cột gốc bảng chính KHÔNG đổi.
    - Tạo `product-translations.ts`: `id` serial PK, `product_id` integer NOT NULL FK→`products.id`
      `{ onDelete: "cascade" }`, `locale` varchar(10) NOT NULL, `title` varchar(255) nullable,
      `description` text nullable, `sub_description` text nullable, `allergen_info` text nullable,
      `created_at`/`updated_at` timestamptz notNull defaultNow, **UNIQUE(product_id, locale)**;
      `productTranslationsRelations` → `product: one(products)`.
    - Tạo `product-category-translations.ts`: `category_id` FK→`product_categories.id` cascade, `locale`
      varchar(10), `name` varchar(255) nullable, `description` varchar(1024) nullable, timestamps,
      **UNIQUE(category_id, locale)**; relations `category: one`.
    - Tạo `product-addon-translations.ts`: `addon_id` FK→`product_addons.id` cascade, `locale` varchar(10),
      `name` varchar(255) nullable, timestamps, **UNIQUE(addon_id, locale)**; relations `addon: one`.
    - Sửa relations bảng chính: `products.ts` `productsRelations` thêm `translations: many(productTranslations)`;
      `product-categories.ts` `productCategoriesRelations` thêm `translations: many`; `product-addons.ts`
      **đổi `productAddonRelations` từ `({ one })` → `({ one, many })`** + thêm `translations: many`.
    - `index.ts`: export 3 bảng + relations mới.
    - `src/types/products.ts`: thêm `ProductTranslationDB`/`New*`, `ProductCategoryTranslationDB`/`New*`,
      `ProductAddonTranslationDB`/`New*` (`$inferSelect`/`$inferInsert`) + form types `ProductTranslationForm`,
      `CategoryTranslationForm`, `AddonTranslationForm` (`Record<Locale, {...}>`). KHÔNG đổi `WebProduct*`.
  Serves: AC-06.1 (định nghĩa schema), EC-07, RULE-03, RULE-05, NFR-09; Data Model §5
  Design ref: design §5 (Data Model), §11 (File Change Plan tạo mới/sửa)
  Expected files: src/db/schemas/products/product-translations.ts,
    src/db/schemas/products/product-category-translations.ts,
    src/db/schemas/products/product-addon-translations.ts, src/db/schemas/products/index.ts,
    src/db/schemas/products/products.ts, src/db/schemas/products/product-categories.ts,
    src/db/schemas/products/product-addons.ts, src/types/products.ts
  Dependencies: none
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` sạch; `db.query.products.findMany({ with: { translations } })` type-check OK;
    relations cũ (images/addons/category) không vỡ; grep xác nhận 3 UNIQUE + 3 FK onDelete cascade.

- [x] TASK-02  (done)
  Description: Sinh + áp migration Drizzle THẬT. Chạy `npm run db:generate` → **REVIEW file SQL sinh ra**:
    xác nhận CHỈ có `CREATE TABLE` 3 bảng translation (+ FK cascade + UNIQUE), TUYỆT ĐỐI KHÔNG có
    `ALTER`/`DROP` cột gốc bảng chính (nếu có statement lạ → dừng, sửa snapshot, không migrate). Backup
    schema `dev_multi_lang` trước. Chạy `DB_SCHEMA=dev_multi_lang npm run db:migrate`. Verify bằng query
    DB: 3 bảng tồn tại với đúng cột/UNIQUE/FK cascade; cột gốc `products`/`product_categories`/
    `product_addons` NGUYÊN VẸN (không mất cột/dữ liệu).
  Serves: AC-06.1, EC-07, RULE-05, RULE-15, NFR-03, NFR-09
  Design ref: design §Migration & Seed Design (1), §3 (Risks migration), §10
  Expected files: src/db/migration/* (file migration sinh ra)
  Dependencies: TASK-01
  Suggested skill:
  Difficulty: normal
  Test: query `information_schema` trên `dev_multi_lang` xác nhận 3 bảng + UNIQUE(entity_id,locale) + FK
    ON DELETE CASCADE; `\d dev_multi_lang.products` cột gốc còn đủ; migration SQL không chứa ALTER/DROP
    cột gốc.

- [x] TASK-03  (done)
  Description: Seed en THẬT + rollback. `scripts/seed-entities-i18n.ts` (tsx standalone): dotenv
    `.env.local`/`.env`, tạo `postgres` client riêng từ `DATABASE_URL`, guard `DB_SCHEMA`+`DATABASE_URL`
    (thiếu → exit 1, EC-10). Backup JSON cột gốc products/categories/addons vào `scripts/backups/`. Với mỗi
    entity: `INSERT INTO <schema>.product_translations (product_id, locale, title, description,
    sub_description, allergen_info) SELECT id,'en',title,description,sub_description,allergen_info FROM
    <schema>.products ON CONFLICT (product_id, locale) DO NOTHING;` (tương tự category name+description,
    addon name). Copy cả null (EC-01). KHÔNG import `getDb()` (server-only). `scripts/rollback-entities-i18n.ts`
    (hoặc SQL): `DROP TABLE <schema>.product_addon_translations, product_category_translations,
    product_translations CASCADE;` (guard + confirm). Thêm `package.json` scripts `seed:entities-i18n`,
    `rollback:entities-i18n`; `.gitignore` cho `scripts/backups/` nếu cần. **CHẠY THẬT** trên
    `DB_SCHEMA=dev_multi_lang` + verify.
  Serves: AC-06.2, AC-06.3, AC-06.4, EC-01, EC-10, RULE-06, RULE-15, NFR-03, NFR-04
  Design ref: design §Migration & Seed Design (2)(3), §4 (script tsx theo migrate-configs)
  Expected files: scripts/seed-entities-i18n.ts, scripts/rollback-entities-i18n.ts, scripts/.gitignore,
    package.json
  Dependencies: TASK-02
  Suggested skill:
  Difficulty: normal
  Test: chạy `DB_SCHEMA=dev_multi_lang npm run seed:entities-i18n` → mỗi product/category/addon có row
    `locale='en'` = cột gốc; chạy lần 2 KHÔNG đổi/không trùng (idempotent); backup file được tạo; entity có
    cột gốc null → row en null; guard: thiếu DB_SCHEMA/DATABASE_URL → exit≠0. Rollback DROP 3 bảng, cột gốc
    còn nguyên.

- [x] TASK-04  (done)
  Description: Helper locale `src/lib/locale.ts` (KHÔNG `server-only` — script/route dùng được).
    `resolveLocale(input?: string): Locale` — input ∈ `routing.locales` → dùng; else `routing.defaultLocale`
    (RULE-04, EC-15). `getRequestLocale(request: Request): Locale` cho API route: thứ tự query `?locale=` →
    cookie `NEXT_LOCALE` → `Accept-Language` (parse primary tag) → `en` (RULE-14, EC-11). Locale-agnostic
    (duyệt `routing.locales`).
  Serves: EC-11, EC-15, RULE-04, RULE-14, NFR-08
  Design ref: design §2 (Tech decision 3), §4 (API getRequestLocale), §8 (RULE-04/14)
  Expected files: src/lib/locale.ts
  Dependencies: none
  Suggested skill:
  Difficulty: normal
  Test: unit: `resolveLocale('vi')='vi'`, `resolveLocale('fr')='en'`, `resolveLocale(undefined)='en'`;
    `getRequestLocale` ưu tiên query > cookie > Accept-Language > en; header rác → en.

- [x] TASK-05  (done)
  Description: Helper resolver + upsert dùng chung `src/services/products/translations.ts`. Resolver
    in-memory (COALESCE per-field, RULE-07): `resolveProductFields(base, translations, locale)` trả
    `{title,description,subDescription,allergenInfo}` = `translation.field || base.field` (rỗng/null cả hai →
    `""`/null, EC-01..04); `resolveCategoryFields(base, translations, locale)` (name+description, EC-06);
    `resolveAddon(base, translations, locale)` (name). Nhận mảng translation lồng (đã filter locale ở query)
    hoặc rỗng → fallback cột gốc (EC-02/05/15). Upsert (dùng trong tx, RULE-12): `upsertProductTranslations`,
    `upsertCategoryTranslations`, `upsertAddonTranslations` — `INSERT ... ON CONFLICT (entity_id, locale)
    DO UPDATE` cho từng locale trong record; nhận `tx?: DB`.
  Serves: EC-01, EC-02, EC-03, EC-04, EC-05, EC-06, EC-08, EC-09, EC-15, RULE-07, RULE-12, NFR-06, NFR-08
  Design ref: design §4 (helper upsert/resolver), §8 (RULE-07/12), §11
  Expected files: src/services/products/translations.ts
  Dependencies: TASK-01
  Suggested skill:
  Difficulty: normal
  Test: unit resolver: có bản vi → dùng vi; thiếu row vi → base; field vi rỗng → base cho field đó, field
    khác giữ vi; cả hai rỗng → ""/null; locale 'fr' → base. Upsert: locale mới INSERT, locale có DO UPDATE;
    idempotent.

- [x] TASK-06  (done)
  Description: Localize 6 hàm user-facing trong `src/services/products.ts` (RULE-08) + admin fetch kèm
    translations. Mỗi hàm nhận thêm `locale: Locale`, dùng drizzle relational `with: { translations: { where
    eq(locale) } }` (kèm addon.translations + category.translations lồng → 1 query, EC-14/NFR-01), rồi gọi
    resolver (TASK-05) COALESCE về cột gốc TRƯỚC khi trả; **shape trả GIỮ NGUYÊN** (ASM-04).
    6 hàm: `getProductDetailsBySlug`, `getProductBySlug`, `getProductsByCategorySlug`,
    `getMultipleProductsByIds`, `getProductsDetailsByIds`, `getProductDetailsForQuickCartById`.
    Admin fetch (KHÔNG resolve, trả MỌI translation cho form {en,vi}, RULE-13): `getAdminProductById`,
    `getAdminProductDetailsById`, `getCategoryWithProducts` thêm `with: { translations }` (+ addon
    translations). Hàm admin khác (`getAdminProductTable`, `isExistingSlug`, `updateProductStatus`, search)
    GIỮ NGUYÊN chữ ký/hành vi (ASM-10, §10).
  Serves: AC-04.1, AC-04.2, AC-04.3, AC-04.4, AC-04.6, EC-02, EC-03, EC-05, EC-06, EC-14, RULE-08, RULE-09,
    RULE-11, RULE-13, NFR-01, NFR-08
  Design ref: design §4 (service resolve), §8 (RULE-08/09/13), §10 (regression products.ts)
  Expected files: src/services/products.ts
  Dependencies: TASK-05
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; gọi `en` vs `vi` trả text khác; thiếu vi → fallback en; addon list resolve trong 1
    query (không N+1, kiểm bằng log/inspection); hàm admin trả entity + mảng translation đủ locale; hàm
    admin table không đổi. (Build gate cùng TASK-10/11/12.)

- [x] TASK-07  (done)
  Description: Wire upsert translation vào save admin trong `src/services/products.ts` (RULE-12, trong
    transaction hiện có). `updateProductById` (đã dùng tx): nhận `translations` (product + addons) → gọi
    `upsertProductTranslations` + `upsertAddonTranslations` cho từng addon (addon mới: tạo addon → returning
    id → upsert, EC-08; addon xoá pre-save: không tạo orphan, EC-08/AC-02.3) + set cột gốc = bản `en`.
    `createProduct`: sau insert product → upsert row en (+ vi nếu có) + cột gốc = en. `addProductCategory`/
    `updateProductCategory`: upsert category translation en+vi + cột gốc = en. Clear field vi → set rỗng
    (không xoá row, EC-09). Slug uniqueness/revalidate GIỮ NGUYÊN.
  Serves: AC-01.2, AC-01.4, AC-02.1, AC-02.2, AC-02.3, EC-08, EC-09, RULE-06, RULE-12, DAC-04
  Design ref: design §4 (save upsert), §8 (RULE-12), §10 (actions/tx)
  Expected files: src/services/products.ts
  Dependencies: TASK-06
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; unit/integration: lưu product với title en≠vi → 2 row translation + cột gốc=en;
    addon mới → tạo addon rồi row translation; addon xoá pre-save → không orphan; category en+vi → 2 row +
    cột gốc=en; tx rollback khi lỗi vẫn nguyên vẹn.

- [x] TASK-08  (done)
  Description: Cache per-locale. Trong `src/services/cached/products.ts` đổi 5 hàm cached thêm `locale:
    Locale` vào chữ ký + `getKeyParts` (key chứa locale, EC-13/AC-07.1), **tag GIỮ NGUYÊN** không kèm locale
    (`PRODUCTS.BY_SLUG/BY_CATEGORY/ALL`, RULE-10/AC-07.2) → revalidate 1 lần xoá mọi locale: `getProductBySlugCached`,
    `getProductDetailsBySlugCached`, `getProductsByCategorySlugCached`, `getRelatedProductsCached`,
    `getProductDetailsForQuickCartByIdCached`. Forward `locale` xuống service base (TASK-06). Áp bugfix
    `{ expire: 0 }` (revalidate.ts) sẵn có. `revalidateProduct*` KHÔNG cần đổi.
  Serves: AC-04.5, AC-07.1, AC-07.2, EC-13, RULE-10, NFR-02
  Design ref: design §4 (cached per-locale), §8 (RULE-10), §9 (NFR-02)
  Expected files: src/services/cached/products.ts
  Dependencies: TASK-06
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; gọi `en`/`vi` → key khác (locale trong keyParts), tag theo slug/category không kèm
    locale; revalidateTag BY_SLUG xoá cả 2 locale. (Build gate cùng call-site.)

- [x] TASK-09  (done)
  Description: Localize cart realtime (nguồn cart THẬT). `src/services/cart.ts` `getCartProductsByIds` nhận
    `locale: Locale` → relational `with { translations where locale }` (product + addon) → resolver
    (TASK-05) COALESCE; shape giữ nguyên (title/addons[].name/category theo locale, fallback en). Locale sai
    → `resolveLocale` → en. `src/actions/web/cart.ts` `getCartProductsByIdsAction` nhận `locale` trong input
    → forward. `getCartProductsByIdsCached` (nếu dùng) thêm locale vào keyParts, tag giữ nguyên. KHÔNG đụng
    orders (snapshot — EC-12).
  Serves: AC-05.2, EC-12, EC-15, RULE-08, RULE-09, NFR-08
  Design ref: design §3 (Discrepancy cart), §6 (server action cart), §8
  Expected files: src/services/cart.ts, src/actions/web/cart.ts
  Dependencies: TASK-05
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; gọi action với locale vi → tên món/addon vi (fallback en); locale sai → en; giỏ
    rỗng → []; orders service KHÔNG đổi.

- [x] TASK-10  (done)
  Description: Call-site dish detail. `src/app/(web)/[locale]/dish/[slug]/page.tsx`: đọc `params.locale`,
    truyền vào `getProductDetailsBySlugCached(slug, locale)` + `getRelatedProductsCached(ids, locale)` trong
    page body VÀ trong `generateMetadata` (fix: hiện gọi thiếu locale ở CẢ HAI → text metadata/trang khớp
    locale). `og:locale: "en_US"` GIỮ NGUYÊN (hoàn thiện sprint-4).
  Serves: AC-04.1, AC-04.2, AC-04.3, NFR-05, RULE-11
  Design ref: design §4 (dish page), §3 (generateMetadata NOTE), §10, §11
  Expected files: src/app/(web)/[locale]/dish/[slug]/page.tsx
  Dependencies: TASK-08
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` + `next build`; `/vi/dish/[slug]` bản vi, `/dish/[slug]` en; metadata title/desc khớp
    locale; không call-site thiếu arg.

- [x] TASK-11  (done)
  Description: Call-site menu. `src/app/(web)/[locale]/menu/[category]/page.tsx` truyền `locale` xuống
    `<FoodCategories locale>` + `<NewFood locale>`. `src/components/web/features/menu/FoodCategories.tsx`
    nhận `locale` prop → `getProductsByCategorySlugCached(key, locale)`. `NewFood.tsx` nhận `locale` →
    `getProductBySlugCached(slug, locale)`. Component render GIỮ NGUYÊN (nhận string đã resolve). Home page
    KHÔNG render product → KHÔNG sửa (design §3).
  Serves: AC-04.4, AC-04.5, AC-04.6, NFR-05, RULE-11
  Design ref: design §4 (menu), §3 (Home page bỏ), §11
  Expected files: src/app/(web)/[locale]/menu/[category]/page.tsx,
    src/components/web/features/menu/FoodCategories.tsx, src/components/web/features/menu/NewFood.tsx
  Dependencies: TASK-08
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` + `next build`; `/vi/menu/[category]` tên danh mục/món/addon vi (fallback en);
    field non-dịch (giá/ảnh) không đổi.

- [x] TASK-12  (done)
  Description: API + client quick-cart. `src/app/(web)/api/products/quick/[id]/route.ts` dùng
    `getRequestLocale(request)` → `getProductDetailsForQuickCartByIdCached(id, locale)`. `src/app/(web)/api/
    products/ids/route.ts` dùng `getRequestLocale` → `getProductsDetailsByIds(ids, locale)` (KHÔNG wrap
    cache). Response shape GIỮ NGUYÊN. `src/constants/route.ts` `productQuickApi(id, locale?)` append
    `?locale=`. `src/components/web/shared/quick-cart/QuickCartModal.tsx` truyền `useLocale()` vào query.
  Serves: AC-05.1, AC-05.2, EC-11, EC-15, RULE-11, RULE-14, NFR-05
  Design ref: design §6 (API contracts quick + ids), §4, §11
  Expected files: src/app/(web)/api/products/quick/[id]/route.ts, src/app/(web)/api/products/ids/route.ts,
    src/constants/route.ts, src/components/web/shared/quick-cart/QuickCartModal.tsx
  Dependencies: TASK-08, TASK-06, TASK-04
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` + `next build`; GET `/api/products/quick/[id]?locale=vi` title/addon vi; thiếu locale
    → en (EC-11); locale sai → en (EC-15); ids rỗng → `{products:[]}`; QuickCartModal gửi `?locale=`.

- [x] TASK-13  (done)
  Description: Client cart hooks truyền locale. `src/hooks/web/cart/useGetCartProducts.tsx` +
    `src/hooks/web/products/useGetProductsDetailsByIds.ts` lấy `useLocale()` (next-intl) truyền `locale`
    vào action/query tương ứng (getCartProductsByIdsAction / API ids). KHÔNG đổi shape trả về.
  Serves: AC-05.2, NFR-05
  Design ref: design §6 (client caller), §11
  Expected files: src/hooks/web/cart/useGetCartProducts.tsx,
    src/hooks/web/products/useGetProductsDetailsByIds.ts
  Dependencies: TASK-09
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; ở `/vi` giỏ hiển thị tên món/addon vi (fallback en); ở `/` en.

- [x] TASK-14  (done)
  Description: Zod translations. `src/validations/product.ts` thêm nhánh `translations: { en:{...},
    vi:{...} }` cho product/category/addon schema: bản `en` (defaultLocale) required field bắt buộc
    (title/name non-empty), bản `vi` optional (cho phép rỗng → fallback, AC-01.4). Field text áp `.max`
    khớp cột (title/name 255, category description 1024). Addon: `addons[].translations.{en,vi}.name`.
    Field không dịch giữ validate cũ. Coerce dữ liệu cũ (chưa có translations) không vỡ (EC-05).
  Serves: AC-01.4, EC-05, RULE-01, RULE-02, RULE-19, NFR-07
  Design ref: design §2 (Tech decision 5 zod), §7 (data shape form)
  Expected files: src/validations/product.ts
  Dependencies: TASK-01
  Suggested skill:
  Difficulty: normal
  Test: unit: translations {en,vi} hợp lệ; en title/name rỗng → lỗi required; vi rỗng → OK; text >max →
    lỗi; payload cũ không có translations → không throw (default seed).

- [x] TASK-15  (done)
  Description: Component presentational `src/components/admin/features/products/form-elements/LocaleTabStrip.tsx`
    (`"use client"`, KHÔNG state/context). Props: `locales, defaultLocale, activeLocale, onChange,
    isMissing?, onCopyFromDefault?, showCopy?, className?`. Render `role="tablist"` `tabs tabs-box tabs-xs`
    map `routing.locales` (defaultLocale trước); mỗi locale `<button role="tab" type="button">` →
    `tab`/`tab tab-active`, nhãn từ `{en:"Tiếng Anh",vi:"Tiếng Việt"}` fallback `locale.toUpperCase()`;
    locale non-default `isMissing(locale)` → badge `badge badge-warning badge-xs` "Chưa dịch"; `showCopy`
    → `btn btn-ghost btn-xs text-primary` "Copy từ English" gọi `onCopyFromDefault`. Chỉ class daisyui
    (no hex/inline), responsive 360px, giữ focus ring, keyboard Enter/Space. Locale-agnostic.
  Serves: AC-03.1, AC-03.2, AC-03.3, AC-01.5, RULE-16, RULE-17, RULE-18, RULE-20, NFR-06, NFR-07,
    DAC-06, DAC-07, DAC-08, DAC-13, DAC-14, DAC-15, DAC-16
  Design ref: ui-design.md (Component spec LocaleTabStrip, States, DAC); design §4, §7
  Expected files: src/components/admin/features/products/form-elements/LocaleTabStrip.tsx
  Dependencies: none
  Suggested skill:
  Difficulty: normal
  Test: render → count tab === routing.locales.length; isMissing(vi)=true → badge "Chưa dịch"; đủ → không
    badge; showCopy → nút, click gọi onCopyFromDefault (no network); grep no hex/inline style; tabs là
    `<button type="button">` (không submit form).

- [x] TASK-16  (done)
  Description: Default values form (RULE-19 shape). Hooks product: `src/hooks/admin/features/products/
    useUpdateProductForm.ts` + `useAddProductForm.ts` — default `translations: { en:{...}, vi:{...} }` +
    `addons[].translations.{en,vi}.name`; khi load entity cũ map mảng translation → record {en,vi}, thiếu
    row en → seed từ cột gốc, vi rỗng (EC-05/DAC-12). Hooks category: `useCreateCategoryForm.ts` +
    `useUpdateCategoryForm.ts` — default `translations.{en,vi}.{name,description}`.
  Serves: EC-05, RULE-19, DAC-12
  Design ref: design §7 (data shape form, load map), §11 (hooks)
  Expected files: src/hooks/admin/features/products/useUpdateProductForm.ts,
    src/hooks/admin/features/products/useAddProductForm.ts,
    src/hooks/admin/features/categories/useCreateCategoryForm.ts,
    src/hooks/admin/features/categories/useUpdateCategoryForm.ts
  Dependencies: TASK-14
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; mở form product cũ chưa có vi → tab en seed cột gốc, vi rỗng, không crash;
    defaultValues khớp path nested `translations.<locale>.<field>`.

- [x] TASK-17  (done)
  Description: Product form admin. `ProductDetailsProvider.tsx` nâng `activeLocale` + `setActiveLocale` vào
    context (default `routing.defaultLocale`) để `AddonsEditor` dùng chung. `ProductEditForm.tsx`: đặt
    `<LocaleTabStrip>` đầu card "Thông tin cơ bản" (activeLocale từ provider); đổi `Controller name` các ô
    text → `translations.${activeLocale}.{title,allergenInfo,subDescription,description}`; MOVE `slug` ra
    ngoài tab (shared, divider `border-t border-base-300 pt-4`), slug-generate đọc
    `translations.${defaultLocale}.title`; cột phải/images/related GIỮ NGUYÊN ngoài tab. `AddonsEditor.tsx`:
    ô name bind `addons.${i}.translations.${activeLocale}.name` (activeLocale từ context), price/isActive
    flat. `CreateProduct.tsx`: `useState` local activeLocale + `<LocaleTabStrip>` trên title, bind
    `translations.${activeLocale}.title`. Badge `isMissing` + Copy tính client (`useWatch`) cho cả basic
    fields + addon names. Label VN giữ nguyên.
  Serves: AC-01.1, AC-01.3, AC-01.5, AC-02.2, AC-02.3, AC-03.1, AC-03.3, DAC-01, DAC-02, DAC-03, DAC-04,
    DAC-05, DAC-06, DAC-08, DAC-09, DAC-10, DAC-11, DAC-12, NFR-07
  Design ref: ui-design.md §A (product edit) + §B (create), design §7
  Expected files: src/components/admin/features/products/ProductDetailsProvider.tsx,
    src/components/admin/features/products/ProductEditForm.tsx,
    src/components/admin/features/products/form-elements/AddonsEditor.tsx,
    src/components/admin/features/products/CreateProduct.tsx
  Dependencies: TASK-15, TASK-16, TASK-19
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` + `next build`; đúng 1 tablist trên card; đổi tab swap tất cả field dịch (gồm addon
    name) đồng thời, giá trị tab kia không mất; slug/price/images không đổi khi đổi tab; badge vi khi thiếu;
    Copy từ English điền vi; save → translations {en,vi} + addon translations; addon xoá pre-save không
    orphan.

- [x] TASK-18  (done)
  Description: Category forms admin. `CreateCategory.tsx`: `useState` local activeLocale + `<LocaleTabStrip>`
    trên `name`, bind `translations.${activeLocale}.name`; `slug` ngoài tab, slug-generate đọc
    `translations.${defaultLocale}.name`; KHÔNG có description ở create. `categories/UpdateCategory.tsx`:
    `useState` activeLocale + `<LocaleTabStrip>` bọc CẢ `name` + `description`
    (`translations.${activeLocale}.{name,description}`, Textarea rows=3); `slug`/`isActive` ngoài tab; nơi
    DUY NHẤT nhập description EN/VI. Badge + Copy cho cả 2 field. Loading state giữ nguyên. Label VN.
  Serves: AC-02.1, AC-01.5, AC-03.1, AC-03.3, DAC-05, DAC-06, DAC-08, DAC-11, DAC-11b, NFR-07
  Design ref: ui-design.md §C (create) + §D (edit), design §7 (Category form)
  Expected files: src/components/admin/features/products/CreateCategory.tsx,
    src/components/admin/features/categories/UpdateCategory.tsx
  Dependencies: TASK-15, TASK-16, TASK-19
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit` + `next build`; CreateCategory: 1 tablist trên name (no description), slug shared;
    UpdateCategory: tablist bọc name+description, đổi tab swap cả hai; save → translations {en,vi}.{name,
    description}; badge vi khi thiếu.

- [x] TASK-19  (done)
  Description: Actions admin forward translations. `src/actions/admin/product.ts`: nhận + forward
    `translations` (product + addons) xuống `createProduct`/`updateProductById` (map `translations.en` →
    cột gốc + gửi record đầy đủ upsert). `src/actions/admin/category.ts`: nhận + forward `translations`
    xuống `addProductCategory`/`updateProductCategory`. Slug uniqueness/revalidate GIỮ NGUYÊN.
  Serves: AC-01.2, AC-02.1, AC-02.2, DAC-04, RULE-12, NFR-05
  Design ref: design §10 (actions), §11
  Expected files: src/actions/admin/product.ts, src/actions/admin/category.ts
  Dependencies: TASK-07, TASK-14
  Suggested skill:
  Difficulty: normal
  Test: `tsc --noEmit`; action nhận payload translations → service upsert 2 locale + cột gốc=en; validate
    zod chạy trước; revalidate sau save đúng.

---

## Coverage — AC / EC / NFR / DAC → task

| ID | Task(s) |
|---|---|
| AC-01.1 | TASK-15, TASK-17 |
| AC-01.2 | TASK-07, TASK-19 |
| AC-01.3 | TASK-17 |
| AC-01.4 | TASK-07, TASK-14 |
| AC-01.5 | TASK-15, TASK-17, TASK-18 |
| AC-02.1 | TASK-07, TASK-18, TASK-19 |
| AC-02.2 | TASK-07, TASK-17, TASK-19 |
| AC-02.3 | TASK-07, TASK-17 |
| AC-03.1 | TASK-15, TASK-17, TASK-18 |
| AC-03.2 | TASK-15 |
| AC-03.3 | TASK-15, TASK-17, TASK-18 |
| AC-04.1 | TASK-06, TASK-08, TASK-10 |
| AC-04.2 | TASK-06, TASK-08, TASK-10 |
| AC-04.3 | TASK-06, TASK-10 |
| AC-04.4 | TASK-06, TASK-08, TASK-11 |
| AC-04.5 | TASK-08, TASK-11 |
| AC-04.6 | TASK-06, TASK-11 |
| AC-05.1 | TASK-12 |
| AC-05.2 | TASK-09, TASK-12, TASK-13 |
| AC-06.1 | TASK-01, TASK-02 |
| AC-06.2 | TASK-03 |
| AC-06.3 | TASK-03 |
| AC-06.4 | TASK-03 |
| AC-07.1 | TASK-08 |
| AC-07.2 | TASK-08 |
| EC-01 | TASK-03, TASK-05 |
| EC-02 | TASK-05, TASK-06 |
| EC-03 | TASK-05, TASK-06 |
| EC-04 | TASK-05 |
| EC-05 | TASK-05, TASK-06, TASK-14, TASK-16 |
| EC-06 | TASK-05, TASK-06, TASK-11 |
| EC-07 | TASK-01, TASK-02 |
| EC-08 | TASK-07 |
| EC-09 | TASK-07 |
| EC-10 | TASK-03 |
| EC-11 | TASK-04, TASK-12 |
| EC-12 | TASK-09 (realtime localize; orders KHÔNG đụng — snapshot) |
| EC-13 | TASK-08 |
| EC-14 | TASK-06 |
| EC-15 | TASK-04, TASK-05, TASK-09, TASK-12 |
| NFR-01 | TASK-06 |
| NFR-02 | TASK-08 |
| NFR-03 | TASK-02, TASK-03 |
| NFR-04 | TASK-03 |
| NFR-05 | TASK-10, TASK-11, TASK-12, TASK-13, TASK-19 |
| NFR-06 | TASK-05, TASK-15 |
| NFR-07 | TASK-14, TASK-15, TASK-17, TASK-18 |
| NFR-08 | TASK-04, TASK-05, TASK-06, TASK-09 |
| NFR-09 | TASK-01, TASK-02 |
| DAC-01 | TASK-17 |
| DAC-02 | TASK-17 |
| DAC-03 | TASK-17 |
| DAC-04 | TASK-07, TASK-17, TASK-19 |
| DAC-05 | TASK-17, TASK-18 |
| DAC-06 | TASK-15, TASK-17, TASK-18 |
| DAC-07 | TASK-15 |
| DAC-08 | TASK-15, TASK-17, TASK-18 |
| DAC-09 | TASK-17 |
| DAC-10 | TASK-17 |
| DAC-11 | TASK-17, TASK-18 |
| DAC-11b | TASK-18 |
| DAC-12 | TASK-16, TASK-17 |
| DAC-13 | TASK-15 |
| DAC-14 | TASK-15 |
| DAC-15 | TASK-15 |
| DAC-16 | TASK-15 |

## Regression happy path (qa-guard — requirements §10)
1. Admin tạo/sửa 1 product (title/price/slug/ảnh/addon/related) lưu OK như trước + nhập được tab EN/VI
   (TASK-07, TASK-17, TASK-19).
2. Admin sửa category + addon lưu OK; cột gốc + row en/vi khớp (TASK-07, TASK-18, TASK-19).
3. `/` (en): `/menu/[category]`, `/dish/[slug]` render đầy đủ như trước migration (TASK-06, TASK-08,
   TASK-10, TASK-11).
4. `/vi/menu/...` + `/vi/dish/...` hiển thị vi khi có, fallback en khi thiếu, không trang trắng (TASK-06,
   TASK-08, TASK-10, TASK-11).
5. Cart quick-add + xem giỏ hoạt động (tên theo locale, fallback en) (TASK-09, TASK-12, TASK-13).
6. Xoá product/addon không orphan translation — CASCADE (TASK-01, TASK-02).

## Self-review
- Mọi AC-01..07, EC-01..15, NFR-01..09, DAC-01..16 (gồm DAC-11b) có ≥1 task sở hữu (bảng trên). ✔
- Task song song đánh dấu theo Wave; schema→migrate→seed (TASK-01→02→03) TUẦN TỰ, không cùng wave. ✔
- Hai task cùng file `products.ts` (TASK-06 resolve, TASK-07 save) tách wave tuần tự để tránh xung đột. ✔
- Đổi chữ ký service (TASK-06/08/09) → mọi call-site (TASK-10/11/12/13) + actions (TASK-19) phủ đủ, tránh
  vỡ build (NFR-05). ✔
- Migration là schema THẬT → TASK-02 (db:migrate) + TASK-03 (seed) đều CHẠY THẬT trên dev_multi_lang +
  verify DB (giống sprint-2). ✔
- Mỗi task có tiêu chí test rõ. ✔
- Không task nào `Difficulty: high`: tất cả là mở rộng schema/service/component theo pattern sprint-2 sẵn
  có; logic khó nhất (resolver COALESCE, upsert idempotent) tập trung TASK-05 + unit-test trực tiếp; upsert
  trong tx tái dùng transaction `updateProductById` sẵn có — không thuộc nhóm cần Opus-first (không có
  thuật toán phức tạp/concurrency/crypto/refactor diện rộng). ✔
