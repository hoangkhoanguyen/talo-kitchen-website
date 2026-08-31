# Test Report — sprint-4-i18n-polish (v1, sprint CUỐI)

Date: 2026-08-31
Branch: `feature/multi-language`
Scope tested: TASK-01..14 (execute commits `8a1f5fc`→`ca07bf2`) — SEO metadata per
locale, hreflang/canonical, sitemap alternates, currency/date formatting, fallback
sweep — plus full version regression (sprint-1/2/3 suites).

## Test run summary

| Suite | Tool | Result |
|---|---|---|
| `tests/unit/*.test.ts` (all, `npx tsx --test`) | node:test | 51/52 pass. 1 pre-existing failure unrelated to sprint-4 (see below) |
| `tests/unit/currency-web.test.ts` (new) | node:test | 8/8 pass |
| `tests/unit/i18n-meta.test.ts` (new) | node:test | 11/11 pass |
| `tests/unit/date-web.test.ts` (sprint-4, pre-existing) | node:test | all pass (part of the 51) |
| `tests/i18n/sprint4-seo-polish.spec.ts` (new) | Playwright | 15/15 pass |
| `tests/i18n/*.spec.ts` full regression (sprint-1/2/3/4), `--workers=1` | Playwright | 135/135 pass |
| `npx tsc --noEmit` | tsc | 0 errors |
| `npx next build` | next build | PASS, all routes compile |

Pre-existing failure (NOT a sprint-4 regression, confirmed unaffected by this
sprint's diff): `tests/unit/entity-translations.test.ts` throws
`This module cannot be imported from a Client Component module` because it
transitively imports `server-only` via `src/lib/env.ts` when run directly under
`node:test`/tsx (works fine inside the real Next.js server runtime). Verified
this already failed identically on commit `8a1f5fc` (start of sprint-4, before
any sprint-4 change) by diffing the working tree against that commit. Out of
scope for this leg — flag to `qa-guard`/owning team as a harness-only gap in the
sprint-3 test, not a product bug.

Also note: `tests/i18n/entity-i18n-user.spec.ts` and `tests/i18n/entity-i18n-admin.spec.ts`
share the same live product row (`orange-juice`) and are **not test-isolated**
from each other; running the full `tests/i18n` folder with Playwright's default
`fullyParallel: true` can produce transient cross-test races (admin test writes
a temp VI title mid-flight while the user test reads it). Confirmed not a
regression: re-running with `--workers=1` (serialized) is 135/135 green. This
pre-existing test-isolation gap (not sprint-4 scope) should be flagged for a
future hardening pass (e.g. dedicate a separate product row per spec file).

## Fix-loop rounds used: 1/6 (Sonnet), no Opus escalation

**Round 1 — real gap found and fixed (not a test-authoring mistake):**
`src/app/(web)/[locale]/dish/[slug]/page.tsx`'s `generateMetadata` already had a
locale-aware `!product` branch (`t("dish.notFound")`), but the page component
unconditionally calls `notFound()` when the product is missing. Per Next.js App
Router semantics, calling `notFound()` **discards** that route's own
`generateMetadata` result and renders the nearest `not-found.tsx` boundary's
metadata instead — so the fallback title in `dish/[slug]/page.tsx` was dead
code, and every 404 (including "product not found") fell back to the static,
non-localized root-layout title (`"TALO Kitchen & Lounge"`, identical on both
locales — violating AC-01.4/EC-01).

**Fix:** added `generateMetadata` to the shared
`src/app/(web)/[locale]/not-found.tsx`, using `getTranslations({locale, namespace:"notFound"})`
(existing localized strings, already used by that page's body) +
`resolveLocale` + `getOgLocale`. Verified with curl: en → `"Page Not Found"`,
vi → `"Không tìm thấy trang"` (previously both were the untranslated brand
default). Re-ran the full suite — green.

**Also fixed (pre-existing test now outdated by sprint-4's intended behavior
change, not a code bug):** `tests/i18n/entity-i18n-user.spec.ts` had a
sprint-3 assertion that the price STRING must be byte-identical between en and
vi. Sprint-4 (Story-05/AC-05.1/AC-05.2) intentionally makes the price DISPLAY
grouping differ per locale (`45.000 VND` vi vs `45,000 VND` en) while the
underlying VALUE stays the same (ASM-09). Updated the assertion to parse both
strings back to a number and compare numerically, per AC-05.3.

## Automatically covered

### Unit (node:test)
- `tests/unit/currency-web.test.ts` (NEW) — `formatCurrencyWebsite`/`formatCurrency`: vi/en grouping, round-trip value equality, `amount=0`, negative amount, no-locale default, admin formatter unaffected.
- `tests/unit/i18n-meta.test.ts` (NEW) — `buildLocalizedUrl`, `buildAlternates`, `buildSitemapLanguages`, `getOgLocale`: locale-agnostic loop over `routing.locales`, as-needed URL scheme, bidirectional hreflang consistency, self-referencing canonical, home/menu path edge cases, unmapped-locale safety.
- `tests/unit/date-web.test.ts` (pre-existing, re-verified green) — `formatReservationDate`/`formatReservationTime`: vi/en format, 12h/24h, null/malformed input, TZ-safety (UTC-pinned, no offset shift).
- `tests/unit/localized-config.test.ts` (sprint-2, re-verified green, 33 tests).

### Playwright — API/HTML (`request` fixture, real dev server)
- `tests/i18n/sprint4-seo-polish.spec.ts` (NEW, 15 tests) — see AC/EC mapping below. Covers all 6 metadata pages (home, dish/[slug], menu/[category], reservation, cart, checkout), sitemap.xml hreflang, 404 fallback metadata, no-runtime-error page sweep, `<html lang>`.
- `tests/i18n/regression.spec.ts`, `routing.spec.ts`, `middleware-detect.spec.ts`, `language-switcher.spec.ts` (sprint-1, re-verified green).
- `tests/i18n/config-i18n-admin.spec.ts`, `config-i18n-user.spec.ts`, `content-fallback.spec.ts` (sprint-2, re-verified green).
- `tests/i18n/entity-i18n-user.spec.ts` (16 tests, 1 assertion updated for sprint-4's intended currency-grouping change), `entity-i18n-admin.spec.ts` (sprint-3, re-verified green).
- `tests/i18n/static-checks.spec.ts` — no-hardcoded-English JSX scan, locale-agnostic architecture, en/vi message superset with no empty values.
- `tests/i18n/visual-baseline.spec.ts`, `entity-i18n-visual-baseline.spec.ts` — screenshot capture at mobile/desktop breakpoints, en/vi (no visual design doc for this text-only SEO/format sprint, so used as smoke/no-crash visual capture rather than pixel-diff baseline).

## Needs manual verification

| Item | Reason | Suggested check |
|---|---|---|
| AC-06.1/06.2/06.3 end-to-end visual (real reservation submission) | `formatReservationDate`/`formatReservationTime` are fully unit-tested (deterministic, pure functions) and `ReservationSubmitSuccess.tsx` is a thin pass-through calling them with the correct `locale` (verified by code read) — but a full booking requires driving a custom datepicker widget + writing a real row to the dev Supabase schema, which is high-effort/low-marginal-value automation given the pure-function coverage already in place. | Submit one reservation on `/reservation` (en) and one on `/vi/reservation`; confirm the success screen date shows `MM/DD/YYYY` + `7:30 PM`-style (en) vs `DD/MM/YYYY` + 24h (vi), and that the date shown matches exactly what was picked (no ±1 day shift). |
| Social-share preview rendering (actual Facebook/Twitter/LinkedIn card) | `og:title`/`og:description`/`og:locale`/`og:image` are verified present and locale-correct in the raw HTML (automated), but actual third-party crawler rendering can't be automated in this environment. | Paste a `/dish/<slug>` and `/vi/dish/<slug>` URL into Facebook's Sharing Debugger / Twitter Card Validator once deployed, confirm correct language in the preview. |
| Google Search Console hreflang validation | Requires a live, indexed, publicly reachable deployment — not available pre-deploy. | After deploy, submit `sitemap.xml` in Search Console and check the "International Targeting" report for hreflang errors. |

## Undefined edge cases noticed (not in requirements — flag for product decision)

- **Generic 404 vs "product not found" wording**: because `notFound()` in the dish page discards the page's own metadata, the fixed `not-found.tsx` metadata now shows the GENERIC "Page Not Found"/"Không tìm thấy trang" title for every 404 in the app (including a missing product), not the more specific "Product Not Found" wording EC-01 describes. This is architecturally correct (Next.js can't route-scope metadata past a `notFound()` boundary without a distinct file per segment) and satisfies the safety intent of RULE-05 (non-empty, locale-correct, no raw key) — but if the business wants a literally different wording specifically for "product not found" vs a generic 404, that would require a dedicated `not-found.tsx` under `dish/[slug]/` (a small additional task), which is out of this test leg's remit to add unprompted.
- **`sitemap.ts` category "All" label passed as `label: "All"` (English) into the internal `allCategories` array** — confirmed this string is never emitted into the XML output (only `key`/`url`/`lastModified` reach the sitemap entry), so it does not violate AC-08.1/RULE-13 in practice, but it is still a latent hardcoded string sitting in source that a future refactor touching that array could accidentally leak into user-facing output. Flagging for awareness, not blocking.
- **Test-isolation gap in `tests/i18n/entity-i18n-*.spec.ts`** (pre-existing, sprint-3): both admin and user specs share one live product row with no locking/dedicated fixture, causing flakiness under `fullyParallel: true`. Recommend a follow-up hardening task (separate product ID/slug per spec, or `test.describe.serial` between the two files) — out of scope to fix here since it predates sprint-4 and isn't part of this sprint's AC/EC.

## AC/EC → test mapping

| Requirement | Test |
|---|---|
| AC-01.1 (vi content) | `sprint4-seo-polish.spec.ts` "vi dish page has vi content..." + `entity-i18n-user.spec.ts` (sprint-3, product resolve) |
| AC-01.2 (en content) | `sprint4-seo-polish.spec.ts` "en dish page has en title..." |
| AC-01.3 (og:locale map) | `i18n-meta.test.ts` "getOgLocale maps..."; `sprint4-seo-polish.spec.ts` on dish/home/cart/checkout/reservation |
| AC-01.4 (fallback safety) | `sprint4-seo-polish.spec.ts` "dish 404... non-empty, locale-appropriate title"; `content-fallback.spec.ts` (sprint-2) |
| AC-02.1 (hreflang set on en page) | `sprint4-seo-polish.spec.ts` "en dish page has... full hreflang set" |
| AC-02.2 (bidirectional consistency) | `sprint4-seo-polish.spec.ts` "vi dish page... SAME hreflang set as en"; `i18n-meta.test.ts` "alternates.languages is identical regardless of which locale is 'current'" |
| AC-02.3 (as-needed scheme) | `sprint4-seo-polish.spec.ts` "en URL has no /en prefix, vi URL has /vi prefix"; `i18n-meta.test.ts` |
| AC-02.4 (self-referencing canonical) | `sprint4-seo-polish.spec.ts` (both dish tests check canonical); `i18n-meta.test.ts` "canonical is self-referencing" |
| AC-03.1/AC-03.2 (cart/checkout locale metadata) | `sprint4-seo-polish.spec.ts` "/cart title/description differ per locale..." + "/checkout title/description differ per locale..." |
| AC-04.1/AC-04.2/AC-04.3 (sitemap alternates) | `sprint4-seo-polish.spec.ts` "sitemap has xhtml:link alternates..." |
| AC-05.1/AC-05.2 (currency grouping per locale) | `currency-web.test.ts` |
| AC-05.3 (value unchanged) | `currency-web.test.ts` "round-trips to the same numeric value"; `entity-i18n-user.spec.ts` (updated) |
| AC-05.4 (no component broke) | `next build` full route compile; `sprint4-seo-polish.spec.ts` full-page-sweep test; `static-checks.spec.ts` |
| AC-06.1/AC-06.2 (date/time format) | `date-web.test.ts` (pre-existing, re-verified) |
| AC-06.3 (wall-clock, no tz shift) | `date-web.test.ts` EC-09 case |
| AC-07.1/AC-07.2/AC-07.3/AC-07.4 (fallback pass) | `content-fallback.spec.ts`, `entity-i18n-user.spec.ts` (sprint-2/3, re-verified) + `sprint4-seo-polish.spec.ts` "no runtime error" sweep |
| AC-08.1/AC-08.2 (no hardcode) | `static-checks.spec.ts`; `sprint4-seo-polish.spec.ts` "menu 'All' category label is localized" |
| AC-09.1/AC-09.2/AC-09.3 | `language-switcher.spec.ts`, `middleware-detect.spec.ts`, `config-i18n-admin.spec.ts` (sprint-1/2, re-verified) |
| AC-09.4 (`<html lang>`, no runtime error) | `sprint4-seo-polish.spec.ts` "`<html lang>` matches locale..." + "switching locale... causes no runtime error" |
| EC-01 | `sprint4-seo-polish.spec.ts` "dish 404..." (fixed: see Fix-loop round 1) |
| EC-02/EC-03 | `content-fallback.spec.ts` (sprint-2) |
| EC-04 (home hreflang) | `sprint4-seo-polish.spec.ts` "home hreflang..."; `i18n-meta.test.ts` |
| EC-05 (menu/all path) | `sprint4-seo-polish.spec.ts` "menu/all hreflang..."; `i18n-meta.test.ts` |
| EC-06 (unmapped og:locale, future 3rd locale safety) | `i18n-meta.test.ts` "getOgLocale on an unmapped locale returns undefined" |
| EC-07 (amount 0/negative) | `currency-web.test.ts` |
| EC-08 (null/malformed date/time) | `date-web.test.ts` (pre-existing) |
| EC-09 (no tz offset) | `date-web.test.ts` (pre-existing) |
| EC-10 ("All" label doesn't leak) | Manual code inspection (documented in Undefined edge cases) + `sprint4-seo-polish.spec.ts` menu title check |
| EC-11 (resolveLocale on category metadata) | `sprint4-seo-polish.spec.ts` "invalid/garbage category slug does not crash" |
| EC-12 (no query string leak) | `i18n-meta.test.ts` "path is a clean pathname" |
| NFR (locale-agnostic architecture) | `static-checks.spec.ts` (EC-12 dry-run, no hardcoded locale pairs) |
