# Test Report — sprint-3-entity-i18n

> Stack: Next.js 16 App Router/RSC, TypeScript, Drizzle/Postgres (`dev_multi_lang`), next-intl.
> Test tooling (matches project convention from sprint-2): `node:test` (via `tsx`) for pure
> unit helpers, `@playwright/test` for HTTP/UI integration, both wired to a `next dev` server
> on port 3100 (`playwright.config.ts` defaults to `PW_PORT=3100`).

## Bug found + fixed during this test leg

**LocaleTabStrip switching did not actually update the bound field's displayed value**
(`ProductEditForm`, `CreateProduct`, `AddonsEditor`, `CreateCategory`, `UpdateCategory`). Clicking
the "Tiếng Việt" tab visually activated the tab (class `tab-active` moved correctly) but the
`Controller`'s rendered input kept showing the *previous* locale's value — react-hook-form's
`Controller` does not reliably re-pull the new field's value when only its `name` prop changes at
the same JSX position. Root cause: no `key` forcing remount on locale switch.

**Fix:** added `key={`<field>-${activeLocale}`}` (product: title/allergenInfo/subDescription/
description; addon: `addon-name-${index}-${activeLocale}`; category: name/description) to every
dynamically-named `Controller` in:
- `src/components/admin/features/products/ProductEditForm.tsx`
- `src/components/admin/features/products/form-elements/AddonsEditor.tsx`
- `src/components/admin/features/products/CreateProduct.tsx`
- `src/components/admin/features/products/CreateCategory.tsx`
- `src/components/admin/features/categories/UpdateCategory.tsx`

Verified via Playwright: switching EN→VI→EN now shows the correct per-locale value each time, no
data loss, and the real DB round-trip test (save VI title → `/vi/dish/...` shows it → EN
untouched) passes. Fix round 1/6 (Sonnet, small/targeted edit — no Opus escalation needed).

Also fixed 2 test bugs found while iterating (wrong assertions, not app bugs):
- Slug field label is "Đường dẫn" (Vietnamese), not the literal word "Slug" — corrected the
  locator.
- The "badge clears once translated" check must fully translate the WHOLE group (title +
  allergenInfo + subDescription + description, since this fixture product has all four filled on
  EN) — filling only `title` correctly leaves the badge showing (`isMissing` is group-level, per
  design.md). Switched that assertion to use "Copy từ English" to fully clear the group.
- Admin spec mutates a shared fixture row (`PRODUCT_ID=18`) against the real dev DB — must be run
  single-worker (`--workers=1`) to avoid cross-test races; documented in the file header and used
  in every run here.

## Automatically covered

### Unit (`node:test`, run with `npx tsx --conditions=react-server --test tests/unit/entity-translations.test.ts`)
21/21 pass. Covers `resolveProductFields`/`resolveCategoryFields`/`resolveAddon`
(`src/services/products/translations.ts`) and `resolveLocale`/`getRequestLocale`
(`src/lib/locale.ts`): per-field COALESCE fallback, missing row, empty/null field, locale not in
routing, missing translations array, request-locale priority (query > cookie > Accept-Language >
default), invalid values never throw.

(`--conditions=react-server` is required so the pure resolver module — which is co-located in a
file that also imports the Drizzle `getDb()` for the upsert helpers — resolves `server-only` to
its no-op `empty.js`, exactly as it would inside a real RSC bundle; no DB I/O is exercised by
these tests.)

### Playwright — user-facing (`tests/i18n/entity-i18n-user.spec.ts`, 16/16 pass)
- Dish detail page: en renders correctly; vi (no vi row seeded yet) falls back to en, no crash, no
  blank page (AC-04.1/04.2/04.3, EC-02).
- Non-translated fields (price) identical across locale (AC-04.6/RULE-02).
- `generateMetadata` reads locale on both metadata + page body (design.md fix verified: `<title>`
  correct on `/` and `/vi`).
- 404 product slug → 404 on both locales, no 500.
- Menu page (`FoodCategories`/`NewFood`) en + vi render, fallback works, no crash on a real
  category slug (`main-course`) (AC-04.4/04.5, EC-06).
- Cache per-locale: en/vi/en round of requests each get correct content (no cross-locale leakage
  from the cache key) (AC-07.1, EC-13).
- `/api/products/quick/[id]`: default en (no locale param, EC-11), vi fallback (EC-02), invalid
  locale → en (EC-15), addon names resolved without N+1 crash (EC-14), unknown id →
  `{product:null}` not a crash (AC-05.1).
- `/api/products/ids`: empty ids → `[]`, valid ids resolve title/category on vi (fallback en)
  (AC-05.2).

### Playwright — admin LocaleTabStrip (`tests/i18n/entity-i18n-admin.spec.ts`, 15/15 pass, run with `--workers=1`)
- DAC-01 tablist shape (2 tabs, defaultLocale first).
- DAC-02 switching locale swaps the title value correctly, round trip EN→VI→EN loses no data
  (confirms the fix above).
- DAC-03 shared fields (slug/price/priority/category/isActive) outside any tablist, unchanged by
  locale switch.
- DAC-05 admin labels stay Vietnamese.
- DAC-06/07 "Chưa dịch" badge shows while any group field is untranslated, clears once the whole
  group (incl. addon names) is translated via "Copy từ English".
- DAC-08 "Copy từ English" is client-only (no network save call observed).
- DAC-09 addon name follows the page-shared `activeLocale`, no second tablist in the Addons card.
- DAC-13 no hardcoded hex/inline style in the translated region.
- DAC-14 tabs are `<button type="button" role="tab">`, keyboard-focusable.
- DAC-15 no horizontal overflow at 360px.
- DAC-11 `CreateProduct` (title-only) and `CreateCategory` (name-only, no description field)
  render exactly one tablist each, slug/category stay shared.
- DAC-11b `UpdateCategory` — one tablist controls BOTH name + description together; slug stays
  shared; switching restores the EN value with no data loss.
- **Real save round trip** (AC-01.2, RULE-12, AC-04.1): saving a VI title via the real admin UI
  (JWT-cookie-authenticated) creates a `product_translations` row for `locale='vi'`;
  `/vi/dish/[slug]` immediately shows it (proves cache revalidation invalidates the vi key too,
  RULE-10); `/` (en) keeps the original English title (base column untouched); test cleans up by
  clearing the vi field and re-saving, verified DB state restored to empty-vi afterwards.

### Design-fidelity — visual baseline (`tests/i18n/entity-i18n-visual-baseline.spec.ts`, 6/6 pass)
Screenshots written to `.sdlc/v1/sprint-3-entity-i18n/visual-baseline/`:
`product-edit-{en,vi}-{mobile-360,desktop-1440}.png`,
`category-edit-{en,vi}-{mobile-360,desktop-1440}.png`. Visually confirmed against DAC-01..16:
tab strip + "Chưa dịch" badge + "Copy từ English" render correctly, translated-group fields empty
on VI (fallback), all non-translated fields (slug/price/priority/category/related/images/addons
price+isActive) sit outside the tab region and are visually unaffected by the active tab.

### Migration / seed integrity (re-confirmed via direct DB query against `dev_multi_lang`)
- `products` = 40 rows, `product_translations(locale='en')` = 40 rows (1:1). `product_categories`
  = 4, `product_category_translations(locale='en')` = 4. `product_addons` = 15,
  `product_addon_translations(locale='en')` = 15. Counts match exactly (AC-06.2).
- Re-running is inherently idempotent by design (`ON CONFLICT (entity_id, locale) DO NOTHING` per
  design.md §"Migration & Seed Design") — the existing 1:1 count after the sprint's execute leg
  (seed already ran once) plus the schema's `UNIQUE(entity_id, locale)` constraint make a second
  run a structural no-op; confirmed by DB constraint, not re-executed against prod-like data in
  this pass to avoid disturbing the fixture used by the admin round-trip test (AC-06.3).
- Cột gốc (base columns) verified unchanged — spot-checked `products.title` for id=18
  (`orange-juice`) before/after all admin save tests: `Orange Juice` (unchanged), matching row
  `locale='en'` (NFR-03).

### Cache / no-N+1 (Story-07, NFR-01)
- Confirmed by code read: `getProductsByCategorySlug`, `getProductBySlug`,
  `getProductDetailsBySlug`, `getMultipleProductsByIds` all use Drizzle relational `with: {
  translations: { where eq(locale) } }` (including nested `category.translations` and
  `addons.translations`) — a single round-trip query per call, no per-row follow-up query
  (EC-14). `src/services/cached/products.ts` confirms `locale` is part of every `getKeyParts`
  while every `getTags` stays locale-free (RULE-10) — verified by reading the 5 cached function
  definitions.
- Functionally verified by the cache-per-locale Playwright test (en/vi/en requests each correct)
  and the real save round trip (revalidateTag invalidates both locales from one save).

### Regression (existing sprint-1/sprint-2 suites + tsc + build)
- Full `tests/i18n/` suite run together (114 tests total, `--workers=1`): **114/114 pass** — no
  regression in language-switcher, middleware-detect, routing, static-checks, content-fallback,
  config-i18n-user, regression.spec.ts (admin auth/API/static files), or the sprint-1 visual
  baseline capture.
- `tests/unit/localized-config.test.ts` (sprint-2 config i18n unit suite): 25/25 pass.
- `npx tsc --noEmit`: 0 errors.
- `npx next build`: succeeds, all routes compile (admin + web + API).

## Needs manual verification

1. **Interactive admin login form** (typing email/password on `/admin/login`) — pre-existing
   issue (same as sprint-2, unrelated to this feature): the dev DB role can't `INSERT` into
   `users`/`refresh_tokens` (`permission denied for sequence refresh_tokens_id_seq`). All admin
   tests here authenticate by injecting a signed `access_token` JWT cookie directly (same pattern
   as `tests/i18n/config-i18n-admin.spec.ts`), which exercises every actual admin route/component
   under test but bypasses the login form itself. **Suggested fix:** grant the dev DB role INSERT
   + sequence usage on `users`/`refresh_tokens`, then re-verify the real login flow once.
2. **A real (non-fallback) `vi` product/category/addon on the live menu, at scale** — the current
   fixture DB only has `locale='en'` rows (by design, matching the sprint's actual seed state).
   The genuine "vi content resolves and displays" path is proven end-to-end for ONE product via
   the real-save-round-trip test, and the resolver's per-field logic is unit-tested exhaustively,
   but a human should spot check the visual result on the live site once an admin translates a
   handful of real products/categories/addons in bulk (long text wrapping, VN diacritics
   rendering, RTL-safe layout are all standard Latin-script VI so low risk, but worth a glance).
3. **Deploy-before-seed backward-compat (NFR-compat "code before DB migration")** — the resolver
   functions are proven not to crash when the `translations` array is empty/undefined (unit
   tests: "missing vi row entirely", "undefined translations array"). Actually running the app
   against a schema where the 3 translation tables don't exist yet at all (not just empty) would
   throw at the Drizzle relational-query level (`with: { translations }` referencing a
   non-existent table) — this is expected and out of scope for a resolver-level test; the correct
   guard is deployment ORDER (migrate before deploying the new service code), which is an ops
   concern, not a code path to test. Documented here rather than silently skipped.
4. **Addon translation upsert on add-then-remove-before-save** (AC-02.3/DAC-10) — covered
   structurally by the seed/schema design (translations only ever get an `addon_id` once the
   addon row exists, created inside the same transaction) and by code read of
   `upsertAddonTranslations`/`updateProductAddons`, but not exercised by an end-to-end Playwright
   click-add-click-remove-then-save test in this pass (would need reliable selectors for the
   dynamic addon row's remove button, which is straightforward but was deprioritized given time
   budget and that the underlying mechanism — translations keyed by real DB `addon_id`, addon rows
   without a DB id never get a translation row — structurally cannot produce an orphan by
   construction).

## Undefined edge cases (for user to decide later, not in requirements)

- What happens to `product_addon_translations` when an EXISTING addon (with translations in both
  locales) is deleted mid-edit and the form is saved — CASCADE handles the DB side cleanly
  (verified by schema `onDelete: "cascade"`), but there's no explicit UX confirmation dialog
  warning the admin they're about to lose the addon's VI translation along with it. Cosmetic, not
  a bug.
- `resolveCategoryFields`/`resolveProductFields` currently coalesce an empty string `""` the same
  as `null` (both trigger fallback). If an admin ever wants to intentionally save a genuinely
  BLANK (not "not yet translated") field for a non-default locale — e.g. deliberately hiding
  `subDescription` in Vietnamese while keeping it in English — today's fallback logic makes that
  indistinguishable from "not translated yet" and it will always fall back to English instead.
  Not a current requirement, just noting for future consideration.

## AC/EC/DAC → test mapping

| ID | Where tested |
|---|---|
| AC-01.1 | entity-i18n-admin.spec.ts DAC-01 |
| AC-01.2 | entity-i18n-admin.spec.ts "Real save round trip" |
| AC-01.3 | entity-i18n-admin.spec.ts DAC-03 |
| AC-01.4 | design read (`upsertProductTranslations` stores `""`/null per field) + DAC-06/07 |
| AC-01.5 | entity-i18n-admin.spec.ts DAC-05 |
| AC-02.1 | entity-i18n-admin.spec.ts DAC-11b |
| AC-02.2 | entity-i18n-admin.spec.ts DAC-09 (addon name follows locale) + code read `upsertAddonTranslations` |
| AC-02.3 | Manual verification #4 (structural guarantee, no orphan by construction) |
| AC-03.1/03.2 | entity-i18n-admin.spec.ts DAC-06/07 (product) + DAC-06 (category create) |
| AC-03.3 | entity-i18n-admin.spec.ts DAC-08 |
| AC-04.1 | entity-i18n-admin.spec.ts "Real save round trip" (genuine vi content shown) |
| AC-04.2 | entity-i18n-user.spec.ts (dish + menu vi fallback tests) |
| AC-04.3 | entity-i18n-user.spec.ts (en renders) |
| AC-04.4 | entity-i18n-user.spec.ts (menu page en/vi) |
| AC-04.5 | entity-i18n-user.spec.ts (category-specific menu page) |
| AC-04.6 | entity-i18n-user.spec.ts (price identical across locale) |
| AC-05.1 | entity-i18n-user.spec.ts (quick-cart API tests) |
| AC-05.2 | entity-i18n-user.spec.ts (`/api/products/ids` tests) |
| AC-06.1 | code read (migration file, applied — build/tsc green, tables exist per DB query) |
| AC-06.2 | DB query (counts match 1:1) |
| AC-06.3 | Schema constraint (`UNIQUE(entity_id, locale)` + `ON CONFLICT DO NOTHING`), see integrity note |
| AC-06.4 | design read (`DB_SCHEMA` guard + backup in `scripts/seed-entities-i18n.ts`) |
| AC-07.1 | unit test (`getRequestLocale` priority) + entity-i18n-user.spec.ts cache test + code read of `getKeyParts` |
| AC-07.2 | code read (`getTags` locale-free) + "Real save round trip" (revalidation shows on vi) |
| RULE-01..20 | see design.md §8 mapping; spot-verified via unit + Playwright above, none contradicted |
| EC-01 | unit test (null/empty field COALESCE) |
| EC-02 | unit test + entity-i18n-user.spec.ts (missing vi row fallback) |
| EC-03 | unit test (per-field COALESCE, one field vi non-empty others fallback) |
| EC-04 | unit test (both empty → "") |
| EC-05 | unit test (undefined translations array) + entity-i18n-admin.spec.ts (new-ish product shows EN seeded, VI empty) |
| EC-06 | unit test (`resolveCategoryFields` null description) |
| EC-07 | schema `onDelete: cascade` (code read); no orphan by construction |
| EC-08 | code read `upsertAddonTranslations`/`updateProductAddons` (tx-scoped) |
| EC-09 | "Real save round trip" cleanup step (clear vi field → saved as `""`, not deleted, still falls back) |
| EC-10 | code read (`scripts/seed-entities-i18n.ts` guard, same pattern as `migrate-configs-i18n.ts`) |
| EC-11 | unit test (`getRequestLocale` nothing → en) + Playwright quick-cart test |
| EC-12 | design.md §3 OQ-02 resolution (orders snapshot, out of scope — confirmed no orders schema/service touched) |
| EC-13 | entity-i18n-user.spec.ts cache test + "Real save round trip" (both locale caches invalidated) |
| EC-14 | unit test (resolveAddon) + Playwright quick-cart addon names test + code read (nested `with`) |
| EC-15 | unit test (`resolveLocale`/`getRequestLocale` invalid locale) + Playwright (`?locale=fr`) |
| NFR-01 | code read (relational `with`, 1 round trip) |
| NFR-02 | code read (`getKeyParts` per-locale, `getTags` locale-free) |
| NFR-03 | DB query (counts, base columns unchanged) |
| NFR-04 | code read (`scripts/rollback-entities-i18n.ts` exists, DROP CASCADE, base columns untouched) |
| NFR-05 | full regression suite green (114/114) + tsc/build clean |
| NFR-06 | code read (`routing.locales` driven, no hardcoded locale in resolver/mapping) |
| NFR-07 | entity-i18n-admin.spec.ts DAC-05/13/14/15 |
| NFR-08 | unit tests (no-crash edge values) + Playwright (no "Application error" on any locale/page) |
| NFR-09 | schema `onDelete: cascade` (code read, section 5 design.md) |
| DAC-01..16 | entity-i18n-admin.spec.ts + entity-i18n-visual-baseline.spec.ts (see per-test names above) |
