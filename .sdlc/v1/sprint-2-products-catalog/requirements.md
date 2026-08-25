# Sprint 2 — Products Catalog Collections — Requirements (v1)

> Mode B requirements. Target app: sibling repo `../talo-kitchen-payload` (PayloadCMS 3.88 / Next 16.3, DB Supabase schema `dev`).
> Source of truth for behavior: OLD app in this repo (`src/db/schemas/products/*`, `src/validations/product.ts`, `src/services/products.ts`, `src/actions/admin/product.ts`). Read-only.

---

# PART 1 — HUMAN REVIEW

## 1. Sprint Goal & Scope

**Goal:** Define the PayloadCMS collections and field-level validation for the product catalog so that later sprints (orders sprint-5, data-migration sprint-8, frontend sprint-9, admin sprint-10) have a stable, correct data model to build on. This sprint delivers the *schema + validation + relationships* only — no data migration, no frontend, no custom endpoints.

### ✅ In scope
- Payload collection `categories` (from old `product_categories`).
- Payload collection `products` (from old `products`), including `relatedProducts` as a self-referential `relationship hasMany → products`.
- Product **addons** — modeled as a separate collection `product-addons` (see Key Assumption KA-01).
- Product **images** — modeled as an array field `images` on `products`, each row referencing `media` (nullable until sprint-7) plus `altText`, `isPrimary`, `sortOrder` (see KA-02).
- Field validation parity with old zod: slug required + no-whitespace + unique + ≤255; title required ≤255; category name ≤255; description ≤1000/1024; price ≥ 0; priority number; addon name ≤255.
- `legacyId` on every collection for later migration traceability.
- Plain-text (textarea) description/subDescription/allergenInfo — NO Lexical richtext.
- `admin.useAsTitle`, list columns, and sort defaults good enough for staff to browse (fuller admin polish is sprint-10).

### ❌ Out of scope
- Actual data migration / mapping legacyId old→new (sprint-8).
- `media` collection config + R2 storage wiring (sprint-7) — this sprint only declares the `media` relationship target; the collection may be a minimal stub or the `image` field left nullable.
- Frontend rendering (`/menu`, `/dish`) and cache/revalidation hooks (sprint-9).
- Orders / order-items snapshotting of product price/image (sprint-5).
- Access control / RBAC roles (sprint-3 defines `users` + roles; this sprint may leave access permissive or `authenticated`, see OQ-03).
- Category ↔ product `name` uniqueness enforcement beyond what the old app did (old app checked name-exists in app code, not a DB constraint — see OQ-02).

## 2. Open Questions (each has the assumption I will use since there is no human gate)

- **OQ-01 — Category slug/name uniqueness scope.** Old app enforces `slug` unique at DB level (both categories and products) but `name` uniqueness only via app-level `isExistingCategoryName` check, not a DB constraint. → **Assumption:** enforce `unique: true` on `categories.slug` and `products.slug` only. Do NOT add a unique constraint on `categories.name` (keep parity; name collisions were only a soft app warning). Recorded as RULE-03/RULE-11.
- **OQ-02 — Should `product-addons` and `images` be individually validated for `price ≥ 0` / required fields at the Payload field level even though the old zod addon schema allowed any number?** Old `productAddonSchema` used `z.number()` (no nonnegative) for addon price. → **Assumption:** apply `min: 0` on addon price too for consistency with product price (RULE-08). This is stricter than old zod but safe; flagged so user can relax.
- **OQ-03 — Access control for these collections this sprint.** `users`/RBAC land in sprint-3. → **Assumption:** set `read: () => true` (public read, needed by frontend later) and gate create/update/delete to `authenticated` for now; sprint-3 refines to role-based. Recorded as NFR-03.
- **OQ-04 — `media` relationship target existence.** `media` collection is sprint-7. → **Assumption:** declare the `image` sub-field as `relationship → 'media'` but make it **not required** (nullable) so the collection compiles before sprint-7; add a code comment that sprint-7 completes R2 wiring. Recorded as KA-02 / EC-07.
- **OQ-05 — Keep `altText` auto-derived from product title?** Old app OVERWRITES every image's `altText` with the product title on each save (`altText: rest.title` in `updateProductAction`), ignoring any per-image alt text. → **Assumption:** model `altText` as a real editable text field (do NOT replicate the auto-overwrite behavior — it was a limitation, not a requirement). Migration (sprint-8) can seed it from title. Recorded as KA-05.

## 3. Key Assumptions (my decisions from the business logic — user may override)

- **KA-01 — Addons = separate collection `product-addons`.** Fields: `legacyId`, `product` (relationship → products, required), `name`, `price`, `isActive`, `sortOrder`. Rationale: queryable, easier to re-point FK during data migration (matches old `product_addons` table 1:1), and orders sprint-5 references addons by id for snapshotting. **Tradeoff:** admins edit addons in a linked sub-panel rather than inline on the product — slightly less convenient UX than an inline array, and requires a `product` back-reference; acceptable given migration + orders needs.
- **KA-02 — Images = array field `images` on `products`.** Each row: `{ image: relationship→media (nullable this sprint), altText: text, isPrimary: checkbox, sortOrder: number }`. Rationale: old `product_images` is tightly owned by one product, always fetched with the product, and ordered per-product — an ordered array matches this and Payload gives array reordering for free. **Tradeoff:** images are not independently queryable across products; acceptable since no such query exists in the old app. `media` R2 wiring completes sprint-7.
- **KA-03 — `sortOrder` semantics.** Old app RECOMPUTES `sortOrder = arrayIndex + 1` for both addons and images on every save (order derives purely from array position). In Payload, array field order already encodes position, so `sortOrder` becomes redundant for images but is KEPT as a stored field for data-migration parity + explicit ordering. For `product-addons` (separate collection) `sortOrder` is REQUIRED to preserve order; set via a `beforeChange`/admin default or maintained by migration. Recorded as RULE-06/RULE-07.
- **KA-04 — `relatedProducts` self-referential `relationship hasMany → products`.** Replaces old `relatedProductIds jsonb number[]`. No dedupe/self-exclusion existed in the old app; I add a soft self-exclusion edge case (EC-05) as a safe validation.
- **KA-05 — `altText` is a genuine editable field**, not auto-overwritten by title (see OQ-05).
- **KA-06 — Field types map real→number(float).** Old `price` is Postgres `real` (float). Payload `number` field (float, no `min` fractional restriction) with `min: 0`. `priority` = integer number, default 0.
- **KA-07 — `description` on categories was `varchar(1024)`; on products it was `text`.** Keep category description maxLength 1024 (old zod used 1000 — I use 1000 to match the zod validation the user actually saw, since DB was just an upper bound). Product description/subDescription/allergenInfo = textarea, no hard max (old zod left them unbounded on update). Recorded RULE-04.

---

# PART 2 — AGENT REFERENCE

## 4. User Stories + Acceptance Criteria

### Story-01 — Manage product categories
As an admin, I want to create/edit categories with a unique URL slug, so that products can be grouped and browsed by category.
- **AC-01.1** GIVEN a new category form WHEN I submit with empty `name` or empty `slug` THEN Payload rejects with a validation error.
- **AC-01.2** GIVEN a category form WHEN `slug` contains any whitespace character THEN it is rejected ("slug must not contain whitespace").
- **AC-01.3** GIVEN an existing category with slug `drinks` WHEN I create another category with slug `drinks` THEN creation fails on the unique constraint.
- **AC-01.4** GIVEN a category WHEN `name` > 255 chars OR `description` > 1000 chars THEN it is rejected.
- **AC-01.5** GIVEN a new category WHEN `isActive` is not provided THEN it defaults to `false`.

### Story-02 — Manage products
As an admin, I want to create and edit products with title, slug, price, category, and rich descriptive text, so that they can be sold and displayed.
- **AC-02.1** GIVEN a product form WHEN `title`, `slug`, or `category` is missing THEN it is rejected.
- **AC-02.2** GIVEN a product form WHEN `slug` contains whitespace THEN rejected; WHEN `slug` duplicates an existing product slug THEN rejected on unique constraint.
- **AC-02.3** GIVEN a product form WHEN `price` < 0 THEN rejected ("price must be ≥ 0").
- **AC-02.4** GIVEN a product WHEN `price` / `priority` / `isActive` are omitted THEN defaults apply (`price=0`, `priority=0`, `isActive=false`).
- **AC-02.5** GIVEN description/subDescription/allergenInfo fields THEN they accept plain multi-line text (textarea), NOT rich text.
- **AC-02.6** GIVEN the products list view THEN products are sortable and default-sorted by `priority` desc then `createdAt` desc (parity with old admin table).

### Story-03 — Relate products to each other
As an admin, I want to link related products, so that the dish page can suggest complementary items.
- **AC-03.1** GIVEN a product edit form WHEN I add products to `relatedProducts` THEN it stores a hasMany relationship to `products`.
- **AC-03.2** GIVEN `relatedProducts` THEN the field accepts zero or many entries (not required).
- **AC-03.3** GIVEN a product WHEN I attempt to add itself as a related product THEN it is excluded/rejected (soft rule, EC-05).

### Story-04 — Manage product addons
As an admin, I want to attach priced addons (extras) to a product, so that customers can customize an order.
- **AC-04.1** GIVEN an addon WHEN `name` is empty or > 255 chars THEN rejected.
- **AC-04.2** GIVEN an addon WHEN `price` < 0 THEN rejected (KA/OQ-02).
- **AC-04.3** GIVEN an addon WHEN `isActive` omitted THEN defaults to `true` (parity with old default).
- **AC-04.4** GIVEN a product's addons THEN each addon carries a `sortOrder` and belongs to exactly one product via the `product` relationship.

### Story-05 — Manage product images
As an admin, I want to attach ordered images to a product with one primary image, so that galleries display correctly.
- **AC-05.1** GIVEN a product's `images` array THEN each entry has `image` (media ref, nullable this sprint), `altText`, `isPrimary`, `sortOrder`.
- **AC-05.2** GIVEN the `images` array THEN reordering entries reflects display order (sortOrder recomputed / array index authoritative — RULE-06).
- **AC-05.3** GIVEN multiple images WHEN more than one has `isPrimary=true` THEN behavior follows EC-06 (only one primary retained).

### Story-06 — Migration traceability
As a migration engineer, I want each catalog record to store its old integer id, so that FKs and `relatedProductIds` can be re-pointed in sprint-8.
- **AC-06.1** GIVEN any catalog collection (`categories`, `products`, `product-addons`) THEN a `legacyId` number field exists, optional, indexed.
- **AC-06.2** GIVEN `legacyId` THEN it is admin-visible/readonly-ish (informational) and not required for records created natively in Payload.

## 5. Business Rules

```
RULE-01: categories.name is required, text, maxLength 255.
RULE-02: categories.description is optional textarea, maxLength 1000.
RULE-03: categories.slug is required, unique, maxLength 255, and must NOT contain any whitespace (regex /\s/ → reject).
RULE-04: categories.isActive is a checkbox, default false. products.isActive checkbox default false.
RULE-05: products.slug is required, unique, maxLength 255, no whitespace (same rule as RULE-03).
RULE-06: products.title required, maxLength 255. products.description/subDescription/allergenInfo are optional plain-text textareas (no maxLength enforced, no richtext).
RULE-07: products.price is a number (float), default 0, must be >= 0 (min: 0). products.priority is an integer number, default 0, used as the primary sort key (desc).
RULE-08: products.category is a required relationship → categories (hasOne). A product cannot be saved without a category.
RULE-09: products.relatedProducts is a relationship hasMany → products, optional, may hold 0..n entries. Must not include the product's own id (EC-05).
RULE-10: product-addons.product is a required relationship → products. Deleting a product should cascade/handle its addons (EC-04).
RULE-11: product-addons: name required maxLength 255; price number min 0 (default 0); isActive checkbox default true; sortOrder integer default 0.
RULE-12: products.images is an ordered array. Each row: image (relationship → media, NOT required this sprint), altText (text, optional), isPrimary (checkbox default false), sortOrder (number default 0).
RULE-13: For images, display order is authoritative from the array position; sortOrder is persisted as index-based (index or index+1) for migration parity — one convention chosen and applied consistently (recommend index+1 to match old app).
RULE-14: At most ONE image per product may have isPrimary = true (EC-06).
RULE-15: Every collection has a legacyId (number, optional, indexed) for migration old→new id mapping.
RULE-16: createdAt / updatedAt are Payload-managed timestamps (timestamps enabled); do not re-declare manually.
RULE-17: No localization is enabled on any field (locked decision).
```

## 6. Data Entities & Constraints

### Entity: `categories` (old `product_categories`)
- `legacyId` — number, optional, indexed (migration trace).
- `name` — text, required, ≤255.
- `slug` — text, required, unique, ≤255, no whitespace.
- `description` — textarea, optional, ≤1000.
- `isActive` — checkbox, default false.
- Timestamps: auto (`createdAt`, `updatedAt`).
- Relationship (reverse): many `products` reference this category.
- `admin.useAsTitle`: `name`.

### Entity: `products` (old `products`)
- `legacyId` — number, optional, indexed.
- `slug` — text, required, unique, ≤255, no whitespace.
- `title` — text, required, ≤255.
- `priority` — number (int), default 0.
- `category` — relationship → `categories`, required (replaces old `categoryId int`).
- `allergenInfo` — textarea, optional.
- `subDescription` — textarea, optional.
- `description` — textarea, optional (plain text).
- `price` — number (float), default 0, min 0.
- `relatedProducts` — relationship hasMany → `products` (self-ref), optional (replaces old `relatedProductIds jsonb number[]`).
- `isActive` — checkbox, default false.
- `images` — array (see below), optional.
- Timestamps: auto.
- `admin.useAsTitle`: `title`. Default sort: `-priority`, then `-createdAt`.

#### Sub-array: `products.images` (old `product_images`)
- `image` — relationship → `media`, NOT required (sprint-7 completes wiring).
- `altText` — text, optional, ≤255.
- `isPrimary` — checkbox, default false (≤1 true per product, EC-06).
- `sortOrder` — number, default 0 (index-based, migration parity).
- Note: old `product_images` also had its own `legacyId`-equivalent id; if per-image legacy trace is needed by sprint-8, add `legacyId` number to the array row too (recommended).

### Entity: `product-addons` (old `product_addons`)
- `legacyId` — number, optional, indexed.
- `product` — relationship → `products`, required.
- `name` — text, required, ≤255.
- `price` — number (float), default 0, min 0.
- `isActive` — checkbox, default true.
- `sortOrder` — number (int), default 0.
- Timestamps: auto.
- `admin.useAsTitle`: `name`.

### Entity: `media` (sprint-7 — referenced only)
- Declared as relationship target for `products.images[].image`. May be a minimal stub this sprint; full R2 upload config is sprint-7.

## 7. Edge Cases Registry

```
EC-01 [RULE-03/RULE-05]: slug submitted with leading/trailing/internal whitespace (e.g. " spring rolls ") → reject with no-whitespace validation error (do NOT auto-trim silently; parity with old zod refine).
EC-02 [RULE-05]: duplicate product slug on create/update → unique constraint violation surfaced as a field validation error, not a 500.
EC-03 [RULE-08]: product saved with a category id that does not exist / was deleted → relationship validation rejects (Payload enforces referential integrity on relationship).
EC-04 [RULE-10]: a product referenced by product-addons is deleted → addons must not become orphaned silently. Define behavior: block delete OR cascade delete addons (recommend Payload default relationship handling + document; migration must not leave dangling product refs).
EC-05 [RULE-09]: product's relatedProducts includes its own id → strip/exclude self via a field validate hook (soft rule; old app had no guard, so this is an added safety — record as a light improvement, not a regression).
EC-06 [RULE-14]: two or more images flagged isPrimary=true → keep only one primary (recommend: first-in-array or a beforeChange hook that unsets extras). If none flagged, the first image (lowest sortOrder) is treated as primary by consumers (frontend concern, sprint-9).
EC-07 [RULE-12/OQ-04]: image row saved before media collection exists (sprint-7) → image ref may be null; the record must still save (image not required). No hard failure.
EC-08 [RULE-13]: images/addons reordered in admin → sortOrder must reflect new order consistently (either via array index at read time or a beforeChange recompute). Avoid stale sortOrder that contradicts array order.
EC-09 [RULE-07]: price submitted as negative or non-numeric string → rejected by min:0 / number field.
EC-10 [RULE-01/RULE-06]: name/title > 255 chars → rejected by maxLength.
```

## 8. Integration Touchpoints

- **`media` collection (sprint-7):** `products.images[].image` targets `media`. This sprint declares the relationship only; do not implement R2 storage. Coordinate the collection slug name (`media`) so sprint-7 doesn't rename it.
- **`orders` / `order-items` (sprint-5):** will reference `products` and `product-addons` by id to snapshot name/price at order time. Keep `product-addons` a queryable collection (KA-01) and keep `products.price` / addon `price` stable field names so sprint-5 hooks can re-fetch for server-side price validation (anti-tamper). No code dependency this sprint, but do not rename these fields casually.
- **Data migration (sprint-8):** reads old schema `dev_for_migrate` and writes via Payload Local API. Requires `legacyId` on categories/products/product-addons (and ideally per image row) to map old serial ids → new Payload ids, and to re-point `categoryId`, addon `productId`, and `relatedProductIds` → new relationships. FK insert order: categories → products → product-addons → (images reference media, resolved once media migrated in sprint-7/8).
- **Frontend (sprint-9):** reads active products by category slug, product-by-slug with images (ordered by sortOrder) + active addons + relatedProducts. Ensure `isActive`, `slug`, `sortOrder`, `isPrimary` are all present and queryable. Cache/revalidation hooks are sprint-9, not here.

## 9. Non-functional Requirements (NFR)

```
NFR-01 (Validation/Integrity): All field validations (required, unique, maxLength, no-whitespace slug, price>=0) MUST be enforced server-side at the Payload field level, not only in admin UI, so REST/Local API writes (incl. migration) are also validated.
NFR-02 (Data fidelity): Field types must preserve old data ranges — price as float (not integer), priority as integer, text fields lossless. No truncation on migrate beyond declared maxLengths (verify old data fits, esp. product slugs/titles ≤255).
NFR-03 (Security/Access): read = public (frontend needs it later); create/update/delete restricted to authenticated users this sprint (refined to RBAC in sprint-3). No collection may be world-writable.
NFR-04 (No localization): i18n disabled on all fields (locked). Admin labels VI, content EN (convention only, no i18n machinery).
NFR-05 (Indexing): slug (unique) indexed on categories & products; legacyId indexed on all three collections; product-addons.product relationship indexed for lookup performance. Dataset is small (~19 products, ~44 images) so no heavy perf tuning required.
NFR-06 (Migration-readiness): schema must be additive-safe — legacyId optional so native-created records don't require it.
```

## 10. Regression Impact

This is a NEW app (fresh `dev` schema, no existing Payload data), so classic regression risk is minimal. However:

- **RI-01 — Self-referential relationship (`products.relatedProducts` → `products`):** self-refs can cause circular reference issues in Payload config load / infinite-depth populate. Must set a sane `maxDepth` on the relationship (e.g. depth 0–1) so querying a product does not recursively populate related products' related products. Must-not-break: querying a single product must not stack-overflow or return huge payloads.
- **RI-02 — Downstream sprints depend on these field/slug names:** renaming collection slugs (`categories`, `products`, `product-addons`, `media`) or field names (`price`, `slug`, `isActive`, `sortOrder`, `isPrimary`, `legacyId`, `relatedProducts`, `product`) after this sprint would break sprint-5/8/9 assumptions. Treat these names as a contract.
- **RI-03 — Future data migration (sprint-8):** the chosen modeling (addons collection + images array + legacyId) must remain compatible with re-pointing old FKs. Do not drop `legacyId` or make it required.

## 11. Definition of Done

- [ ] Collections `categories`, `products`, `product-addons` exist in the Payload config (sibling repo) and the app builds + `payload generate:types` succeeds against schema `dev`.
- [ ] `products.images` array field and `products.relatedProducts` self-ref relationship compile and load without circular/errors (maxDepth set — RI-01).
- [ ] All field validations from Part 2 (RULE-01…RULE-15) are enforced server-side (NFR-01), verified by attempting invalid writes via Local/REST API (empty slug, whitespace slug, duplicate slug, negative price, oversized name).
- [ ] `legacyId` present + indexed on all three collections (RULE-15); optional (NFR-06).
- [ ] `media` relationship target declared; `image` sub-field nullable so config compiles pre-sprint-7 (EC-07).
- [ ] Access control set per NFR-03 (public read, authenticated write).
- [ ] No localization enabled anywhere (NFR-04); descriptions are plain textarea, not Lexical (RULE-06).
- [ ] Admin `useAsTitle` + default product sort (`-priority, -createdAt`) configured (AC-02.6).
- [ ] Edge cases EC-05 (self-exclusion) and EC-06 (single primary image) handled via validate/beforeChange hooks or documented as deferred with rationale.
- [ ] Collection + field names match the contract in RI-02 (no surprise renames).
- [ ] Migrations generated/applied against schema `dev` using the direct 5432 connection (not pooler 6543) per architecture note.
- [ ] No regression: single-product query returns bounded payload (RI-01); dataset assumptions (~19 products) fit declared maxLengths (NFR-02).
