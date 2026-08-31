# Test Report — sprint-2-config-i18n (Config i18n)

> Test leg run by test-strategist. Stack: Next.js 16 (Turbopack) + TypeScript + Drizzle/Postgres +
> next-intl. Test tooling: Node's built-in test runner (`node:test`, via `tsx`) for pure-logic unit tests,
> Playwright (already in the repo, `tests/i18n/`) for user-facing + admin UI, direct SQL scripts (via
> `postgres` + `tsx`, same pattern as `scripts/migrate-configs-i18n.ts`) for migration-integrity /
> backward-compat checks against the real `dev_multi_lang` schema.

## Result summary

- **Unit tests:** 25/25 pass — `tests/unit/localized-config.test.ts` (run: `npx tsx --test tests/unit/localized-config.test.ts`).
- **Playwright:** 83/83 pass across the whole `tests/i18n/` suite (sprint-1 regression + sprint-2 new specs), run with `PW_PORT=3100 npx playwright test`.
- **Migration integrity / backward-compat:** verified directly against `dev_multi_lang` (see §"Migration integrity").
- **`tsc --noEmit`**: clean. **`next build`**: PASS.
- **1 real bug found and fixed** (see §"Bug found & fixed during testing") — blocked EC-11/AC-05.2 for the whole app, not just configs.
- **1 pre-existing, out-of-scope minor issue found** (not fixed — see §"Undefined edge cases / notes").

## Bug found & fixed during testing

**`src/lib/revalidate.ts` — `revalidateTag(tag, "default")` never actually invalidated `unstable_cache`
entries.**

- **How it was found:** while testing EC-11/AC-05.2 (admin save must refresh both `/en` and `/vi`), a real
  admin save via the UI showed the new DB value correctly, but neither `/vi` nor a repeat request ever
  reflected it — confirmed with direct DB reads + a temporary debug `console.log` in
  `fetchUIConfigsByKeyResolved` showing the resolve logic itself was correct, but stale content kept being
  served.
- **Root cause:** Next.js 16's `revalidateTag(tag, profile)` now requires a second "cache-life profile"
  argument. Passing the literal string `"default"` is not a real profile (this project has no
  `cacheLifeProfiles` configured — no `dynamicIO`/`cacheComponents` in `next.config.ts`), so Next silently
  took the soft/stale-while-revalidate branch instead of the immediate-purge branch. Every
  `revalidateTag(tag, "default")` call in the app (products, categories, images, **and** configs — this was
  never specific to i18n) was effectively a no-op against `unstable_cache`-tagged data.
- **Fix:** pass an explicit `{ expire: 0 }` cache-life object instead of the string `"default"`. This keeps
  the call inside the typed `revalidateTag(tag, profile: string | CacheLifeConfig)` API (no deprecated
  single-arg call, `tsc`/`next build` stay clean) while forcing the immediate-purge branch
  (`cacheLife.expire === 0` short-circuits to `ActionDidRevalidateStaticAndDynamic` in
  `next/dist/server/web/spec-extension/revalidate.js`).
- **Verified:** re-ran a real admin save → `/vi` round trip before/after the fix — before: stale content
  served indefinitely; after: `/vi` reflects the new value within the same request, `/` (en) stays
  unaffected. Full Playwright suite (83 tests, including sprint-1 regression) still green after the fix.
- **Blast radius:** this fixes cache invalidation for **all** existing revalidation call sites
  (`revalidateProductCreate/Update`, `revalidateCategoryUpdate`, `revalidateConfigUpdate`,
  `revalidateImageChange`, `revalidateAll`), not just sprint-2's new config-i18n cache. It was a pre-existing
  bug (introduced by the Next 16 upgrade, unrelated to sprint-2 code), but sprint-2's EC-11/AC-05.2 is the
  first place a test caught it — before this sprint nothing exercised "does an admin save actually reach the
  live site" end-to-end.
- **Files touched:** `src/lib/revalidate.ts` only (comment explaining the bug + fix left in place).

## Automatically covered

### Unit (`tests/unit/localized-config.test.ts`, pure helpers in `src/lib/localized-config.ts`)
- `isLocalizedField` gating (RULE-01)
- `normalizeLocalized` / `resolveLocalizedString`: string→{en}, null/undefined→{}, partial object, array/number/boolean defensive fallback, fallback-to-default-locale, both-empty→"" (RULE-05, EC-02, EC-05, EC-06, NFR-07)
- **Backward-compat**: an un-migrated plain **string** value at a localized leaf resolves as the default locale, no crash — the exact condition needed to deploy code before running the DB migration (EC-13-equivalent at the service layer)
- `resolveFields`/`resolveConfig`: nested array-of-objects resolved per item (RULE-10, AC-03.5), empty array (EC-07), array length drift vs metadata (EC-08), title/sub_title `[{text}]` never localized (RULE-19, EC-10), missing section (EC-12)
- `migrateLocalized`/`migrateFields`/`migrateConfig`: EC-01..EC-04, idempotency (AC-04.2), only-localized-leaves-touched (RULE-15, AC-04.4)

### Playwright — user-facing (`tests/i18n/config-i18n-user.spec.ts`, 9 tests)
- AC-03.2/EC-05: `/vi` falls back to English `our_story.content` (vi still empty post-migration) — no empty text, no crash
- AC-03.3: `/` (default locale, no prefix under `as-needed`) shows English content
- AC-03.4: non-localized field (phone) identical on `/` and `/vi`
- AC-03.6/NFR-04: no `[object Object]` leak — component receives a resolved string
- EC-12: page renders 200 even with structurally sparse config
- AC-05.1/RULE-08: `/` and `/vi` both succeed, no cache cross-contamination in either direction
- menu_page / reservation_page resolve without crashing on `/` and `/vi`

### Playwright — admin renderer (`tests/i18n/config-i18n-admin.spec.ts`, 9 tests) — ui-design.md DAC-01..DAC-09
- DAC-01/AC-01.1: `role="tablist"` with exactly `routing.locales.length` (2) tabs, defaultLocale first
- DAC-02/AC-01.3: textarea variant renders an actual `<textarea>`
- DAC-03/AC-01.4: non-localized field (`Link Google Map`) renders a single input, no tablist
- DAC-04/AC-01.5: label stays Vietnamese verbatim next to the tab strip
- DAC-05/AC-02.1: "Chưa dịch" badge on the VI tab while vi is empty
- DAC-07/AC-02.3/EC-15: "Copy từ English" fills VI from the current EN value, client-only (no network save triggered)
- **DAC-08/AC-01.2/EC-11 real round trip**: type a VI translation → Save → `/vi` shows the real translation (not fallback) → `/` (en, cookie cleared) is untouched → cleanup restores vi to "" via the same admin flow. This is the test that caught the `revalidateTag` bug above.
- EC-13: page doesn't crash with a mix of localized + non-localized fields
- Regression: `/admin/settings/app/order` (config `app`) still loads, has zero `role="tablist"` anywhere (non-localized/app forms untouched)

### Migration integrity & backward-compat (direct SQL against `dev_multi_lang`)
- Re-ran `DB_SCHEMA=dev_multi_lang npm run migrate:configs-i18n` a second time: **idempotent** — all 4 `ui`
  configs (`homepage`, `layout`, `menu_page`, `reservation_page`) logged "no change / already migrated"
  (AC-04.2).
- Verified via direct query: English content 100% preserved (`our_story.content`, `seo.title`,
  `why_choose_us.reasons[].{title,desc}`, `header.welcom_text`), every migrated field has `vi: ""`.
- Verified non-localized fields untouched post-migration: `hero.title` (array `[{text}]`), `header.phone`,
  `header.open_daily` — still plain values, not `{en,vi}` objects (RULE-19, RULE-24, EC-10).
- Verified `config_type='app'` (`order`, `reservation`) untouched — plain strings like
  `shipping.rules[].description` never became `{en,vi}` (EC-09, RULE-15).
- **Backward-compat (the explicit ask from the caller):** confirmed at two levels —
  1. Unit-level: `resolveLocalizedString("Plain old string", "vi")` / `resolveFields({description: "Plain
     un-migrated EN string", ...}, ...)` return the plain string unchanged for any locale, no throw
     (`tests/unit/localized-config.test.ts`).
  2. Design-level: this is exactly what `normalizeLocalized` does (`string` → `{ [defaultLocale]: v }`)
     and what the admin renderer's EC-13 test exercises implicitly through the same helper. This is the
     condition that allows deploying the code to prod *before* running `migrate:configs-i18n` there.

## Needs manual verification

| Item | Why it can't be (fully) automated | Suggested verification |
|---|---|---|
| Real interactive admin login (typing a password in the actual login form) | **Pre-existing, unrelated to sprint-2**: on `dev_multi_lang`, `loginUser` → `createRefreshToken` fails with `permission denied for sequence refresh_tokens_id_seq`/`users_id_seq` — the DB role used by this dev schema can `SELECT`/`UPDATE` `configs` (what sprint-2 needs) but cannot `INSERT` into `users`/`refresh_tokens`. To still exercise the real admin renderer, tests mint a valid `access_token` JWT with the same secret/shape as `signAccessToken` (`src/lib/auth.ts`) and inject it as a cookie — proven equivalent (proxy only checks cookie presence; no route in this sprint queries the DB for the acting user). Recommend granting the dev DB role `INSERT`/sequence privileges on `users`/`refresh_tokens` so real login works in this environment, or seeding a working admin account with a known password out-of-band. |
| Visual/subjective design judgment (does the tab strip *feel* right, spacing taste, etc.) | Screenshots were captured and structurally verified (tab count, textarea vs input, badge presence/absence, no horizontal overflow at 360px) but a human aesthetic pass is still valuable. | Open `.sdlc/v1/sprint-2-config-i18n/visual-baseline/admin-localized-field-*-{mobile-360,desktop-1440}.png` and eyeball against `ui-design.md`. |
| Admin dark theme (`data-theme` alternate) for DAC-11 contrast | The admin layout hardcodes `data-theme="light"` (`src/app/(admin)/layout.tsx`) — there is currently no dark-mode toggle in the admin at all, so a dark-theme screenshot of this component cannot be produced; this is a pre-existing admin-wide constraint, not something sprint-2 introduced or should fix. | If/when admin dark mode ships, re-run the same visual capture with the alternate theme and check contrast. |
| Full "seed a real vi translation across every field in every RULE-20..23 list" | Explicitly out of scope for automated coverage at that granularity — one representative field (`contact.description`, textarea) was exercised end-to-end for the real save→resolve round trip (structurally identical for every other localized field, since they all go through the same `LocalizedFieldInput`/`resolveFields` code path — proven generically by the unit tests covering nested array/object localized fields). | If desired, spot-check 2–3 more fields (e.g. `why_choose_us.reasons[].title`, `header.welcom_text`) the same way in a follow-up manual pass. |

## Undefined edge cases / notes (not in requirements, for the user to decide)

- **Pre-existing, out-of-scope minor bug (found, not fixed): `isRequired` leaks to the DOM on number
  fields.** `SettingNumberField.tsx` destructures `{ control, name, ...props }` from `NumberField &
  CommonField` without excluding `isRequired`, so it gets spread onto `SettingsNumberInput` → eventually a
  native `<input>`, producing a console warning ("React does not recognize the `isRequired` prop on a DOM
  element..."). Reproduced on `/admin/settings/ui/homepage` (which has number fields elsewhere on the page,
  unrelated to any localized field) — confirmed unrelated to sprint-2's `TextField`/`TextareaField` changes
  (`SettingTextField`/`SettingTextareaField`/`LocalizedFieldInput` all correctly destructure `isRequired`
  before spreading). Cosmetic only (no functional break), left as-is since it's outside this sprint's File
  Change Plan — flagging for a future cleanup task.
- **NEXT_LOCALE cookie persistence interacts with manual testing order.** Not a bug — documented,
  intentional next-intl behavior (`proxy.ts`: "path prefix > cookie NEXT_LOCALE > Accept-Language >
  defaultLocale") — but worth calling out for whoever manually tests next: after visiting `/vi` once, a bare
  `/` will keep redirecting to `/vi` in the same browser session until the cookie is cleared or a different
  browser/incognito window is used. Testers should open a fresh/incognito window (or clear cookies) to
  verify the true default-locale (en) behavior of `/`.
- **Real translated `vi` content is not yet populated for the 3 other RULE-20..23 fields families the caller
  suggested spot-checking** (this is expected — sprint-2 only builds the mechanism; content entry is a
  content/ops task, not a code task).

## AC / EC / NFR / DAC → test mapping

| ID | Covered by |
|---|---|
| AC-01.1 | `config-i18n-admin.spec.ts` DAC-01 |
| AC-01.2 | `config-i18n-admin.spec.ts` DAC-08 (real save→DB shape) |
| AC-01.3 | `config-i18n-admin.spec.ts` DAC-02 |
| AC-01.4 | `config-i18n-admin.spec.ts` DAC-03 |
| AC-01.5 | `config-i18n-admin.spec.ts` DAC-04 |
| AC-02.1 | `config-i18n-admin.spec.ts` DAC-05 |
| AC-02.2 | `config-i18n-admin.spec.ts` DAC-08 (badge disappears after non-empty save) |
| AC-02.3 | `config-i18n-admin.spec.ts` DAC-07 |
| AC-03.1 | `config-i18n-admin.spec.ts` DAC-08 (`/vi` shows real translation after save) |
| AC-03.2 | `config-i18n-user.spec.ts` (fallback), unit tests (EC-05) |
| AC-03.3 | `config-i18n-user.spec.ts` |
| AC-03.4 | `config-i18n-user.spec.ts`, unit tests |
| AC-03.5 | unit tests (`resolveFields` nested array/object) |
| AC-03.6 | `config-i18n-user.spec.ts` (no `[object Object]`), unit tests |
| AC-04.1 | migration integrity (direct DB check, EN preserved / vi seeded) |
| AC-04.2 | migration integrity (re-run = "no change"), unit tests (idempotency) |
| AC-04.3 | migration integrity (`config_type='app'` untouched) |
| AC-04.4 | unit tests (nested array/object migrate) |
| AC-04.5 | migration script itself scoped to `DB_SCHEMA` (manual/CLI, already run + re-verified) |
| AC-05.1 | `config-i18n-user.spec.ts` (per-locale cache, no cross-contamination) |
| AC-05.2 | `config-i18n-admin.spec.ts` DAC-08 (this is the test that caught the `revalidateTag` bug) |
| RULE-01..25 | unit tests + admin/user Playwright specs (see per-RULE comments in `tests/unit/localized-config.test.ts`) |
| EC-01..EC-15 | unit tests (EC-01..EC-04, EC-06..EC-10, EC-12), admin spec (EC-13, EC-15), user spec (EC-05, EC-06, EC-12) |
| NFR-01/02 | design-level (in-memory resolve, no extra DB round trip) + Playwright cache tests; not separately load-tested (out of scope for this stack/sprint size) |
| NFR-03 | migration integrity re-run (idempotent, EN preserved) |
| NFR-04 | `config-i18n-user.spec.ts` (component receives plain string, unchanged) |
| NFR-05 | design/code review (locale list driven by `routing.locales` everywhere touched) — not independently re-tested by adding a 3rd locale in this pass |
| NFR-06 | admin spec DAC-04 (VN labels), DAC-05 (badge) |
| NFR-07 | unit tests (defensive normalize on string/null/array/number/boolean), admin spec EC-13 |
| DAC-01..DAC-09 | `config-i18n-admin.spec.ts` (see per-test names) |
| DAC-10 | code review of `LocalizedFieldInput.tsx`: no hex/inline style, daisyui classes only |
| DAC-11 | partially — contrast/focus not measured programmatically; admin has no dark theme to compare against (see manual-verification note) |
| DAC-12 | `visual-baseline/admin-localized-field-*-mobile-360.png` — tabs wrap, no horizontal overflow |
| DAC-13 | design-level (tab strip generated from `routing.locales.map`, not hardcoded) — not independently re-tested with a 3rd locale |
| Regression §10 (app config, non-localized fields, happy path) | `config-i18n-admin.spec.ts` regression test, `config-i18n-user.spec.ts` full-suite green (83/83 incl. sprint-1) |

## Self-review

- Every AC/EC/RULE/NFR/DAC has a test or an explicit, genuinely-justified manual-verification/note entry — yes (table above).
- Tests actually ran and passed, not just written: yes — 25 unit + 83 Playwright, all green, re-run after the `revalidateTag` fix to confirm no regression.
- Nothing was pushed to "manual verification" out of laziness: the admin-login item is a real DB-permission blocker outside this sprint's scope (worked around with a JWT-cookie injection that is provably equivalent for what this sprint needs to test); the dark-theme item is a real product gap (admin has no dark mode at all); the "seed every field" item is a genuine scale/scope tradeoff with unit-level generic coverage already proving the shared code path.
- No assertion was loosened to fake green — the one red test (`DAC-08`) was diagnosed to a real cache-invalidation bug in shared infra and fixed at the root cause (`src/lib/revalidate.ts`), not by relaxing the assertion.
