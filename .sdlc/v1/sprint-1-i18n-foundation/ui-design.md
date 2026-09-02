# UI Design — sprint-1-i18n-foundation

> Skills: `design-fidelity`, `artifact-design`.
> `design_ui: yes` · `ui_design_source: internal` (EXISTING project → follow the current app style; no
> DESIGN.md and none promised, so NOT waiting on any external input).
> Aesthetic source = the existing web USER app (tokens in `.sdlc/design-system.md`, extracted from
> `src/app/globals.css` + `src/components/web/**`). No new style invented.

---

# PART 1 — HUMAN REVIEW

## Overall concept

Sprint-1 is i18n plumbing. The **only new visual element** is a **Language switcher (EN / VI)** in the
web-user Header. Everything else in scope is behavioral/structural (wrapping pages in `[locale]`, extracting
strings) and **must keep its current visual appearance unchanged** — only the text content changes per
language.

### The one new component: Language switcher — `[generated]`

- **Pattern chosen: a segmented toggle** `EN | VI` (two inline segments in one bordered pill), not a
  dropdown. Rationale: with exactly 2 locales a segmented control is one tap (a dropdown needs
  open → pick = two interactions + a popup state), it is natively keyboard-accessible (two links, no
  focus-trap/menu ARIA to manage), always shows the current locale, and it matches the flat, minimal
  Header. There is no reusable dropdown/popover in `src/components/web/**` today (the 3 files with a
  toggle each hand-roll `useState`), so a dropdown would be net-new complexity for no benefit.
- **Look**: mirrors existing Header conventions — brand yellow `web-secondary-1` marks the active locale
  (same "active = yellow" language the nav links already use), `web-content-3` border/divider,
  `web-primary` focus outline (same as inputs).
- **Placement**: the **upper utility bar** of the Header (the thin row that already holds phone/contacts +
  welcome text). Language is a utility, so it belongs in the utility bar, right-aligned. It is **visible at
  all breakpoints**: on desktop it sits to the right of the welcome text; on mobile the welcome text is
  hidden (`hidden md:block`) so the switcher takes the otherwise-empty right slot. One component, one
  placement, no duplication into the mobile slide-down menu.
- Behavior: choosing a locale navigates to the **same path with the new locale prefix**, preserving path +
  dynamic segments + query, and sets cookie `NEXT_LOCALE` (handled by next-intl navigation). Visual only
  here; routing rules live in requirements (Story-01, RULE-04, EC-08/09).

### Everything else — "no visual change" (confirmed)

- **All web-user pages** (`/`, `menu/[category]`, `dish/[slug]`, `reservation`, `checkout`, `cart`, …) are
  only wrapped under `[locale]`. **Layout, spacing, components, colors stay identical** — only the rendered
  string content switches language. No redesign, no restyle. This is a hard regression rule (NFR-02): the
  `/en` render must be pixel-identical to today.
- **404**: the localized `[locale]/not-found` reuses the **existing 404 layout** (`src/app/not-found.tsx`),
  changing only the text to translated strings. No new 404 design.
- **Dynamic content** (product names, config `ui` sections, reviews) renders exactly as today in every
  locale — expected, not a bug (EC-07).

## Tech decisions

- **Theme**: web USER site is **single-theme (light only)** by existing design — the `web-*` palette is
  fixed hex with no dark variant. The switcher (and all sprint UI) is light-only; no dark-mode tokens are
  added. (daisyui dark is admin-only, out of scope.)
- **New component file**: `src/components/web/shared/header/LanguageSwitcher.tsx` (client component — uses
  next-intl locale-aware `Link`/`usePathname`). Wired into `Header.tsx`'s upper utility bar.
- **Reuse**: `cn()`, existing `web-*` token utilities, and the existing Header layout primitives. No new
  tokens, no new colors.
- **i18n of the switcher's own labels**: the segment labels are the locale **endonyms** `EN` / `VI` (or
  full `English` / `Tiếng Việt` for `aria-label` / title). These are language-neutral and are NOT pulled
  from `messages/*.json` (they read the same in every locale), so the control looks identical on `/en`
  and `/vi`.

---

# PART 2 — AGENT REFERENCE

## Screen / component coverage (every UI item in requirements)

| # | UI item | Source | Design action |
|---|---|---|---|
| 1 | Language switcher (Header, desktop + mobile) | `[generated]` | Full spec below |
| 2 | All web-user pages wrapped in `[locale]` | `[generated]` | **No visual change** — content-only i18n; verify `/en` == current |
| 3 | Localized 404 (`[locale]/not-found`) | `[generated]` | **Reuse existing 404 layout**, translate text only |
| 4 | `<html lang>` per locale | `[generated]` | No visual output (a11y attribute only) |

No other screens/states exist in this sprint.

## Component spec — LanguageSwitcher `[generated]`

**Tokens used (all via utilities — nothing hardcoded):**
- Container border/divider: `border-web-content-3`
- Surface: `bg-web-background-1`
- Active segment: `bg-web-secondary-1 text-web-content-1`
- Inactive segment: `text-web-content-2`, hover `hover:text-web-content-1 hover:bg-web-background-2`
- Type: `text-web-label-mobile lg:text-web-label` (14px), `uppercase`, slight `tracking`
- Radius: `rounded` (container `overflow-hidden`), motion `duration-200`
- Focus: `focus-visible:outline-web-primary` (matches `.web-input`)

**Structure (semantics):**
- `<nav aria-label="Language" >` wrapping an inline-flex bordered container.
- Two locale entries rendered from the central locale list (`src/i18n/config.ts` `locales`) — the
  component maps over locales so adding a 3rd locale needs no markup change (locale-agnostic, RULE-01).
- Each entry = next-intl locale-aware `<Link href={currentPathname} locale={code}>` with:
  - visible label: locale code uppercased (`EN`, `VI`)
  - `hrefLang={code}`, `aria-label` = full language name (`English` / `Tiếng Việt`),
    `aria-current="true"` when it is the active locale
  - divider between segments via `border-l border-web-content-3` (or gap-less segments in one bordered box)

**States:**
| State | Style |
|---|---|
| Default (inactive segment) | `bg-web-background-1 text-web-content-2` |
| Active (current locale) | `bg-web-secondary-1 text-web-content-1`, `aria-current="true"` |
| Hover (inactive) | `hover:text-web-content-1 hover:bg-web-background-2 duration-200` |
| Focus (keyboard) | `focus-visible:outline-web-primary` visible ring, no outline removal |
| Active-press (mobile) | `active:scale-95` (matches MobileMenu links) — optional, honor reduced-motion |
| Disabled / loading / empty / error | **N/A** — static navigation control, no async/empty/error states |

**Responsive:**
- `≥ md` (768px): rendered in the upper utility bar's right group, after the welcome text.
- `< md` (incl. 360px): welcome text is hidden; switcher occupies the right slot. Compact (labels stay
  `EN`/`VI` 14px). Must not wrap or overflow the utility row at 360px.
- `lg` (1024px) hamburger boundary does not affect the switcher — it lives in the utility bar, above the
  logo/nav row, so it stays visible whether the main nav is desktop-inline or collapsed to the hamburger.

**Placement wiring (`Header.tsx`):** in the upper `flex justify-between` row, wrap the right side
(`welcom_text` span) and `<LanguageSwitcher />` together in a `flex items-center gap-4` group so contacts
stay left and the utility group stays right.

**Dark/Light:** single-theme light (see Tech decisions). No dark variant required.

## Design AC (verifiable)

- **DAC-01 [LanguageSwitcher]**: active segment background computes to `#ECC94B` (`web-secondary-1`) and its
  text to `#1A1A1A` (`web-content-1`); inactive segment text computes to `#444444` (`web-content-2`) on
  `#FFFFFF`. No hardcoded hex in the component source (only `web-*` utility classes).
- **DAC-02 [contrast/a11y]**: active-segment text/bg contrast ≥ 4.5:1 (measured ~9.6:1); inactive-segment
  text/bg ≥ 4.5:1 (~9.7:1). PASS.
- **DAC-03 [a11y — keyboard]**: both segments are focusable via Tab and show a visible focus ring
  (`outline-web-primary`); each has an accessible name (`aria-label` English / Tiếng Việt); the current
  locale carries `aria-current="true"`.
- **DAC-04 [active state]**: on `/vi/*` the `VI` segment renders the active (filled yellow) style; on
  `/en/*` the `EN` segment does. (Story-01 AC-01.3.)
- **DAC-05 [responsive]**: at 360px width the switcher renders inline in the utility bar without wrapping,
  overflowing, or overlapping the contacts; at ≥ md it sits right of the welcome text without pushing
  layout out of the container.
- **DAC-06 [locale-agnostic]**: the component renders one segment per entry in `locales` (does not
  hardcode exactly two) — adding a 3rd locale produces a 3rd segment with no markup edit. (RULE-01/EC-12.)
- **DAC-07 [labels locale-stable]**: segment labels (`EN`/`VI`) render identically on `/en` and `/vi`
  (not pulled from `messages/*.json`).
- **DAC-08 [no-visual-change, pages]**: for every wrapped web-user page, the `/en/<path>` render is
  visually identical to the current (pre-i18n) render — same layout/tokens; only text may differ. Verify
  by screenshot diff of `/en/` routes vs baseline (NFR-02). No new styling introduced by the `[locale]`
  wrap.
- **DAC-09 [no-visual-change, 404]**: `[locale]/not-found` reuses the existing 404 layout — same structure
  and tokens as `src/app/not-found.tsx`; only strings are translated.
- **DAC-10 [html lang]**: `<html lang>` equals the current locale (`vi` on `/vi/*`, `en` on `/en/*`); no
  hardcoded `lang="en"` remains. (Story-04 — a11y attribute, no visible render.)

## Reuse map

| Need | Reuse (existing) | New |
|---|---|---|
| Locale-aware links | next-intl navigation (`Link`) built from `src/i18n/config.ts` | — |
| Current path | next-intl `usePathname` | — |
| Icon (if a globe is ever added) | `@/components/common/Icon` (`ph:translate` / `ph:globe`) | — |
| Class merge | `cn()` from `@/lib/utils` | — |
| Tokens | all `web-*` utilities (`.sdlc/design-system.md`) | none |
| Header host | `Header.tsx` upper utility bar | mount `<LanguageSwitcher/>` |
| Switcher component | — | `src/components/web/shared/header/LanguageSwitcher.tsx` |
| 404 layout | `src/app/not-found.tsx` structure | translated copy only |

Note: a globe icon is optional; the default spec is text-only `EN | VI` for clarity and compactness. If a
globe is added, use `ph:translate` in `web-content-2` at ~18px, left of the segments.

## Self-review

- Every requirements UI item has a spec (switcher + the 3 "no visual change" confirmations). ✅
- Every visual value goes through a `web-*` token; no hardcoded hex/size/font. ✅
- Every screen/state has verifiable Design AC incl. contrast, keyboard a11y, responsive @360px, and
  html-lang. ✅
- No style invented beyond the existing app (source = existing tokens/Header conventions). ✅
- Dark/light: documented as deliberate single-theme (web user site is light-only). ✅
- Reuse-first: only ONE new file; everything else reuses existing components/tokens. ✅
- Switcher has no async states → disabled/loading/empty/error explicitly marked N/A with reason. ✅
