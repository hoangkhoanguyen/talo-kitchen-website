# Test Report — sprint-1-i18n-foundation

> Skill: test-strategy + design-fidelity. Branch: `feature/multi-language`. Server under test: `npx next dev -p 3100`
> (port 3000 is occupied by an unrelated sibling app — used 3100 for the whole test run). DB: Supabase remote,
> schema `dev_multi_lang` (read-only, used a real seeded product `orange-juice` for dynamic-content checks).

## Tooling

- **Playwright** (`@playwright/test@1.62.1`, added as devDependency — browsers already cached in
  `~/Library/Caches/ms-playwright`, no `playwright install` run) for routing/middleware/switcher/regression/
  visual checks — real HTTP via `request` fixture + real browser via `page` fixture.
- Plain Node/TS assertions (still run through the Playwright test runner for a single `npx playwright test`
  entry point) for static source checks: hardcoded-string grep, locale-agnostic structure, `messages/*.json`
  shape.
- Config: `playwright.config.ts` (repo root), tests under `tests/i18n/`.
- Run: `npx playwright test` (all 64 tests, single chromium project).

## Automatically covered (64/64 passing)

### Routing / locale prefix (`tests/i18n/routing.spec.ts` — 15 tests)
- `/` no cookie/Accept-Language → 307 → `/en`.
- Unlocalized path (`/dish/orange-juice`) → 307 → `/en/dish/orange-juice` (path preserved).
- `/en/menu/all` → 200, `<html lang="en">`, no redirect.
- `/vi/menu/all` → 200, `<html lang="vi">`.
- All web-user sub-routes reachable at both `/en/*` and `/vi/*`: `menu`, `menu/all`, `dish/orange-juice`,
  `reservation`, `checkout`, `cart` (11 routes).
- Invalid locale `/fr/dish/x` and `/fr` → ends in 404 (single hop, no crash, no loop).

### Middleware locale detection (`tests/i18n/middleware-detect.spec.ts` — 4 tests)
- Path wins over cookie: cookie `NEXT_LOCALE=vi` + `/en/menu/all` → renders `en`.
- Cookie `NEXT_LOCALE=vi` + `/` → redirect `/vi`; reload keeps `/vi` and `<html lang="vi">` (no flash to `en`).
- `Accept-Language: vi` + no cookie + `/` → redirect `/vi`.
- `Accept-Language: fr,de` (no en/vi match) + `/` → redirect `/en` (default).

### Language switcher (`tests/i18n/language-switcher.spec.ts` — 8 tests)
- Active-state marking (`aria-current`) flips correctly between `/en` and `/vi`.
- Active segment computed style: `background-color: rgb(236,201,75)` (`web-secondary-1`), text
  `rgb(26,26,26)` (`web-content-1`); inactive text `rgb(68,68,68)` (`web-content-2`).
- Switching EN→VI and VI→EN preserves the current page (`/en/reservation` ⇄ `/vi/reservation`).
- Switching locale on a dynamic route preserves slug + query string (`/vi/dish/orange-juice?ref=abc` →
  `/en/dish/orange-juice?ref=abc`).
- Keyboard: both segments focusable via Tab, distinct accessible names (`English`/`Tiếng Việt`).
- 360px viewport: switcher bounding box stays within the 360px viewport (no overflow/wrap).
- Exactly one segment per configured locale (2 today) — locale-agnostic markup.
- Labels `EN`/`VI` render identically regardless of active locale.

### Regression — admin auth / web API / static files (`tests/i18n/regression.spec.ts` — 8 tests)
- `/admin/dashboard`, `/admin/orders` not logged in → 307 → `/admin/login?callback_url=...`, **no locale
  prefix**, exact callback URL verified.
- `/admin/register` → 200, no locale prefix.
- `/api/products/ids` and `/api/products/quick/18` → 200 JSON, not prefixed by locale.
- `/robots.txt`, `/sitemap.xml`, `/site.webmanifest` → 200, not redirected/404'd by i18n middleware.
- Unknown path outside any locale → resolves to 404 (no redirect loop).

### Static content / fallback / dynamic content (`tests/i18n/content-fallback.spec.ts` — 3 tests)
- Reservation page heading is `"Make a Reservation"` on `/en`, and NOT present (translated) on `/vi`.
- No raw i18n key leakage pattern detected on `/vi/reservation`.
- Dynamic product title "Orange Juice" renders identically on `/en/dish/orange-juice` and
  `/vi/dish/orange-juice` (dynamic content correctly left untranslated per RULE-11/EC-07).

### Static source checks — no server required (`tests/i18n/static-checks.spec.ts` — 5 tests)
- No leftover hardcoded English JSX strings for a sample of previously-hardcoded strings across
  `src/app/(web)` and `src/components/web` (Make a Reservation, Reservation Details, Preferred Date, Please
  fill out all required fields, Add to Cart, Your cart is empty).
- `src/i18n/routing.ts` centralizes `locales`/`defaultLocale`; `LanguageSwitcher.tsx` maps over
  `routing.locales` (no hardcoded 2-entry markup).
- `messages/vi.json` has no orphan keys outside `messages/en.json`'s key set; no empty-string values in
  either catalog (would break the fallback contract).
- `next.config.ts` wraps `createNextIntlPlugin` while still declaring `images.remotePatterns`.
- `src/i18n/navigation.ts` contains no hardcoded `"en"`/`"vi"` literals (proves EC-12 — a 3rd locale needs
  only a `routing.ts` array edit + a new `messages/<locale>.json`).

### Visual baseline (design-fidelity) — `tests/i18n/visual-baseline.spec.ts` (16 screenshots, created)
- Screenshots captured at 360px (smallest) and 1440px (largest), light theme only (web-user site is
  single-theme, confirmed in ui-design.md), for: home (en+vi), menu, dish, reservation, checkout, cart,
  and the localized 404 page.
- Stored at `.sdlc/v1/sprint-1-i18n-foundation/visual-baseline/*.png` (first-run baseline; future sprints
  should diff new screenshots against these).
- Manually inspected `home-vi-desktop-1440.png` and `home-en-mobile-360.png`: layout/spacing/colors
  unchanged vs. the pre-i18n app; static labels translated (e.g. "Đặt Bàn Ngay", "Vị trí", "Liên hệ");
  dynamic content (reviews, hero images) unchanged (expected, RULE-11).
- Verified at 360px the switcher renders `EN | VI` in the header utility bar with `EN` segment
  highlighted yellow (`web-secondary-1`) — matches DAC-01/04/05.

## AC / EC / NFR / DAC → test mapping

| ID | Test |
|---|---|
| AC-01.1 | language-switcher.spec.ts: "AC-01.1" |
| AC-01.2 | language-switcher.spec.ts: "AC-01.2" |
| AC-01.3 | language-switcher.spec.ts: "AC-01.3/DAC-04" |
| AC-02.1 | routing.spec.ts: "AC-02.1/EC-01", "AC-02.1: unlocalized path…" |
| AC-02.2 | routing.spec.ts: "AC-02.2" |
| AC-02.3 | routing.spec.ts: "AC-02.3/AC-04.1" |
| AC-03.1 | middleware-detect.spec.ts: "AC-03.1" |
| AC-03.2 | middleware-detect.spec.ts: "AC-03.2" |
| AC-03.3 | middleware-detect.spec.ts: "AC-03.3" |
| AC-03.4 | covered jointly by middleware-detect.spec.ts (path>cookie>Accept-Language>default all individually asserted) |
| AC-04.1 | routing.spec.ts: "AC-02.3/AC-04.1" |
| AC-04.2 | routing.spec.ts: "AC-04.2/AC-04.3" |
| AC-04.3 | routing.spec.ts: "AC-04.2/AC-04.3" (no hardcoded lang; confirmed by reading `[locale]/layout.tsx`) |
| AC-05.1 | content-fallback.spec.ts: "AC-05.1/AC-05.2" |
| AC-05.2 | content-fallback.spec.ts: "AC-05.1/AC-05.2" |
| AC-05.3 | content-fallback.spec.ts: "EC-06/RULE-08" + static-checks.spec.ts (no empty values / fallback merge in `request.ts` reviewed) |
| AC-05.4 | static-checks.spec.ts: "AC-05.4" |
| AC-06.1 | regression.spec.ts: "AC-06.1/AC-06.2/EC-05", "AC-06.1: /admin/register…" |
| AC-06.2 | regression.spec.ts: "AC-06.1/AC-06.2/EC-05" |
| AC-06.3 | manual verification (see below) |
| RULE-01 | static-checks.spec.ts: "RULE-01/EC-12" |
| RULE-02 | routing.spec.ts (localePrefix always via all sub-route/redirect tests) |
| RULE-03 | middleware-detect.spec.ts (path>cookie>Accept-Language>default) |
| RULE-04 | language-switcher.spec.ts (AC-01.1/01.2 — switch preserves path via cookie-setting nav) |
| RULE-05 | routing.spec.ts: "EC-03/RULE-05" |
| RULE-06 | routing.spec.ts (`<html lang>` assertions) |
| RULE-07 | content-fallback.spec.ts + static-checks.spec.ts (no hardcoded strings) |
| RULE-08 | content-fallback.spec.ts: "EC-06/RULE-08" + static-checks.spec.ts: "RULE-08" |
| RULE-09 | regression.spec.ts (`/api`, `/admin` untouched by locale routing) |
| RULE-10 | regression.spec.ts (admin auth redirects intact) |
| RULE-11 | content-fallback.spec.ts: "EC-07/RULE-11" |
| RULE-12 | language-switcher.spec.ts EC-09 (nav preserves locale on dynamic route); code review of `Link`/`useRouter` imports from `@/i18n/navigation` across affected files (see design.md File Change Plan) — spot-checked reservation/dish |
| EC-01 | routing.spec.ts: "AC-02.1/EC-01" |
| EC-02 | middleware-detect.spec.ts: "EC-02/RULE-03" |
| EC-03 | routing.spec.ts: "EC-03/RULE-05", "EC-03: invalid locale root" |
| EC-04 | regression.spec.ts: "RI-02/EC-04" (×2) |
| EC-05 | regression.spec.ts: "AC-06.1/AC-06.2/EC-05", "AC-06.1/EC-05: admin orders…" |
| EC-06 | content-fallback.spec.ts: "EC-06/RULE-08" |
| EC-07 | content-fallback.spec.ts: "EC-07/RULE-11" |
| EC-08 | language-switcher.spec.ts (switch preserves current page = internal nav keeps locale) |
| EC-09 | language-switcher.spec.ts: "EC-09" |
| EC-10 | middleware-detect.spec.ts: "AC-03.1" (reload keeps `<html lang="vi">`) |
| EC-11 | manual verification (see below) |
| EC-12 | static-checks.spec.ts: "RULE-01/EC-12", "EC-12 dry-run" |
| NFR-01 | code review only (RSC `getTranslations` usage) — see manual verification |
| NFR-02 | visual-baseline.spec.ts screenshots + manual inspection (no visual diff vs. pre-i18n) |
| NFR-03 | language-switcher.spec.ts: DAC-02/DAC-03 (contrast + keyboard + aria-current) |
| NFR-04 | routing.spec.ts + regression.spec.ts (no redirect loops observed on any tested path) |
| NFR-05 | static-checks.spec.ts: "EC-12 dry-run" |
| NFR-06 | code review (`NEXT_LOCALE` cookie only carries locale code; no sensitive data) |
| NFR-07 | static-checks.spec.ts (`routing.locales` single source; cookie name `NEXT_LOCALE` per next-intl default) |
| DAC-01 | language-switcher.spec.ts: "DAC-01/DAC-02" |
| DAC-02 | language-switcher.spec.ts: "DAC-01/DAC-02" |
| DAC-03 | language-switcher.spec.ts: "DAC-03" |
| DAC-04 | language-switcher.spec.ts: "AC-01.3/DAC-04" |
| DAC-05 | language-switcher.spec.ts: "DAC-05" + visual-baseline screenshots @360px |
| DAC-06 | language-switcher.spec.ts: "DAC-06" |
| DAC-07 | language-switcher.spec.ts: "DAC-07" |
| DAC-08 | visual-baseline.spec.ts screenshots (all pages) + manual inspection |
| DAC-09 | visual-baseline.spec.ts "not-found" screenshots (360/1440) |
| DAC-10 | routing.spec.ts (`<html lang>` assertions cover this) |

## Needs manual verification (5 items — genuinely not automatable in this pass)

1. **AC-06.3 — admin labels stay Vietnamese, not read from `messages/*.json`**: requires an authenticated
   admin session (login flow) which is out of this sprint's scope to script (no test admin credentials
   provisioned for this run). Suggested check: log into `/admin/login`, browse a few admin screens, confirm
   Vietnamese labels are unchanged and unaffected by the `NEXT_LOCALE` cookie.
2. **EC-11 — ICU/plural strings with interpolated values** (guest count, totals, "GMT +7"): the current data
   seed doesn't exercise cart quantities or a full checkout total; correctness of ICU placeholders vs.
   business logic (e.g. plural "guest"/"guests") is best confirmed by a human adding items to cart /
   selecting guest counts on `/vi/reservation` and `/vi/cart` and reading the rendered sentence.
3. **NFR-01 — RSC/perf**: bundle-size / client-JS impact of `useTranslations` usage requires a build-size
   comparison tooling out of scope for this pass; `next build` was already run clean in Execute. Suggested:
   run `next build` and eyeball the client bundle diff if regression is suspected later.
4. **RULE-12 full sweep — every Link/router.push in web user code uses locale-aware navigation**: spot-checked
   reservation/dish/cart via the switcher-preserves-page tests and the static-checks import review, but a
   full file-by-file audit of all ~20 files listed in design.md's File Change Plan wasn't scripted (would
   require either a full click-through of every internal link or an AST-level import check per file).
   Suggested: click through Header nav, footer links, ProductCard → dish, Add-to-cart → cart on both `/en`
   and `/vi` once manually.
5. **Subjective visual/UX judgment** on the language switcher placement and the localized `vi` copy quality
   (translation naturalness) — inherently a human call, not a pass/fail assertion.

## Undefined edge cases noticed (not in requirements — flagging for user decision)

- What happens if `NEXT_LOCALE` cookie holds a value outside `["en","vi"]` (e.g. tampered to `"xx"`)? Not
  in EC registry; observed behavior falls back to Accept-Language/default via next-intl's own validation,
  but no explicit test/AC covers this. Low risk (cookie is not user-editable through the UI), flagging only.
- Behavior of `/EN` or `/VI` (uppercase locale segment) is undefined in requirements; next-intl treats
  locale segments case-sensitively so this would currently 404 like any other invalid locale. Not tested
  explicitly; same code path as EC-03.

## Runs

- `npx playwright test` → **64 passed, 0 failed** (single run, no fix loop needed — Execute's build was
  already clean and no test uncovered a functional regression).
- Dev server used for the whole run: `npx next dev -p 3100` (background), DB via `.env.local`
  `DATABASE_URL` / schema `dev_multi_lang`.

## Fix loop

Not needed — all 64 tests passed on first run. 0/6 rounds used.
