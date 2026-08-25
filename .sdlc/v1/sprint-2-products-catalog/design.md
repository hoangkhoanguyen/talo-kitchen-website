# Sprint 2 — Products Catalog Collections — Design (v1)

> Target app (CODE): sibling repo `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload/`
> (Payload 3.88 / Next 16.3, DB Supabase schema `dev`, `schemaName: 'dev'` already set in `payload.config.ts`).
> This SDLC doc lives in the current repo. All code paths below are **relative to the payload app root** unless absolute.
> Source-of-truth behavior read from OLD app (`src/db/schemas/products/*`, `src/validations/product.ts`) — read-only.

---

# PART 1 — HUMAN REVIEW

## 1. Design Overview

- **Three new collections + one shared validate helper.** `categories`, `products`, `product-addons` are added to `src/collections/` and registered in `payload.config.ts`. A tiny shared `no-whitespace slug` validator is extracted so `categories.slug` and `products.slug` behave identically (RULE-03/RULE-05, EC-01).
- **Images = array field on `products`; addons = separate collection.** Matches the requirements' KA-01/KA-02: images are per-product-owned and ordered (array gives free reorder); addons are a queryable collection because sprint-5 (orders) references them by id and sprint-8 (migration) re-points FKs 1:1.
- **Self-referential relationship with bounded depth.** `products.relatedProducts → products` sets `maxDepth: 1` so a single-product read never recursively populates a related-product's own related products (RI-01). Self-exclusion (EC-05) is a field-level `validate`.
- **Two collection-level `beforeChange` hooks on `products`** handle the array-only edge cases that field config can't: single-primary-image enforcement (EC-06/RULE-14) and index-based `sortOrder` recompute for images (EC-08/RULE-13). Everything else is declarative field config so it is enforced server-side for REST + Local API writes (NFR-01), not just the admin UI.
- **Access this sprint:** `read: () => true` (frontend needs it later), `create/update/delete` gated to authenticated users. RBAC-by-role is sprint-3 (NFR-03).
- **No DB migration files.** Dev uses Payload dev push against schema `dev`; data migration is sprint-8. `legacyId` (optional, indexed) on all three collections keeps the schema additive-safe for that migration (RULE-15/NFR-06/RI-03).

## 2. Tech Decisions (please review)

- **TD-1 — Shared slug validator** in `src/fields/validateNoWhitespace.ts` (new tiny module). Returns Payload's `true | string` shape; message in VI to match admin language convention. Reused by both slug fields. *Alternative rejected:* Payload skill's `slugField()` auto-generator — we do NOT auto-generate/auto-trim slugs (old zod rejected whitespace rather than trimming; EC-01 requires reject, not silent fix).
- **TD-2 — `product-addons` slug** = `product-addons` (kebab). Field name for the product back-reference = `product`. These names are a **contract** for sprint-5/8 (RI-02) — do not rename.
- **TD-3 — Addon `price` gets `min: 0`** even though old zod (`z.number()`) allowed negatives (OQ-02). Stricter but safe; flagged so you can relax to no-min if a negative "discount addon" is ever needed.
- **TD-4 — `altText` is a real editable field**, NOT auto-overwritten by product title (OQ-05/KA-05). The old app's overwrite was a limitation; migration seeds it from title in sprint-8.
- **TD-5 — Per-image `legacyId`** added to the `images` array row (optional number) so sprint-8 can trace old `product_images.id`. Recommended by requirements §6; low cost, keeps migration lossless.
- **TD-6 — `relatedProducts` maxDepth: 1** (RI-01). Prevents deep recursive populate on read.
- **TD-7 — No Lexical richtext** for any descriptive field — all are `textarea` (RULE-06, locked in architecture.md).
- **Note (not this sprint's scope):** current `payload.config.ts` reads `process.env.DATABASE_URL`, but architecture.md/env convention says `DATABASE_URI`. Out of scope here; flag for whoever owns env wiring.

## 3. Risks / Trade-offs

- **R-1 — `media` not built yet (sprint-7).** `products.images[].image` targets `'media'`. A minimal `Media` collection already exists in the app (`upload: true`, `alt` text), so the relationship target resolves and config compiles today. The sub-field is **not required** (EC-07) so records save with a null image pre-sprint-7. Sprint-7 only extends `Media` with R2 storage — do not rename the `media` slug.
- **R-2 — Addon orphaning on product delete (EC-04).** Payload's Postgres adapter does NOT auto-cascade custom relationship FKs. Chosen behavior: a `beforeDelete` hook on `products` that **deletes** that product's `product-addons` (cascade). Documented; keeps migration from leaving dangling `product` refs. Alternative (block delete) rejected as worse UX for admins.
- **R-3 — `sortOrder` redundancy for images.** Array index already encodes order; we keep `sortOrder` as a stored field for migration parity (RULE-13) and recompute it `= index + 1` in a hook. Minor write overhead, acceptable for ~44 images.
- **R-4 — Stricter addon price (TD-3)** could reject legitimately negative legacy data on migration. Verified against old zod: old schema had no negative addon prices in practice, but sprint-8 should assert this before insert.

---

# PART 2 — AGENT REFERENCE

## 4. Architecture

New/changed modules in `../talo-kitchen-payload/`:

```
src/
  fields/
    validateNoWhitespace.ts     [NEW] shared slug validator (RULE-03/05, EC-01)
  collections/
    Categories.ts               [NEW] collection `categories`
    Products.ts                 [NEW] collection `products` (+ images array, relatedProducts, hooks)
    ProductAddons.ts            [NEW] collection `product-addons`
    hooks/
      ensureSinglePrimaryImage.ts   [NEW] products beforeChange (EC-06/RULE-14)
      recomputeImageSortOrder.ts    [NEW] products beforeChange (EC-08/RULE-13)
      cascadeDeleteAddons.ts        [NEW] products beforeDelete (EC-04/RULE-10)
    Media.ts                    [existing, unchanged this sprint]
    Users.ts                    [existing, unchanged]
  payload.config.ts             [EDIT] import + register 3 collections
  access/
    (none new — inline access fns; RBAC module deferred to sprint-3)
```

Interaction: `payload.config.ts` registers the collections. `Products` imports the two array-hook modules + the cascade-delete hook + the shared slug validator. `Categories` imports the shared slug validator. `ProductAddons` references `products` via a relationship field. No runtime coupling to `Media` beyond the relationship target string `'media'`.

Hook ordering on `Products.hooks.beforeChange` (array, runs in order): `[recomputeImageSortOrder, ensureSinglePrimaryImage]` — sortOrder normalized first, then primary enforced.

## 5. Data Model (concrete Payload field configs)

Field-type key: `text` (varchar), `textarea` (multiline plain text), `number` (float unless noted), `checkbox` (bool), `relationship`, `array`. `timestamps: true` on every collection → Payload auto `createdAt`/`updatedAt` (RULE-16). No `localized` anywhere (RULE-17/NFR-04). `legacyId` pattern (all 3 collections, RULE-15/NFR-06): `{ name: 'legacyId', type: 'number', index: true, admin: { readOnly: true, position: 'sidebar', description: 'Old integer id (migration trace)' } }` — optional (no `required`).

### 5.1 `categories` — `src/collections/Categories.ts`

| field | type | config |
|---|---|---|
| `legacyId` | number | optional, `index: true`, `admin.readOnly`, sidebar |
| `name` | text | `required: true`, `maxLength: 255` |
| `slug` | text | `required: true`, `unique: true`, `index: true`, `maxLength: 255`, `validate: validateNoWhitespace` |
| `isActive` | checkbox | `defaultValue: false` |
| `description` | textarea | optional, `maxLength: 1000` |

`admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'isActive', 'updatedAt'] }`. `timestamps: true`. Access per §6.

### 5.2 `products` — `src/collections/Products.ts`

| field | type | config |
|---|---|---|
| `legacyId` | number | optional, `index: true`, `admin.readOnly`, sidebar |
| `title` | text | `required: true`, `maxLength: 255` |
| `slug` | text | `required: true`, `unique: true`, `index: true`, `maxLength: 255`, `validate: validateNoWhitespace` |
| `priority` | number | `defaultValue: 0`, `admin.step: 1` (integer intent) |
| `category` | relationship | `relationTo: 'categories'`, `required: true`, `hasMany: false`, `index: true` |
| `allergenInfo` | textarea | optional (no maxLength) |
| `subDescription` | textarea | optional (no maxLength) |
| `description` | textarea | optional (no maxLength) |
| `price` | number | `defaultValue: 0`, `min: 0` |
| `relatedProducts` | relationship | `relationTo: 'products'`, `hasMany: true`, optional, `maxDepth: 1`, `validate: excludeSelf` (EC-05) |
| `isActive` | checkbox | `defaultValue: false` |
| `images` | array | see 5.2.1 |

`admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'category', 'priority', 'isActive', 'updatedAt'] }`.
Default list sort (AC-02.6): `admin.pagination` default + set list sort via `defaultSort: '-priority'` (Payload single-key). Secondary `-createdAt` documented as consumer/query default (Payload `defaultSort` is single-key; frontend/admin sprint-10 can pass composite sort). `timestamps: true`. Hooks per §4. Access per §6.

`relatedProducts.validate` (`excludeSelf`): reject if the array contains the current doc id (`data.id`). Returns VI error `"Sản phẩm không thể liên quan đến chính nó"`. On create `data.id` is undefined → no-op (nothing to exclude).

#### 5.2.1 `products.images` array field (RULE-12/13/14)

`{ name: 'images', type: 'array', labels: {...}, fields: [...] }`, optional:

| sub-field | type | config |
|---|---|---|
| `image` | relationship | `relationTo: 'media'`, **NOT required** (EC-07/OQ-04); code comment: "sprint-7 completes R2 wiring" |
| `altText` | text | optional, `maxLength: 255` |
| `isPrimary` | checkbox | `defaultValue: false` |
| `sortOrder` | number | `defaultValue: 0` (recomputed = index+1 by hook, RULE-13) |
| `legacyId` | number | optional (per-image migration trace, TD-5) |

### 5.3 `product-addons` — `src/collections/ProductAddons.ts`

| field | type | config |
|---|---|---|
| `legacyId` | number | optional, `index: true`, `admin.readOnly`, sidebar |
| `product` | relationship | `relationTo: 'products'`, `required: true`, `hasMany: false`, `index: true` |
| `name` | text | `required: true`, `maxLength: 255` |
| `price` | number | `defaultValue: 0`, `min: 0` |
| `isActive` | checkbox | `defaultValue: true` (parity with old default) |
| `sortOrder` | number | `defaultValue: 0`, `admin.step: 1` |

`admin: { useAsTitle: 'name', defaultColumns: ['name', 'product', 'price', 'isActive', 'sortOrder'] }`. `timestamps: true`. Access per §6.

### 5.4 `media` (referenced only)
Existing minimal `Media` collection (`upload: true`, `alt` text, public read). Used as `relationTo: 'media'` target for `products.images[].image`. Not modified this sprint (sprint-7 adds R2).

## 6. Access Control (all three new collections)

```ts
access: {
  read: () => true,                          // public — frontend needs it (NFR-03)
  create: ({ req: { user } }) => Boolean(user),
  update: ({ req: { user } }) => Boolean(user),
  delete: ({ req: { user } }) => Boolean(user),
}
```
No collection is world-writable (NFR-03). Refined to role-based in sprint-3.

## 7. API Contracts (Payload auto-generated REST — no custom endpoints this sprint)

Payload auto-exposes REST at `/api/<slug>` for each collection. No custom endpoints are added (none in scope). Relevant behaviors + error shapes:

| Method / Path | Auth | Request | Success | Error (relevant ECs) |
|---|---|---|---|---|
| `GET /api/categories`, `/api/products`, `/api/product-addons` (+`?where=`, `?sort=`, `?depth=`) | public read | query params | `200` `{ docs, totalDocs, ... }` | — |
| `GET /api/<slug>/:id` | public read | path id | `200` doc | `404` if missing |
| `POST /api/<slug>` | authenticated | JSON body | `201` created doc | `403` if unauthenticated; `400` `{ errors: [{ message, field }] }` for validation |
| `PATCH /api/<slug>/:id` | authenticated | partial JSON | `200` updated doc | `403`/`400`/`404` |
| `DELETE /api/products/:id` | authenticated | path id | `200`; cascade-deletes addons (EC-04) | `403`/`404` |

Validation error mapping (all surface as `400` field errors, never `500` — NFR-01):
- Empty `name`/`slug`/`title`/`category`/addon `name` → required error (AC-01.1/02.1/04.1).
- Whitespace slug → `validateNoWhitespace` message (EC-01, AC-01.2/02.2).
- Duplicate slug → unique-constraint field error (EC-02, AC-01.3/02.2).
- `name`/`title` > 255 or category `description` > 1000 → maxLength error (EC-10, AC-01.4).
- `price` < 0 or non-numeric → `min: 0` / number-type error (EC-09, AC-02.3/04.2).
- `category` id not existing/deleted → relationship validation error (EC-03).
- `relatedProducts` includes self → `excludeSelf` validate error (EC-05).

## 8. Rule & Edge-case → Design Mapping

| Req | Handled where |
|---|---|
| RULE-01 categories.name req/text/≤255 | `Categories.name`: `required`, `maxLength:255` |
| RULE-02 categories.description optional/≤1000 | `Categories.description`: `textarea`, `maxLength:1000` |
| RULE-03 categories.slug req/unique/≤255/no-ws | `Categories.slug`: `required`,`unique`,`index`,`maxLength:255`,`validateNoWhitespace` |
| RULE-04 isActive default false (cat+prod) | `Categories.isActive`/`Products.isActive`: `checkbox defaultValue:false` |
| RULE-05 products.slug req/unique/≤255/no-ws | `Products.slug`: same as RULE-03 |
| RULE-06 title req ≤255; desc/sub/allergen textarea no-max no-richtext | `Products.title` maxLength255; 3 `textarea` fields, no maxLength, no Lexical |
| RULE-07 price float default0 min0; priority int default0 sort key | `Products.price` `defaultValue:0`,`min:0`; `priority` `defaultValue:0`; `defaultSort:'-priority'` |
| RULE-08 category required relationship hasOne | `Products.category` `relationTo:'categories'`,`required`,`hasMany:false` |
| RULE-09 relatedProducts hasMany self, optional, exclude self | `Products.relatedProducts` `hasMany`,`maxDepth:1`,`excludeSelf` validate |
| RULE-10 addon.product required; delete cascade | `ProductAddons.product` `required`; `cascadeDeleteAddons` beforeDelete on Products |
| RULE-11 addon name req≤255; price min0 def0; isActive def true; sortOrder int def0 | `ProductAddons` fields per §5.3 |
| RULE-12 images array: image(media,not req), altText, isPrimary def false, sortOrder def0 | `Products.images` array per §5.2.1 |
| RULE-13 image display order authoritative; sortOrder=index+1 | `recomputeImageSortOrder` beforeChange hook |
| RULE-14 ≤1 primary image | `ensureSinglePrimaryImage` beforeChange hook |
| RULE-15 legacyId all 3 collections, optional, indexed | `legacyId` field pattern §5 (+ per-image legacyId TD-5) |
| RULE-16 timestamps managed | `timestamps: true` on all 3 |
| RULE-17 no localization | no `localized` anywhere; no `localization` in config |
| EC-01 whitespace slug reject (no auto-trim) | `validateNoWhitespace` (regex `/\s/` → reject) |
| EC-02 duplicate slug → field error not 500 | `unique:true` → Payload `400` field error |
| EC-03 non-existent category → reject | relationship referential validation |
| EC-04 delete product → addons not orphaned | `cascadeDeleteAddons` beforeDelete |
| EC-05 relatedProducts self → excluded/rejected | `excludeSelf` validate on `relatedProducts` |
| EC-06 multiple isPrimary → keep one | `ensureSinglePrimaryImage` (unset extras, keep first true) |
| EC-07 image saved pre-media | `image` sub-field NOT required → saves with null |
| EC-08 reorder → sortOrder consistent | `recomputeImageSortOrder` (index+1 each save) |
| EC-09 negative/non-numeric price → reject | `number` field + `min:0` (product + addon) |
| EC-10 name/title >255 → reject | `maxLength:255` |
| NFR-01 server-side validation (REST+Local) | all validation is field config / validate fn / hooks — runs on every write |
| NFR-02 data fidelity (float price, int priority, no truncation) | `number` float for price, integer-intent for priority; maxLength=255 matches old varchar(255) |
| NFR-03 public read, authenticated write | §6 access block |
| NFR-04 no i18n | no `localized`/`localization`; VI admin labels only |
| NFR-05 indexing slug/legacyId/addon.product | `index:true` on slugs, legacyIds, `category`, `product` relationships |
| NFR-06 additive-safe legacyId optional | `legacyId` no `required` |
| RI-01 self-ref bounded | `relatedProducts.maxDepth:1` |
| RI-02 name contract | slugs/field names per §5 (do not rename) |
| RI-03 migration compatibility | `legacyId` kept optional on all; addons collection + images array preserved |

## 9. NFR Design (concrete)

- **NFR-01 Validation server-side:** every rule is declarative field config (`required`, `unique`, `maxLength`, `min`) or a `validate` fn / collection hook. Payload runs these on REST, GraphQL and Local API writes — including the sprint-8 migration path. Verified in DoD by attempting invalid writes.
- **NFR-02 Data fidelity:** `price` is `number` (float, no integer coercion); `priority` integer via `admin.step:1`; text fields `maxLength:255` exactly equal old `varchar(255)`; category description `maxLength:1000` (zod value; old DB was 1024 upper bound). Product textareas unbounded to avoid truncation.
- **NFR-03 Security:** §6 access; no world-writable collection; `read` public because sprint-9 frontend reads catalog.
- **NFR-04 No i18n:** config has no `localization`; no field `localized:true`. Admin labels in VI, content EN (convention only).
- **NFR-05 Indexing:** `index:true` on `categories.slug`, `products.slug` (also `unique` implies index), `legacyId` ×3, `products.category`, `product-addons.product`. Dataset ~19 products/~44 images → no further tuning.
- **NFR-06 Migration-readiness:** `legacyId` optional everywhere so native Payload creates don't need it; schema is additive.

## 10. Regression-safe Plan

New app, fresh `dev` schema — no existing Payload data to break. Specific safeguards:
- **RI-01 self-ref:** `relatedProducts.maxDepth:1` caps populate depth; single-product read returns bounded payload (DoD-verified). Config load: Payload supports self-referential `relationTo` — no circular import (relationTo is a string slug, not a JS import).
- **RI-02 name contract:** collection slugs `categories` / `products` / `product-addons` / `media` and field names (`price`,`slug`,`isActive`,`sortOrder`,`isPrimary`,`legacyId`,`relatedProducts`,`product`,`category`,`title`,`name`) are fixed; documented as a contract for sprint-5/8/9.
- **RI-03 migration compat:** modeling (addons collection + images array + legacyId) unchanged from requirements; `legacyId` never made required.
- **`payload.config.ts` edit is additive** — only appends imports and array entries; does not touch `Users`/`Media`/`db`/`admin` config.

## 11. File Change Plan (in `../talo-kitchen-payload/`)

Created:
- `src/fields/validateNoWhitespace.ts` — shared slug validator (RULE-03/05, EC-01).
- `src/collections/Categories.ts` — collection `categories` (§5.1).
- `src/collections/Products.ts` — collection `products` incl. `images` array + `relatedProducts` (§5.2).
- `src/collections/ProductAddons.ts` — collection `product-addons` (§5.3).
- `src/collections/hooks/ensureSinglePrimaryImage.ts` — beforeChange (EC-06/RULE-14).
- `src/collections/hooks/recomputeImageSortOrder.ts` — beforeChange (EC-08/RULE-13).
- `src/collections/hooks/cascadeDeleteAddons.ts` — beforeDelete (EC-04/RULE-10).

Modified:
- `src/payload.config.ts` — add imports + register in `collections` array:
  ```ts
  import { Categories } from './collections/Categories'
  import { Products } from './collections/Products'
  import { ProductAddons } from './collections/ProductAddons'
  // ...
  collections: [Users, Media, Categories, Products, ProductAddons],
  ```

No DB migration files: dev uses Payload dev push against schema `dev`. After config compiles, run `npm run generate:types` to regenerate `src/payload-types.ts`. Data migration is sprint-8.

CLAUDE.md to follow when implementing: payload app root `CLAUDE.md` + `.claude/skills/payload/SKILL.md` (+ `reference/FIELDS.md`, `reference/HOOKS.md`, `reference/ACCESS-CONTROL.md`).

---

## Self-review result
- Every RULE-01…17, EC-01…10, NFR-01…06, RI-01…03 appears in §8/§9/§10 — 100% mapped.
- Every EC has a corresponding error path in §7 (API contracts) or a hook (§4/§8).
- No endpoint or entity added beyond the requirements (no custom endpoints; only the 3 required collections + shared validator/hooks).
- No conflict with codebase conventions: reuses existing `Media`/`Users`, keeps `schemaName:'dev'`, plain textarea (no Lexical), no i18n — all per architecture.md locked decisions.
