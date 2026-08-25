# Sprint 6 — Configs → Payload Globals (combined spec + design)

Version: v1 · Sprint: `sprint-6-configs-globals`
Code target (do NOT write code here): sibling repo `../talo-kitchen-payload/src/`, Payload 3.88, DB schema `dev`.
Reference (read-only): old app `src/db/schemas/configs/unified-configs.ts` (empty at read time), meta-schema `src/constants/settings/**`, and the **actual jsonb** in `dev_for_migrate.configs`.

---

## Derived scope (there is no separate requirements.md — derived from INVENTORY feature 6 + real DB data)

Replace the old app's single freeform `configs` table (`key` + `config_type` + jsonb `value`, driven by a runtime "meta-schema" in `src/constants/settings/**`) with **6 typed Payload Globals**. Each of the 6 rows in `dev_for_migrate.configs` becomes one Global whose fields are modeled 1:1 on the real jsonb shape observed in the DB. The meta-schema layer is **retired** (Payload field configs replace it). This sprint only defines the Global configs + registration; **data migration is sprint-8**, **media upload wiring is sprint-7**.

### Actual config rows found in `dev_for_migrate.configs`

| config_type | key | top-level jsonb shape (verified from DB) |
|---|---|---|
| app | `order` | `shipping.{ methods[], rules[] }` — **no `closed_mode` in current data** |
| app | `reservation` | `reservation.{ size_options[] }` — **no `closed_mode` in current data** |
| ui | `homepage` | `seo, hero, contact, gallery, reviews, our_story, why_choose_us` |
| ui | `menu_page` | `seo, hero, new_product, why_choose_us, food_categories` — **no `introduction` block in data** |
| ui | `reservation_page` | `seo, hero, booking` |
| ui | `layout` | `header, footer, floating_actions` |

---

# PART 1 — Human Review

## 1. Design Overview

- **One Global per config row (6 total).** Each becomes a strongly-typed `GlobalConfig` in `src/globals/`, registered in `payload.config.ts` `globals: [...]`. Rationale: Payload Globals are the native single-instance-config primitive; typed fields give admin UX + type safety, killing the freeform-jsonb + meta-schema indirection.
- **Field names mirror the jsonb keys exactly (snake_case where the data uses it).** Rationale: makes the sprint-8 migration a near 1:1 copy (fewer mapping bugs) and keeps the frontend port (sprint-9) reading the same key names it reads today.
- **Every image object `{url, alt}` collapses to a single `upload → media` relationship**, nullable until media is migrated in sprint-7. `alt` is carried by the Media doc. Rationale: the task mandates upload relationships; Media already requires `alt`.
- **Plain text only** (`text` / `textarea`), no Lexical richtext — locked by architecture.md.
- **Access: `read: () => true` (public), `update: isAuthenticated` (staff).** Globals have no create/delete.
- **`closed_mode` is modeled on OrderSettings + ReservationSettings even though the current jsonb rows omit it**, because the retired meta-schema defines it and the frontend order/reservation flow depends on it (INVENTORY feature 6). Migration seeds it from the meta `initValue` defaults.

## 2. Tech Decisions

- **Payload `GlobalConfig` (globals[])** — first use of Globals in this repo (only collections exist so far). No new dependency.
- **Reuse `src/access/isAuthenticated`** for `update` (already exists). No new access helper.
- **`upload` relationTo `media`** for all images; `required: false` for this sprint.
- **`select` field** for the one enum found in data: `reservation_page.booking.reservation_info[].items[].type` ∈ `text | label | bullet | note`.
- **No new shared foundation** → `.sdlc/architecture.md` already lists these 6 globals; no update required.

## 3. Risks / Trade-offs

- **Field-name mirroring keeps snake_case** (`sub_title`, `og_image`, `opening_hours`, `why_choose_us`…) which is not Payload-idiomatic camelCase, but it is the lowest-risk choice for a data-preserving migration. Accepted.
- **Collapsing `{url, alt}` → single `media` upload** loses per-placement alt overrides (alt now lives on the Media doc). Accepted per task.
- **`closed_mode` modeled but absent in prod data** → sprint-8 must seed defaults, otherwise the group is empty (frontend must treat missing/false `isClosed` as "open"). Flagged for sprint-8/9.
- **Deeply nested arrays** (`homepage.contact.opening_hours[].items[]`, `reservation_page.booking.reservation_info[].items[]`) are supported by Payload but produce many child tables in schema `dev`; acceptable for low-write config data.

---

# PART 2 — Agent Reference

## 4. Architecture

```
src/globals/
  OrderSettings.ts        slug 'order-settings'        (app:order)
  ReservationSettings.ts  slug 'reservation-settings'  (app:reservation)
  Homepage.ts             slug 'homepage'              (ui:homepage)
  MenuPage.ts             slug 'menu-page'             (ui:menu_page)
  ReservationPage.ts      slug 'reservation-page'      (ui:reservation_page)
  Layout.ts               slug 'layout'                (ui:layout)

src/payload.config.ts  ── imports all 6, adds globals: [...]
src/access/isAuthenticated.ts  ── reused for every Global's update access
src/collections/Media.ts        ── upload target for all image fields
```

Each Global: `access.read = () => true`, `access.update = isAuthenticated`, `admin.group: 'Settings'` (app/order/reservation) or `'Content'` (ui pages/layout) to organize the admin sidebar. Fields are `group`/`array` trees mirroring the jsonb. No hooks required this sprint (revalidation hooks are a later concern — INVENTORY Tầng 2; out of scope here).

## 5. Data Model (Global field definitions — field `name` = jsonb key)

Reusable sub-shapes referenced below:
- **TextList** = `array` of `{ text: text }` (used for multi-segment titles/sub_titles).
- **Keywords** = `array` of `{ keyword: text }`.
- **Image** = single `upload` field, `relationTo: 'media'`, `required: false` (nullable until sprint-7).

### 5.1 `OrderSettings` (slug `order-settings`)
- `shipping` (group)
  - `methods` (array): `method` text req · `label` text req · `description` textarea · `isDefault` checkbox
  - `rules` (array): `minOrderValue` number req · `shippingFee` number req · `description` text
- `closed_mode` (group) *(from meta-schema; not in current jsonb — seed defaults in sprint-8)*
  - `isClosed` checkbox default false · `sub_title` TextList · `title` TextList · `message` textarea

### 5.2 `ReservationSettings` (slug `reservation-settings`)
- `reservation` (group)
  - `size_options` (array): `value` text req
- `closed_mode` (group) *(meta-schema; not in current jsonb)*
  - `isClosed` checkbox default false · `sub_title` TextList · `title` TextList · `message` textarea

### 5.3 `Homepage` (slug `homepage`)
- `seo` (group): `title` text · `keywords` Keywords · `og_image` Image · `og_title` text · `description` textarea · `og_description` textarea
- `hero` (group): `image` Image · `title` TextList · `isShowTitle` checkbox
- `contact` (group): `title` TextList · `location` group{ `address` textarea, `ggmap_link` text } · `sub_title` TextList · `description` textarea · `contact_info` group{ `email` text, `phone` text, `whatsapp` text } · `opening_hours` array{ `title` text, `note` textarea, `items` array{ `label` text, `value` text } }
- `gallery` (group): `title` TextList · `images` array{ `image` Image, `title` text, `sub_title` text } · `autoplay` checkbox · `sub_title` TextList
- `reviews` (group): `title` TextList · `below_box` group{ `title` text, `description` textarea } · `sub_title` TextList · `description` textarea · `reviews_list` array{ `date` text, `rating` number, `comment` textarea, `customer_name` text }
- `our_story` (group): `image` Image · `title` TextList · `content` textarea · `sub_title` TextList
- `why_choose_us` (group): `title` TextList · `reasons` array{ `icon` text, `title` text, `desc` textarea } · `sub_title` TextList · `description` textarea

### 5.4 `MenuPage` (slug `menu-page`)
- `seo` (group): same shape as Homepage `seo`
- `hero` (group): `title` TextList · `images` array{ `image` Image } · `autoplay` checkbox
- `new_product` (group): `label` text · `title` TextList · `banner` Image · `isShow` checkbox · `sub_label` text · `sub_title` TextList · `description` textarea · `product_slug` text
- `why_choose_us` (group): same shape as Homepage `why_choose_us`
- `food_categories` (group): `title` TextList · `sub_title` TextList · `categories_to_show` array{ `key` text, `label` text, `page_title` text }

### 5.5 `ReservationPage` (slug `reservation-page`)
- `seo` (group): same shape as Homepage `seo`
- `hero` (group): `title` TextList · `banner` Image
- `booking` (group): `note` textarea · `title` TextList · `contact` group{ `email` text, `phone` text } · `sub_title` TextList · `description` textarea · `success_title` text · `reservation_info` array{ `icon` text, `title` text, `items` array{ `text` textarea, `type` select[`text`,`label`,`bullet`,`note`] } } · `success_description` textarea

### 5.6 `Layout` (slug `layout`)
- `header` (group): `phone` text · `nav_bar` array{ `href` text, `label` text, `title` text } · `open_daily` text · `welcom_text` text *(preserve original misspelled key `welcom_text` for 1:1 migration)*
- `footer` (group): `contact` group{ `email` text, `phone` text, `address` textarea } · `socials` array{ `href` text, `icon` text } · `services` array{ `label` text } · `description` textarea · `quick_links` array{ `href` text, `label` text, `title` text } · `opening_hours` array{ `label` text, `value` text } · `opening_hours_title` text
- `floating_actions` (group): `whatsAppCalling` group{ `showButton` checkbox, `phoneNumber` text } · `showScrollToTopButton` checkbox

## 6. API Contracts (Payload auto-generated REST/Local for Globals)

Per Global, Payload exposes:

- **GET `/api/globals/{slug}`** — read. Auth: none (`read: () => true`). 200 → full Global JSON (populated `media` for image uploads). Unset fields → `null`/empty arrays (EC-01).
- **POST `/api/globals/{slug}`** (or Local `payload.updateGlobal`) — update. Auth: **required** (`update: isAuthenticated`). 200 → updated doc · **403** `{ errors: [{ message: 'You are not allowed to perform this action.' }] }` when no/invalid session (EC-03) · **400** on validation failure (e.g. required `method`/`label` missing, non-number `minOrderValue`).

`{slug}` ∈ `order-settings | reservation-settings | homepage | menu-page | reservation-page | layout`. No custom endpoints introduced.

## 7. UI / Interaction Flow

Admin only (Payload-generated). Each Global appears in the admin sidebar under group `Settings` (order/reservation) or `Content` (homepage/menu-page/reservation-page/layout). States: edit form with nested collapsible groups/arrays; **empty state** = fresh fields until sprint-8 seeds data; **image fields** show empty upload picker until sprint-7 media exists; **save** requires auth (unauthenticated users never reach admin). No public frontend rendering in this sprint (that is sprint-9).

## 8. Rule & Edge-case Mapping (100% coverage)

| ID | Requirement | Handled where |
|---|---|---|
| RULE-01 | Each of the 6 config rows → one dedicated typed Global | `src/globals/*.ts` (§5) + payload.config globals[] |
| RULE-02 | Field `name` mirrors jsonb key 1:1 (incl. snake_case, `welcom_text`) | §5 all field defs |
| RULE-03 | Image `{url,alt}` → single nullable `upload→media` | Image sub-shape (§5); all `image`/`og_image`/`banner` fields |
| RULE-04 | Plain text only, no richtext | only `text`/`textarea` used; `editor` stays Lexical default but unused by these fields |
| RULE-05 | Access read public / update staff | every Global: `read:()=>true`, `update:isAuthenticated` (§4, §6) |
| RULE-06 | `closed_mode` present on order + reservation settings | §5.1, §5.2 `closed_mode` group |
| RULE-07 | Retire meta-schema `src/constants/settings/**` (not ported) | §11 (no port; old repo untouched) |
| RULE-08 | Register all globals in payload.config | §12 diff |
| RULE-09 | Numeric keys → number | `minOrderValue`, `shippingFee`, `rating` (§5.1, §5.3) |
| RULE-10 | Boolean flags → checkbox | `isDefault`,`isClosed`,`isShowTitle`,`autoplay`,`isShow`,`showButton`,`showScrollToTopButton` |
| RULE-11 | `reservation_info.items.type` enum → select | §5.5 `booking.reservation_info.items.type` |
| RULE-12 | Multi-segment title/sub_title → array{text}; keywords → array{keyword} | TextList / Keywords sub-shapes (§5) |
| EC-01 | Global unset (fresh DB) | GET returns defaults/empty (§6); admin empty state (§7) |
| EC-02 | Image null until media migrated (sprint-7) | Image `required:false` (§5); admin empty picker (§7) |
| EC-03 | Unauthenticated update | `update:isAuthenticated` → 403 (§6) |
| EC-04 | `closed_mode` absent in source jsonb | seed from meta `initValue` in sprint-8 (§5.1/5.2 note); `isClosed` default false |
| EC-05 | Unknown/extra jsonb keys at migration | no matching field → dropped by migration mapper (sprint-8) |
| NFR-01 | Read performance for public reads | Global = single row; frontend caching/revalidation deferred to sprint-9 hooks |
| NFR-02 | Security of writes | `update:isAuthenticated` on all 6 globals |
| NFR-03 | Migration 1:1 feasibility | RULE-02 key mirroring + mapping table (§13) |
| NFR-04 | Type safety | Payload regenerates `src/payload-types.ts` after globals added |

## 9. NFR Design

- **NFR-01 (perf):** Globals are single-row; Payload can cache. Frontend read + `revalidateTag` wiring is explicitly out of scope (sprint-9). No index work needed (Globals are keyed internally).
- **NFR-02 (security):** shared `isAuthenticated` guards `update`; no create/delete on Globals. Reads intentionally public (config feeds the public site).
- **NFR-03 (migration):** field names == jsonb keys → sprint-8 mapper does structural copy; image `url` strings resolve to Media docs migrated in sprint-7 (map by legacy URL). `closed_mode` seeded from meta defaults.
- **NFR-04 (types):** after adding globals + registering, run `payload generate:types` → `src/payload-types.ts` gains `OrderSetting`, `ReservationSetting`, `Homepage`, `MenuPage`, `ReservationPage`, `Layout`.

## 10. Regression-safe Plan

- **`src/payload.config.ts`** — additive only: new imports + new `globals` key. Existing `collections`, `db.schemaName:'dev'`, `admin`, `editor` untouched → no impact on sprint 1–5 collections.
- **Schema `dev`** — Globals create their own new tables; no ALTER on existing collection tables. Backward-compatible.
- **Old repo `src/constants/settings/**` + `configs` table** — read-only reference, not modified/ported. No regression surface in the new app.

## 11. Notes on the retired meta-schema

The runtime meta-schema (`src/constants/settings/app/**`, `ui/**`) that described field labels/types/validation for the freeform jsonb is **not ported**. Payload field configs (`label`, `admin.description`, `required`, field `type`) fully replace it. VI admin labels may optionally be re-added via each field's `label`/`admin.description` (nice-to-have, not required for this sprint). The `closed_mode` **default values** from `order-closed-mode.ts` / `reservation-closed-mode.ts` are the only artifact reused — as seed values in sprint-8.

## 12. File Change Plan

**Create (in `../talo-kitchen-payload/src/globals/`):**
- `OrderSettings.ts` — Global slug `order-settings` (§5.1)
- `ReservationSettings.ts` — Global slug `reservation-settings` (§5.2)
- `Homepage.ts` — Global slug `homepage` (§5.3)
- `MenuPage.ts` — Global slug `menu-page` (§5.4)
- `ReservationPage.ts` — Global slug `reservation-page` (§5.5)
- `Layout.ts` — Global slug `layout` (§5.6)

**Modify:**
- `../talo-kitchen-payload/src/payload.config.ts` — add imports + `globals: [...]` (diff below)
- `../talo-kitchen-payload/src/payload-types.ts` — regenerated (do not hand-edit)

**Reuse (no change):** `src/access/isAuthenticated.ts`, `src/collections/Media.ts`.
**No change:** `.sdlc/architecture.md` (already lists these 6 globals).

### payload.config.ts diff (illustrative)
```diff
+ import { OrderSettings } from './globals/OrderSettings'
+ import { ReservationSettings } from './globals/ReservationSettings'
+ import { Homepage } from './globals/Homepage'
+ import { MenuPage } from './globals/MenuPage'
+ import { ReservationPage } from './globals/ReservationPage'
+ import { Layout } from './globals/Layout'

  export default buildConfig({
    ...
    collections: [Users, Media, Categories, Products, ProductAddons, Customers],
+   globals: [OrderSettings, ReservationSettings, Homepage, MenuPage, ReservationPage, Layout],
    editor: lexicalEditor(),
    ...
  })
```

## 13. Old jsonb key → Global field mapping (migration reference for sprint-8)

| Global | jsonb path (source `configs.value`) | Global field path | Type |
|---|---|---|---|
| order-settings | `shipping.methods[].{method,label,description,isDefault}` | `shipping.methods[]` | array(text,text,textarea,checkbox) |
| order-settings | `shipping.rules[].{minOrderValue,shippingFee,description}` | `shipping.rules[]` | array(number,number,text) |
| order-settings | *(meta)* `closed_mode.{isClosed,sub_title[],title[],message}` | `closed_mode` | group(checkbox,array{text},array{text},textarea) |
| reservation-settings | `reservation.size_options[].value` | `reservation.size_options[]` | array{text} |
| reservation-settings | *(meta)* `closed_mode.*` | `closed_mode` | group (same as order) |
| homepage | `seo.{title,keywords[].keyword,og_image{url,alt},og_title,description,og_description}` | `seo.*` | text/array{text}/upload/text/textarea/textarea |
| homepage | `hero.{image{url,alt},title[].text,isShowTitle}` | `hero.*` | upload/array{text}/checkbox |
| homepage | `contact.{title[],location{address,ggmap_link},sub_title[],description,contact_info{email,phone,whatsapp},opening_hours[]{title,note,items[]{label,value}}}` | `contact.*` | group tree |
| homepage | `gallery.{title[],images[]{image{url,alt},title,sub_title},autoplay,sub_title[]}` | `gallery.*` | array/upload/checkbox |
| homepage | `reviews.{title[],below_box{title,description},sub_title[],description,reviews_list[]{date,rating,comment,customer_name}}` | `reviews.*` | group tree (rating→number) |
| homepage | `our_story.{image{url,alt},title[],content,sub_title[]}` | `our_story.*` | upload/array/textarea |
| homepage | `why_choose_us.{title[],reasons[]{icon,title,desc},sub_title[],description}` | `why_choose_us.*` | group tree |
| menu-page | `seo.*` | `seo.*` | (same as homepage seo) |
| menu-page | `hero.{title[],images[]{url,alt},autoplay}` | `hero.{title,images[].image,autoplay}` | array{upload} |
| menu-page | `new_product.{label,title[],banner{url,alt},isShow,sub_label,sub_title[],description,product_slug}` | `new_product.*` | upload for banner |
| menu-page | `why_choose_us.*` | `why_choose_us.*` | (same) |
| menu-page | `food_categories.{title[],sub_title[],categories_to_show[]{key,label,page_title}}` | `food_categories.*` | array |
| reservation-page | `seo.*` | `seo.*` | (same) |
| reservation-page | `hero.{title[],banner{url,alt}}` | `hero.{title,banner}` | upload for banner |
| reservation-page | `booking.{note,title[],contact{email,phone},sub_title[],description,success_title,reservation_info[]{icon,title,items[]{text,type}},success_description}` | `booking.*` | items.type→select |
| layout | `header.{phone,nav_bar[]{href,label,title},open_daily,welcom_text}` | `header.*` | array |
| layout | `footer.{contact{email,phone,address},socials[]{href,icon},services[]{label},description,quick_links[]{href,label,title},opening_hours[]{label,value},opening_hours_title}` | `footer.*` | group tree |
| layout | `floating_actions.{whatsAppCalling{showButton,phoneNumber},showScrollToTopButton}` | `floating_actions.*` | group(checkbox) |

---

## Key Assumptions (inline)

- **KA-1:** Field names mirror jsonb keys verbatim (incl. snake_case and the misspelled `welcom_text`) to make sprint-8 migration a structural copy. Not camelCased.
- **KA-2:** Each image object `{url, alt}` becomes ONE `upload→media` field (nullable this sprint); alt lives on the Media doc. Per-placement alt override is dropped.
- **KA-3:** `closed_mode` is modeled on order-settings & reservation-settings although absent in current prod jsonb; sprint-8 seeds it from the meta `initValue` defaults (`isClosed:false`).
- **KA-4:** `menu_page.introduction` (mentioned in INVENTORY) does NOT exist in the actual data → not modeled. Only the 5 blocks present (`seo, hero, new_product, why_choose_us, food_categories`) are built.
- **KA-5:** Multi-segment titles are `array{text}`; SEO keywords are `array{keyword}` — matching the observed `[{text}]` / `[{keyword}]` shapes rather than flattening to a single string.
- **KA-6:** Revalidation/caching hooks and public frontend consumption are out of scope (sprint-9); media upload data is out of scope (sprint-7); data migration is out of scope (sprint-8). This sprint delivers only the Global configs + registration + type regen.
- **KA-7:** Admin sidebar grouping (`Settings` / `Content`) is a UX nicety; not data-affecting.
