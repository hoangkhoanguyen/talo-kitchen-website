# Requirements — sprint-3-entity-i18n (Loại A: i18n cho entity DB)

> Project: Talo Kitchen | Version v1 (i18n EN + VI) | Phụ thuộc: sprint-1-i18n-foundation (done),
> nhất quán pattern với sprint-2-config-i18n (done).
> Phạm vi: localize nội dung động lưu trong bảng entity DB — `products`, `product_categories`,
> `product_addons` — bằng bảng translation riêng, service resolve theo locale + fallback `en`, và tab
> ngôn ngữ trong form admin. KHÔNG đụng config (sprint-2 đã xong).

---

# PART 1 — HUMAN REVIEW (đọc phần này trước)

## 1. Sprint Goal & Scope

**Mục tiêu:** Cho phép admin nhập tên/mô tả sản phẩm, danh mục, addon theo cả EN + VI; website user hiển
thị đúng theo locale URL đang xem (`/`=en, `/vi`), fallback `en` khi thiếu bản dịch. Đây là **schema
migration THẬT** (khác sprint-2 chỉ đổi JSON): tạo 3 bảng `*_translations`, seed bản `en` từ cột gốc, cột
gốc trên bảng chính giữ nguyên làm bản English/fallback. Kiến trúc locale-agnostic: thêm ngôn ngữ thứ 3 =
thêm row translation, KHÔNG đập lại schema.

**Đối tượng hưởng lợi:** (a) khách xem web ở `/vi` thấy tên/mô tả món, danh mục, addon bằng tiếng Việt;
(b) admin nhập được cả 2 bản ngôn ngữ trong form sản phẩm/danh mục/addon.

**Field CẦN dịch (chỉ text người đọc):**
- `products`: `title`, `description`, `sub_description`, `allergen_info`
- `product_categories`: `name`, `description`
- `product_addons`: `name`

### ✅ In scope
- 3 bảng translation Drizzle (schema qua `DB_SCHEMA`, dev = `dev_multi_lang`): `product_translations`,
  `product_category_translations`, `product_addon_translations`. Unique `(entity_id, locale)`, FK tới bảng
  cha + ON DELETE CASCADE.
- Cột gốc trên bảng chính giữ nguyên = bản `en`/fallback (KHÔNG bỏ cột cũ).
- Migration 2 phần: (a) Drizzle schema migration tạo 3 bảng (`db:generate` + `db:migrate`); (b) script seed
  bản `en` từ dữ liệu cột gốc hiện tại (idempotent, backup trước, chạy vào `DB_SCHEMA`). Giữ nguyên 100%
  dữ liệu hiện có.
- Sửa `src/services/products.ts` + `src/services/cached/products.ts`: các hàm user-facing NHẬN thêm `locale`,
  JOIN translation theo locale, fallback `en` (cột gốc/row en) khi thiếu. Cache user-facing thêm `locale`
  vào key (tag giữ nguyên, nhất quán sprint-2).
- Cập nhật MỌI caller user-facing truyền `locale`: `dish/[slug]/page.tsx` (detail + related + metadata),
  `menu/[category]/page.tsx` → `FoodCategories`, `NewFood`, home `NewFood`/`RelatedProducts`/product cards,
  và API `src/app/(web)/api/products/quick/[id]` + `.../ids` (nguồn cho cart/checkout quick-add).
- Admin: dải tab `[Tiếng Anh][Tiếng Việt]` ở đầu form sản phẩm / danh mục / addon; BỌC quanh input text
  hiện có (title/description/sub_description/allergen_info/name), KHÔNG viết lại từng input. Field không dịch
  (price/slug/priority/isActive/ảnh/category/related) hiển thị chung, KHÔNG nằm trong tab. Khi lưu: upsert
  vào bảng translation theo locale.
- Badge "chưa dịch" cho entity thiếu bản `vi`. (Tuỳ chọn) nút "Copy từ English".

### ❌ Out of scope
- Config `configs` (`config_type` `ui`/`app`) → sprint-2 đã xong, KHÔNG đụng.
- Dịch giao diện/label admin (giữ nguyên tiếng Việt) — chỉ thêm khả năng nhập nội dung theo locale.
- Field non-dịch: `slug`, `price`, `priority`, `is_active`, ảnh (`product_images`), số, boolean, `id`,
  `category_id`, `related_product_ids`, `sort_order`.
- SEO hreflang / `generateMetadata` per-locale hoàn chỉnh / format tiền-ngày → sprint-4-i18n-polish (sprint
  này chỉ đảm bảo `generateMetadata` của dish/menu resolve đúng string theo locale khi đọc entity).
- Dịch ngược nội dung reviews (SerpApi) — không thuộc entity products.
- Admin table/filter search đa ngôn ngữ (search vẫn theo cột gốc `en`) — xem OQ-05.

## 2. Open Questions (cần user quyết; nếu không trả lời → dùng Assumption kèm theo)

- **OQ-01 — API `/api/products/*` lấy locale từ đâu?** Các route này bị `proxy.ts` loại khỏi next-intl (không
  có `[locale]` trong path), nên phải TỰ xác định locale. *Assumption (ASM-06):* thứ tự ưu tiên nhất quán
  với middleware sprint-1: query param `?locale=` (nếu client gửi) → cookie `NEXT_LOCALE` → `Accept-Language`
  → default `en`. Ưu tiên client (cart/checkout đang ở trang `[locale]`) truyền `?locale=<current>` tường
  minh để chắc chắn. Xem RULE-14, EC-11.
- **OQ-02 — Addon/product hiển thị trong cart & order đã lưu theo locale nào?** Khi khách đã đặt hàng, order
  lưu snapshot tên món/addon. *Assumption (ASM-07):* sprint-3 CHỈ đổi hiển thị **realtime** (cart trước khi
  đặt, quick-cart) theo locale hiện hành. Order ĐÃ LƯU giữ nguyên snapshot text tại thời điểm đặt (không
  dịch lại lịch sử) — thuộc domain orders, ngoài scope entity i18n. Nếu order chưa snapshot tên (chỉ lưu
  id) → hiển thị theo locale người xem, fallback en. Cần xác nhận orders lưu gì. Xem EC-12.
- **OQ-03 — Product/category/addon MỚI tạo chưa có row translation.** *Assumption (ASM-08):* khi tạo entity,
  cột gốc luôn có (form bắt buộc bản `en`/mặc định); resolve locale khác thiếu row → fallback về cột gốc.
  Tạo entity nên upsert luôn row `en` từ cột gốc để nhất quán (cột gốc = source of truth cho en). Xem
  RULE-08, RULE-12, EC-05.
- **OQ-04 — Rollback schema migration.** Drizzle migration tạo bảng là forward-only theo mặc định. *Assumption
  (ASM-09):* cung cấp (a) forward Drizzle migration (`db:generate`), (b) seed script idempotent + backup,
  (c) rollback SQL thủ công `DROP TABLE ... CASCADE` cho 3 bảng translation (an toàn vì cột gốc còn nguyên,
  không mất dữ liệu en). Rollback KHÔNG đụng cột gốc. Xem RULE-15, EC-10.
- **OQ-05 — Admin search/filter theo bản dịch?** Admin table search hiện `ilike` trên cột gốc
  (`products.title/description/slug`, `categories.name/description`). *Assumption (ASM-10):* GIỮ NGUYÊN
  search theo cột gốc (`en`) ở sprint này (đơn giản, không regress). Search theo bản `vi` = enhancement
  tương lai.
- **OQ-06 — `allergen_info`/`description` để trống khi seed en.** Cột gốc `allergen_info`, `sub_description`,
  `description` nullable; `category.description` nullable. *Assumption (ASM-11):* seed row `en` copy đúng giá
  trị hiện tại (kể cả `null`/`""`). Khi resolve, giá trị rỗng/null của locale → fallback cột gốc; cột gốc
  rỗng/null → trả `null`/`""` (component đã xử optional bằng `?.`/`|| ""`, không crash). Xem EC-06.

## 3. Key Assumptions (tôi tự quyết từ business logic — user có thể override)

- **ASM-01 (locale-agnostic):** Locale hợp lệ lấy từ `src/i18n/routing.ts` (`en` default, `vi`). KHÔNG hardcode
  locale trong schema/service. Cột `locale` trong bảng translation là `varchar` tự do (validate ở service,
  không enum DB) để thêm ngôn ngữ 3 chỉ cần thêm vào routing + seed row, không đổi schema. Nhất quán ASM-01
  của sprint-2.
- **ASM-02 (cột gốc = fallback en):** Cột gốc trên bảng chính (`products.title`, `productCategories.name`,
  `productAddons.name`, …) là bản English chính thức. Row `product_translations.locale='en'` seed từ cột
  gốc là bản sao khởi tạo. Fallback resolve LUÔN về cột gốc (đảm bảo không bao giờ mất English kể cả khi
  thiếu cả row en). Xem RULE-07.
- **ASM-03 (JOIN 1 lần, không N+1):** Service resolve bằng LEFT JOIN translation theo `locale` trong CÙNG
  query (hoặc `with` relation có `where locale=`), KHÔNG query lặp từng entity. Giữ nguyên số DB round-trip
  như trước sprint. Xem NFR-01.
- **ASM-04 (component không đổi shape):** Service trả về CÙNG shape như trước sprint (các field đã là string
  đã resolve theo locale). Component user (`ProductCard`, `ProductInformation`, `RelatedProducts`,
  `FoodCategories`, `NewFood`) KHÔNG phải sửa logic hiển thị — chỉ nguồn dữ liệu đổi. Xem RULE-11.
- **ASM-05 (cache nhất quán sprint-2):** Cache user-facing thêm `locale` vào **key parts** (tách bản dịch),
  GIỮ NGUYÊN tag (`PRODUCTS.BY_SLUG(slug)`, `PRODUCTS.BY_CATEGORY(id)`, `PRODUCTS.ALL`) KHÔNG kèm locale →
  1 lần `revalidateTag` xoá mọi locale (giống RULE-08 sprint-2). Vì `createDynamicCachedFunction` truyền
  cùng args cho `getKeyParts`/`getTags`, chỉ cần thêm `locale` vào chữ ký fn + `getKeyParts`.
- **ASM-06 (admin không resolve):** Service admin (`getAdminProductById`, `getCategoryWithProducts`, addon
  fetch) KHÔNG cache và KHÔNG resolve — trả về entity kèm TẤT CẢ row translation (map `{en, vi}`) để form
  nhập được cả 2 bản. Chỉ service cached user-facing mới resolve theo locale. Nhất quán ASM-09 sprint-2.
- **ASM-07 (upsert khi lưu):** Save form admin: với mỗi field dịch, upsert vào bảng translation theo
  `(entity_id, locale)` (INSERT ... ON CONFLICT DO UPDATE). Cột gốc trên bảng chính đồng thời set = giá trị
  bản `en` (giữ cột gốc = en luôn khớp row en). Xem RULE-12.

---

# PART 2 — AGENT REFERENCE

## 4. User Stories + Acceptance Criteria

### Story-01 — (Admin) Nhập nội dung sản phẩm theo từng ngôn ngữ
> Là **admin**, tôi muốn nhập title/description/sub_description/allergen_info của sản phẩm theo cả EN và VI
> trong form sản phẩm, để website phục vụ đúng ngôn ngữ cho khách.
- **AC-01.1** GIVEN form sửa/tạo sản phẩm WHEN admin mở form THEN có dải tab `[Tiếng Anh][Tiếng Việt]` ở đầu
  vùng nhập nội dung; chọn tab điều khiển field text nào đang nhập/hiển thị cho locale đó.
- **AC-01.2** GIVEN admin nhập title EN và VI khác nhau WHEN lưu THEN `product_translations` có 2 row
  `(product_id, 'en')` và `(product_id, 'vi')` với title tương ứng; cột gốc `products.title` = bản EN.
- **AC-01.3** GIVEN field không dịch (price, slug, priority, isActive, ảnh, category, related) WHEN đổi tab
  ngôn ngữ THEN các field này KHÔNG đổi/không nằm trong tab (dùng chung mọi locale).
- **AC-01.4** GIVEN allergen_info/sub_description/description để trống ở VI WHEN lưu THEN row vi lưu giá trị
  rỗng cho field đó (không chặn lưu trừ khi field bắt buộc ở bản mặc định).
- **AC-01.5** GIVEN label form đang tiếng Việt WHEN render tab THEN label giữ tiếng Việt; chỉ thêm chỉ báo
  locale (Tiếng Anh/Tiếng Việt) — KHÔNG dịch label admin.

### Story-02 — (Admin) Nhập tên/mô tả danh mục và tên addon theo ngôn ngữ
> Là **admin**, tôi muốn nhập name/description danh mục và name addon theo EN + VI, để menu và addon hiển
> thị đúng ngôn ngữ.
- **AC-02.1** GIVEN form danh mục WHEN admin nhập name/description EN + VI và lưu THEN
  `product_category_translations` có row en + vi; cột gốc `product_categories.name/description` = bản EN.
- **AC-02.2** GIVEN form addon (trong AddonsEditor) WHEN admin nhập name EN + VI và lưu THEN
  `product_addon_translations` có row en + vi cho addon đó; cột gốc `product_addons.name` = bản EN.
- **AC-02.3** GIVEN addon MỚI thêm rồi xoá trước khi lưu WHEN lưu product THEN không tạo row translation
  orphan (translation chỉ tạo cho addon thực sự tồn tại).

### Story-03 — (Admin) Biết entity nào chưa được dịch
> Là **admin**, tôi muốn thấy entity/field còn thiếu bản tiếng Việt, để không bỏ sót.
- **AC-03.1** GIVEN sản phẩm/danh mục/addon thiếu bản `vi` (row vi không có hoặc field text rỗng) WHEN render
  form/tab VI THEN hiển thị badge "chưa dịch".
- **AC-03.2** GIVEN entity có đủ bản en + vi (không rỗng) WHEN render THEN KHÔNG hiển thị badge.
- **AC-03.3** (tuỳ chọn) GIVEN đang ở tab VI WHEN admin bấm "Copy từ English" THEN các field VI được điền
  bằng giá trị EN hiện tại (chưa lưu, admin vẫn phải submit).

### Story-04 — (Khách) Xem nội dung entity theo ngôn ngữ đang chọn
> Là **khách xem web**, tôi muốn tên/mô tả món, danh mục, addon hiển thị theo ngôn ngữ URL đang xem.
- **AC-04.1** GIVEN ở `/vi` và sản phẩm có bản `vi` WHEN mở `/vi/dish/[slug]` THEN title/description/
  sub_description/allergen_info hiển thị bản vi.
- **AC-04.2** GIVEN ở `/vi` và sản phẩm THIẾU bản vi (hoặc field vi rỗng) WHEN render THEN fallback bản en
  (cột gốc).
- **AC-04.3** GIVEN ở `/` (en) WHEN render THEN hiển thị bản en (cột gốc / row en).
- **AC-04.4** GIVEN trang menu `/vi/menu/[category]` WHEN render THEN tên danh mục, tên món trong card, addon
  đều theo locale vi (fallback en).
- **AC-04.5** GIVEN section New Food & Related Products WHEN render ở `/vi` THEN product card & tên hiển thị
  theo vi (fallback en).
- **AC-04.6** GIVEN field không dịch (price, slug, ảnh, priority) WHEN đổi locale THEN giữ nguyên mọi locale.

### Story-05 — (Khách) Cart/quick-add hiển thị theo ngôn ngữ
> Là **khách**, tôi muốn khi thêm nhanh vào giỏ (quick cart) và xem giỏ, tên món + addon hiển thị theo ngôn
> ngữ tôi đang xem.
- **AC-05.1** GIVEN client đang ở `/vi` gọi `/api/products/quick/[id]` WHEN API trả dữ liệu THEN title +
  addon name theo locale vi (fallback en) — theo nguồn locale ASM-06.
- **AC-05.2** GIVEN client gọi `/api/products/ids?ids=...` (related/cart) WHEN trả THEN title + addon name +
  category theo locale hiện hành (fallback en).

### Story-06 — (Hệ thống) Migrate schema + seed en không mất dữ liệu
> Là **maintainer**, tôi muốn tạo bảng translation và seed bản en an toàn, để dữ liệu English hiện tại trở
> thành bản `en` và không mất mát.
- **AC-06.1** GIVEN chạy `db:generate` + `db:migrate` WHEN áp lên `DB_SCHEMA` THEN 3 bảng translation được
  tạo với FK + unique + ON DELETE CASCADE; KHÔNG đổi/bỏ cột gốc trên bảng chính.
- **AC-06.2** GIVEN chạy seed script WHEN mỗi entity có dữ liệu cột gốc THEN tạo row `locale='en'` copy đúng
  giá trị cột gốc (title/description/sub_description/allergen_info/name).
- **AC-06.3** GIVEN chạy seed lần 2 WHEN đã seed THEN không tạo trùng / không đổi (idempotent, dựa unique
  `(entity_id,'en')` + upsert).
- **AC-06.4** GIVEN seed chạy THEN chỉ tác động schema theo `DB_SCHEMA` (dev = `dev_multi_lang`) và có backup
  trước khi ghi.

### Story-07 — (Hệ thống) Cache không phục vụ nhầm ngôn ngữ
> Là **maintainer**, tôi muốn cache user-facing products tách theo locale.
- **AC-07.1** GIVEN service cached products WHEN gọi với `locale` khác nhau THEN cache key khác nhau (chứa
  `locale`).
- **AC-07.2** GIVEN admin lưu/đổi product/category WHEN revalidate THEN cache mọi locale cho tag đó bị
  invalidate (tag không kèm locale — RULE-10).

## 5. Business Rules

```
RULE-01: Field CẦN dịch — products: title, description, sub_description, allergen_info;
         product_categories: name, description; product_addons: name. KHÔNG dịch field khác.
RULE-02: Field KHÔNG dịch (dùng chung mọi locale): slug, price, priority, is_active, id, category_id,
         related_product_ids, sort_order, ảnh (product_images), mọi số/boolean/timestamp/url.
RULE-03: Mỗi entity có bảng translation riêng, khoá tự nhiên logic = (entity_id, locale), UNIQUE.
         FK entity_id → bảng cha, ON DELETE CASCADE (xoá entity → xoá mọi bản dịch).
RULE-04: Locale hợp lệ = danh sách trong src/i18n/routing.ts (hiện: en, vi). defaultLocale = en.
         Cột locale lưu string, validate ở tầng service (không enum DB) — locale-agnostic (ASM-01).
RULE-05: Cột gốc trên bảng chính KHÔNG bị bỏ; giữ làm bản English chính thức + fallback cuối cùng.
RULE-06: Row translation locale='en' seed từ cột gốc; cột gốc và row en phải nhất quán (save admin cập
         nhật cả hai — RULE-12).
RULE-07: Resolve field dịch theo locale L: nếu row (entity, L) tồn tại và field khác rỗng/null → dùng;
         ngược lại fallback cột gốc bản chính (= en). Nếu cột gốc cũng null/"" → trả null/"" (component
         xử optional). Không bao giờ trả undefined gây crash.
RULE-08: Service user-facing (getProductDetailsBySlug, getProductBySlug, getProductsByCategorySlug,
         getMultipleProductsByIds, getProductsDetailsByIds, getProductDetailsForQuickCartById) NHẬN thêm
         tham số locale và JOIN translation resolve TRƯỚC khi trả. Shape trả về giữ nguyên (ASM-04).
RULE-09: JOIN/resolve trong cùng query (LEFT JOIN theo locale hoặc relation with where locale), fallback
         COALESCE(translation.field, base.field). KHÔNG query N+1 (ASM-03).
RULE-10: Cache user-facing thêm locale vào KEY parts; GIỮ tag không kèm locale (PRODUCTS.BY_SLUG/
         BY_CATEGORY/ALL) → revalidateTag 1 lần xoá mọi locale (nhất quán RULE-08 sprint-2).
RULE-11: Component user-facing KHÔNG tự xử i18n entity; luôn nhận string đã resolve. Không đổi shape props.
RULE-12: Save admin: với mỗi field dịch → upsert row translation theo (entity_id, locale)
         (INSERT ... ON CONFLICT (entity_id, locale) DO UPDATE). Đồng thời set cột gốc = bản 'en'.
         Nằm trong transaction cùng update entity chính (updateProductById dùng tx).
RULE-13: Admin service (không cache) trả entity kèm TẤT CẢ translation → form nhập được {en, vi}
         (ASM-06). KHÔNG resolve về 1 locale.
RULE-14: API /api/products/* xác định locale (không có [locale] path): query ?locale= → cookie
         NEXT_LOCALE → Accept-Language → default en (ASM-06). Locale không hợp lệ → default en.
RULE-15: Schema migration bằng Drizzle (db:generate + db:migrate); seed en bằng script tsx riêng
         (idempotent, backup trước, chạy theo DB_SCHEMA). Rollback = DROP 3 bảng CASCADE (cột gốc còn).
RULE-16: KHÔNG dịch label/UI admin — giữ tiếng Việt. Chỉ thêm tab ngôn ngữ + chỉ báo locale cho ô nhập.
RULE-17: Badge "chưa dịch" hiển thị khi entity thiếu bản vi (không có row vi hoặc field text bắt buộc rỗng
         ở vi).
RULE-18: (tuỳ chọn) "Copy từ English" set field VI = field EN trên form (client), không auto-save.
RULE-19: Tab ngôn ngữ BỌC quanh input hiện có (title/description/sub_description/allergen_info/name),
         KHÔNG viết lại từng input element. react-hook-form path nested theo locale
         (vd translations.en.title / translations.vi.title) khớp cấu trúc lưu.
RULE-20: Thêm ngôn ngữ thứ 3 = thêm vào routing.ts + seed row translation locale mới; KHÔNG đổi schema,
         service, type, renderer (kiến trúc locale-agnostic).
```

## 6. Data Entities & Constraints

> 3 bảng MỚI trong schema `dbSchema` (`pgSchema(process.env.DB_SCHEMA)`). Định nghĩa Drizzle ở
> `src/db/schemas/products/` (thêm file mới, export qua `index.ts`). Cột gốc bảng chính KHÔNG đổi.

### Bảng `product_translations` (mới)
- `id` serial PK.
- `product_id` integer NOT NULL — FK → `products.id`, **ON DELETE CASCADE**.
- `locale` varchar(10) NOT NULL — giá trị từ routing (`en`/`vi`); validate ở service.
- `title` varchar(255) — dịch của `products.title`.
- `description` text — dịch của `products.description`.
- `sub_description` text — dịch của `products.sub_description`.
- `allergen_info` text — dịch của `products.allergen_info`.
- `created_at`, `updated_at` timestamptz notNull defaultNow.
- **UNIQUE `(product_id, locale)`** (mỗi sản phẩm 1 row/locale).
- Relation: `product_translations.product_id` → `products` (one); thêm `translations: many` vào
  `productsRelations`.
- Ràng buộc mềm: bản `en` nên luôn tồn tại (seed + save đảm bảo); title có thể notNull cho en, nullable
  cho locale khác (fallback). *Quyết định impl:* để title nullable ở bảng translation, đảm bảo bản en qua
  logic (cột gốc luôn có), tránh chặn insert bản vi thiếu title.

### Bảng `product_category_translations` (mới)
- `id` serial PK.
- `category_id` integer NOT NULL — FK → `product_categories.id`, **ON DELETE CASCADE**.
- `locale` varchar(10) NOT NULL.
- `name` varchar(255) — dịch của `product_categories.name`.
- `description` varchar(1024) — dịch của `product_categories.description`.
- `created_at`, `updated_at` timestamptz.
- **UNIQUE `(category_id, locale)`**.
- Relation: thêm `translations: many` vào `productCategoriesRelations`.

### Bảng `product_addon_translations` (mới)
- `id` serial PK.
- `addon_id` integer NOT NULL — FK → `product_addons.id`, **ON DELETE CASCADE**.
- `locale` varchar(10) NOT NULL.
- `name` varchar(255) — dịch của `product_addons.name`.
- `created_at`, `updated_at` timestamptz.
- **UNIQUE `(addon_id, locale)`**.
- Relation: thêm `translations: many` vào `productAddonRelations`.

> Lưu ý về FK hiện trạng: `products.category_id` KHÔNG có FK constraint thật (chỉ `integer`); `product_addons.product_id`
> CÓ `foreignKey` (không kèm onDelete). Bảng translation mới PHẢI khai báo FK + `onDelete: "cascade"` tường
> minh. Không sửa FK của các bảng chính (tránh regression). Không dùng `.references()` với `onDelete` cho
> `products.category_id` trong sprint này.

**Type (`src/types/products.ts`) cần bổ sung (không phá type cũ):**
- `ProductTranslationDB = typeof productTranslations.$inferSelect` (+ New/Update), tương tự category/addon.
- Type admin form: entity kèm `translations: Record<Locale, {...}>` hoặc mảng row → form map thành
  `{en, vi}`. Không đổi `WebProduct`/`WebProductDetails` (service resolve trả string như cũ — ASM-04).

## 7. Edge Cases Registry

```
EC-01 [RULE-06]: entity có cột gốc rỗng/null (allergen_info null) → seed row en với cùng giá trị null;
                 resolve trả null; component dùng `|| ""` không crash.
EC-02 [RULE-07]: đọc /vi nhưng thiếu row vi → fallback cột gốc (en).
EC-03 [RULE-07]: đọc /vi có row vi nhưng field cụ thể rỗng (vd allergen_info="") → field đó fallback cột
                 gốc; các field khác vẫn dùng vi.
EC-04 [RULE-07]: đọc /vi, cả row vi lẫn cột gốc rỗng → trả "" (render trống, không lỗi).
EC-05 [RULE-08/ASM-08]: product mới tạo chưa có row translation nào (chỉ cột gốc) → resolve mọi locale
                 fallback cột gốc; không lỗi.
EC-06 [RULE-07]: category.description null (nullable) → resolve trả null; menu render bỏ qua.
EC-07 [RULE-03]: xoá product → CASCADE xoá product_translations + (addon của product bị xoá thì
                 product_addon_translations của addon đó cũng phải bị xoá). Lưu ý: addon → product hiện
                 CHƯA cascade; cân nhắc xoá product không tự xoá addon (behavior hiện tại) → addon
                 translation vẫn theo addon. Xem Regression + OQ.
EC-08 [RULE-12]: admin đổi addon.name (đã tồn tại) → upsert row translation en+vi theo addon_id; addon mới
                 (chưa có id) → tạo addon trước rồi upsert translation (trong tx updateProductById).
EC-09 [RULE-12]: admin xoá bản vi (clear cả field) rồi lưu → giữ row vi rỗng HOẶC xoá row vi; resolve vẫn
                 fallback en (chọn: set rỗng, không xoá row — đơn giản, idempotent).
EC-10 [RULE-15]: seed script chạy khi bảng chưa được tạo (quên db:migrate) → báo lỗi rõ ràng, thoát code
                 !=0 (giống migrate-configs guard DB_SCHEMA/DATABASE_URL).
EC-11 [RULE-14]: gọi /api/products/* không có locale (không query/cookie/header) → default en, không lỗi.
EC-12 [RULE-14/ASM-07]: order đã đặt xem lại → hiển thị snapshot đã lưu (không dịch lại) HOẶC nếu chỉ lưu
                 id thì theo locale người xem fallback en (tuỳ orders lưu gì — xác nhận OQ-02).
EC-13 [RULE-10]: /en và /vi cùng slug → 2 key cache khác nhau; sau admin save, revalidateTag BY_SLUG(slug)
                 xoá cả 2 (tag không kèm locale).
EC-14 [RULE-09]: sản phẩm có nhiều addon → JOIN addon + addon_translations theo locale trong 1 truy vấn
                 (with + where locale), không lặp query từng addon.
EC-15 [RULE-04]: locale không hợp lệ truyền vào service (vd 'fr') → coi như không có bản dịch → fallback en
                 (không throw).
```

## 8. Integration Touchpoints

- **next-intl (sprint-1)** — nguồn locale cho page/component user-facing:
  - Page RSC có `params.locale` (`[locale]` segment) → truyền vào service cached.
  - Component không nhận param (vd `FoodCategories`, `NewFood`) → nhận `locale` prop từ page HOẶC
    `getLocale()` (next-intl/server). Ưu tiên truyền prop từ page cho tường minh.
- **Service layer** (`src/services/products.ts`, `src/services/cached/products.ts`):
  - Các hàm user-facing (RULE-08) thêm param `locale: Locale`; JOIN translation + COALESCE fallback cột gốc.
  - Admin service KHÔNG cache: `getAdminProductById`, `getCategoryWithProducts`, addon fetch → kèm mọi
    translation (ASM-06) để form nhập {en, vi}.
  - Save: `updateProductById` (đã dùng transaction) + `createProduct` + `updateProductCategory` +
    addon create/update → thêm upsert translation (RULE-12). Cần helper upsert dùng chung.
- **Cache/Revalidate** (`src/lib/cache.ts`, `src/lib/revalidate.ts`, `src/constants/cache/tags.ts`):
  - `createDynamicCachedFunction`: `getKeyParts(...args)` thêm `locale` (args tự có locale sau khi đổi chữ
    ký service). `getTags` GIỮ tag không kèm locale (RULE-10).
  - `revalidateProductUpdate/Create/CategoryUpdate/ImageChange` KHÔNG cần đổi (tag không kèm locale đã bao
    mọi locale). Lưu ý bugfix `{ expire: 0 }` trong revalidate.ts (sprint-2) vẫn áp dụng.
- **Caller user-facing cần truyền locale:**
  - `src/app/(web)/[locale]/dish/[slug]/page.tsx` — `getProductDetailsBySlugCached(slug, locale)` +
    `getRelatedProductsCached(ids, locale)`; `generateMetadata` cũng đọc theo locale (title/description).
  - `src/app/(web)/[locale]/menu/[category]/page.tsx` → truyền `locale` xuống `FoodCategories`, `NewFood`.
  - `src/components/web/features/menu/FoodCategories.tsx` — `getProductsByCategorySlugCached(key, locale)`.
  - `src/components/web/features/menu/NewFood.tsx` — `getProductBySlugCached(slug, locale)`.
  - Home page (nếu render NewFood/RelatedProducts/product cards) — truyền locale tương tự.
- **API routes** (bị proxy loại khỏi intl → tự lấy locale, RULE-14):
  - `src/app/(web)/api/products/quick/[id]/route.ts` — `getProductDetailsForQuickCartByIdCached(id, locale)`.
  - `src/app/(web)/api/products/ids/route.ts` — `getProductsDetailsByIds(ids, locale)` (hàm này hiện KHÔNG
    cache — cân nhắc thêm cache hoặc giữ direct; nếu giữ direct vẫn phải nhận locale).
  - Client gọi (cart/checkout) NÊN truyền `?locale=<current>` (lấy từ `useLocale()` next-intl) — cập nhật
    caller client trong cart/checkout provider. Error case: locale sai/thiếu → default en.
- **Admin form** (`src/components/admin/features/products/...`):
  - `ProductEditForm.tsx` + `CreateProduct.tsx` (bọc title/allergenInfo/subDescription/description trong
    tab); `CreateCategory.tsx`/`UpdateCategory.tsx` (name/description); `AddonsEditor.tsx` (name theo tab).
  - Hooks form: `useUpdateProductForm`, `useAddProductForm`, `useCreateCategoryForm`,
    `ProductDetailsProvider` — mở rộng default values + zod schema (`src/validations/product.ts`) cho cấu
    trúc translations. Server action `src/actions/admin/product.ts` truyền translations xuống service.
  - **Error cases:** entity cũ chưa có row translation khi mở form (chỉ cột gốc) → form seed tab en từ cột
    gốc, tab vi rỗng (EC-05); react-hook-form path nested phải khớp payload lưu.

## 9. Non-functional Requirements (NFR)

```
NFR-01 (Perf): Resolve theo locale bằng JOIN trong cùng query, KHÔNG tăng số DB round-trip so với trước
               sprint (ASM-03, RULE-09). Không N+1 khi resolve addon list (EC-14).
NFR-02 (Perf/Cache): Cache user-facing per-locale không bùng nổ key (2 locale × số slug); revalidate 1 tag
               xoá mọi locale (RULE-10).
NFR-03 (Data safety): Schema migration + seed giữ nguyên 100% dữ liệu hiện tại; cột gốc KHÔNG bị bỏ; seed
               idempotent + backup trước (RULE-15, AC-06.*).
NFR-04 (Reversibility): Có đường rollback (DROP 3 bảng CASCADE) không mất dữ liệu en (cột gốc còn) (ASM-09).
NFR-05 (Compat): Component user-facing không phải sửa logic hiển thị (RULE-11, ASM-04). Đổi chữ ký service
               phải cập nhật HẾT caller (page/component/API) — không sót gây vỡ build hoặc phục vụ sai.
NFR-06 (Maintainability): Thêm locale thứ 3 chỉ sửa routing + seed row; KHÔNG đổi schema/type/service/
               renderer (RULE-20).
NFR-07 (Admin UX): Không dịch label admin (RULE-16); tab EN/VI rõ ràng; badge "chưa dịch" dễ thấy; field
               không dịch nằm ngoài tab.
NFR-08 (Robustness): Mọi edge value (null/"" / thiếu row / locale sai) không crash render user, form admin,
               hay API (EC-01..EC-06, EC-11, EC-15).
NFR-09 (Integrity): ON DELETE CASCADE đảm bảo không có translation orphan khi entity cha bị xoá (RULE-03).
```

## 10. Regression Impact (thêm feature vào codebase có sẵn)

Điểm dùng chung có thể ảnh hưởng — phải KHÔNG làm hỏng:

- **`src/services/products.ts`** — dùng bởi admin (table, detail, category, addon, status) + gián tiếp bởi
  cached user-facing + API. *Must not break:* các hàm ADMIN (`getAdminProductTable`, `getAdminProductById`,
  `getCategoryWithProducts`, `getAdminCategoriesTable`, `isExistingSlug`, `updateProductStatus`, …) tiếp tục
  hoạt động; search admin theo cột gốc giữ nguyên (ASM-10). Thêm param `locale` cho hàm user-facing KHÔNG
  được đổi hành vi hàm admin.
- **`src/services/cached/products.ts`** — dùng ở dish page, menu (FoodCategories/NewFood), related, quick-cart
  API. *Must not break:* đổi chữ ký thêm `locale` phải cập nhật MỌI caller (dish page, FoodCategories,
  NewFood, home, quick API); bỏ sót → vỡ build hoặc thiếu locale. Cache key thêm locale, tag giữ nguyên.
- **`src/actions/admin/product.ts` + hooks form + `src/validations/product.ts`** — save product/category.
  *Must not break:* tạo/sửa/xoá product, ảnh, addon, related, status vẫn chạy; slug uniqueness, revalidate
  vẫn đúng; thêm upsert translation nằm trong transaction hiện có (không phá rollback tx).
- **`src/db/schemas/products/*` + `src/db/schemas` barrel + Drizzle relations** — thêm bảng/relation. *Must
  not break:* các `db.query.products.findMany({ with: {...} })` hiện tại vẫn resolve relations cũ (images,
  addons, category); thêm relation `translations` không phá query cũ. Migration KHÔNG đổi cột gốc.
- **`src/app/(web)/[locale]/dish/[slug]/page.tsx` `generateMetadata`** — hiện dùng `product.title/description`
  cho SEO. *Must not break:* metadata vẫn render (title/description) — sau đổi service phải truyền locale để
  metadata khớp nội dung trang (tối thiểu không lỗi; hoàn thiện hreflang ở sprint-4).
- **API `/api/products/quick/[id]` + `/ids`** — nguồn cart/checkout quick-add. *Must not break:* cấu trúc
  response giữ nguyên (client cart không phải đổi shape); chỉ nội dung text theo locale. Nếu client chưa gửi
  locale → default en (không vỡ giỏ hiện có).
- **Dữ liệu DB schema `dev_multi_lang`** — migration tạo bảng + seed. *Must not break:* products/categories/
  addons hiện có nguyên vẹn; `/` (en) hiển thị y như trước migration.

**Regression happy path cho qa-guard:**
1. Admin: tạo/sửa 1 sản phẩm (title/price/slug/ảnh/addon/related) → lưu thành công như trước; đồng thời
   nhập được tab EN/VI.
2. Admin: sửa danh mục + addon → lưu OK; cột gốc + row en/vi khớp.
3. `/` (en): homepage, `/menu/[category]`, `/dish/[slug]` render đầy đủ tên/mô tả/addon như trước migration.
4. `/vi/menu/...` và `/vi/dish/...`: hiển thị bản vi khi có, fallback en khi thiếu; không trang trắng.
5. Cart: quick-add + xem giỏ vẫn hoạt động (tên theo locale, fallback en).
6. Xoá 1 sản phẩm/addon → không lỗi orphan translation (CASCADE).

## 11. Definition of Done

```
- [ ] 3 bảng translation Drizzle (product/category/addon) với FK + UNIQUE (entity_id, locale) + ON DELETE
      CASCADE; relations bổ sung; cột gốc bảng chính KHÔNG đổi. `db:generate` tạo migration, `db:migrate`
      áp lên DB_SCHEMA.
- [ ] Seed script tsx idempotent (backup trước, guard DB_SCHEMA/DATABASE_URL): tạo row en từ cột gốc cho
      mọi product/category/addon; chạy lần 2 không đổi. Có ghi chú rollback (DROP CASCADE).
- [ ] Service user-facing (6 hàm RULE-08) nhận locale, JOIN translation + fallback cột gốc (COALESCE),
      không N+1; shape trả giữ nguyên. Admin service trả translations {en,vi} (không resolve).
- [ ] Save admin (create/update product, category, addon trong tx) upsert translation theo (entity_id,
      locale) + set cột gốc = en.
- [ ] Cache user-facing key chứa locale, tag giữ nguyên; revalidate sau save xoá mọi locale.
- [ ] MỌI caller truyền locale: dish page (detail+related+metadata), menu page → FoodCategories/NewFood,
      home NewFood/RelatedProducts, API quick + ids. Client cart/checkout gửi ?locale=.
- [ ] Admin form: tab [Tiếng Anh][Tiếng Việt] bọc quanh input text hiện có (product/category/addon); field
      không dịch ngoài tab; badge "chưa dịch"; (tuỳ chọn) Copy từ English; label admin giữ tiếng Việt.
- [ ] AC-01..AC-07 pass; EC-01..EC-15 xử lý đúng; không crash value bất thường.
- [ ] NFR-01..NFR-09 thoả; Regression happy path (mục 10) pass; KHÔNG đụng config; giữ nguyên dữ liệu en.
```
