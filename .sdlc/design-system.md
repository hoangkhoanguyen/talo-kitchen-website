# Design System — Talo Kitchen (web USER)

> Cross-sprint design tokens. **Extracted from the existing app** (`src/app/globals.css`,
> `src/components/web/**`), not invented. Source of truth for tokens = the Tailwind v4 `@theme inline`
> block in `src/app/globals.css`. This file mirrors those tokens so SDLC agents can reference them by name.
> Rule: **never hardcode a color/size/font in JSX — always use the `web-*` token utilities.**

## Tech / styling conventions

- **Tailwind CSS v4** with `@theme inline` custom properties (no `tailwind.config.js`). Tokens are exposed
  as utility classes (`text-web-h2`, `bg-web-secondary-1`, `text-web-content-1`, …).
- **daisyui** plugin is present but its `light/dark` themes are scoped to the **admin** area
  (`.admin` selector). The **web USER site is single-theme (light only)** by deliberate design — the
  `web-*` palette is fixed hex, there is no dark variant. New web UI must NOT introduce a dark mode.
- Icons: `@iconify/react` via `src/components/common/Icon.tsx` (Phosphor set `ph:*`).
- Class merging: `cn()` from `@/lib/utils`.
- Container: `.container` utility = `mx-auto px-3 md:px-14`.
- Custom spacing token added: `--spacing-4.5` (18px) → `p-4.5`, `gap-4.5`, etc.

## Color tokens (roles)

| Token utility | Hex | Role |
|---|---|---|
| `web-primary` | `#25361E` | Brand dark green — focus outline (`focus:outline-web-primary`), deep accents |
| `web-secondary-1` | `#ECC94B` | Brand yellow accent — active nav state, highlights, warning |
| `web-secondary-2` | `#FEEB79` | Light yellow — soft highlights |
| `web-secondary-3` | `#6B0000` | Deep maroon — cart badge, section subtitle |
| `web-background-1` | `#FFFFFF` | Base page background, header background |
| `web-background-2` | `#F5F5F5` | Muted surface |
| `web-background-3` | `#F8F4EC` | Warm cream surface |
| `web-content-1` | `#1A1A1A` | Primary text (near-black) |
| `web-content-2` | `#444444` | Secondary text |
| `web-content-3` | `#AFAFAF` | Muted text, borders/dividers |
| `web-success` | `#38A169` | Success |
| `web-error` | `#E53E3E` | Error (inputs, validation) |
| `web-warning` | `#ECC94B` | Warning |

### Contrast reference (WCAG, computed)

- `web-content-1` (#1A1A1A) on `web-background-1` (#FFF) → ~16.9:1 (AAA)
- `web-content-2` (#444) on #FFF → ~9.7:1 (AAA)
- `web-content-1` (#1A1A1A) on `web-secondary-1` (#ECC94B) → ~9.6:1 (AAA) — safe for filled-yellow states
- `web-background-1` (#FFF) on `web-secondary-3` (#6B0000) → ~11.9:1 (AAA) — cart badge

## Typography tokens

- Fonts: `--font-poppins-sans` (web body/sans), `--font-brand` (Allogist, display/brand),
  `--font-inter-sans` (admin). Each text token below bundles size + weight + line-height + tracking.
- Every text style ships a desktop + `-mobile` variant; components switch via `lg:` prefix
  (e.g. `text-web-subtitle-mobile lg:text-web-subtitle`).

| Token | Desktop size / weight | Mobile token |
|---|---|---|
| `text-web-h1` | 48 / 700 | `text-web-h1-mobile` (32) |
| `text-web-h2` | 32 / 600 | `text-web-h2-mobile` (24) |
| `text-web-h3` | 24 / 500 | `text-web-h3-mobile` (20) |
| `text-web-h4` | 20 / 600 | `text-web-h4-mobile` (18) |
| `text-web-subtitle` | 18 / 400 | `text-web-subtitle-mobile` (16) |
| `text-web-body` | 16 / 400 | `text-web-body-mobile` (16) |
| `text-web-caption` | 14 / 400 | `text-web-caption-mobile` (14) |
| `text-web-button` | 16 / 700 | `text-web-button-mobile` (14) |
| `text-web-label` | 14 / 400 | `text-web-label-mobile` (14) |

## Spacing / radius / breakpoints / motion

- **Spacing**: Tailwind default scale + custom `4.5` (18px). Header uses `py-1.5 md:py-4.5`, `gap-10`
  (desktop nav), `gap-2 lg:gap-10` (nav cluster).
- **Radius**: Tailwind defaults (`rounded`, `rounded-full`, `rounded-es-lg rounded-ee-lg` for mobile
  panel). No custom radius tokens.
- **Breakpoints**: Tailwind defaults. Key ones in header: `md` (768px) toggles utility-bar padding /
  welcome text; `lg` (1024px) toggles desktop nav vs mobile hamburger menu. Smallest target ~360px.
- **Motion**: `duration-200` (nav hover / links), `duration-300` (mobile menu open/close height),
  `active:scale-95` (mobile tap). Respect `prefers-reduced-motion` for any new animation.

## Interaction-state conventions (observed in existing components)

- **Nav link default**: `text-web-content-1`. **Hover**: `hover:text-web-secondary-1 duration-200`.
  **Active** (current route): `text-web-secondary-1`.
- **Focus**: inputs use `focus:outline-web-primary focus-visible:outline-web-primary` (see `web-input`
  utility). Reuse this for new interactive controls (no visible-focus removal).
- **Filled accent chip** (cart badge): `bg-web-secondary-3 text-web-background-1` circular.
- **Borders/dividers**: `border-web-content-3` and `border-web-secondary-1` (utility bar divider).

## Reusable pieces

- `@/components/common/Icon` (Iconify `ph:*`).
- `cn()` merge helper.
- `.web-input`, `.web-input-error`, `.section-title`, `.section-subtitle`, `.web-reservation-label`
  utilities in `globals.css`.
- Header composition: `Header → HeaderContacts / Logo / DesktopMenu (→ CartButton, MobileMenuButton) /
  MobileMenu`.

---

## Admin tokens (ADMIN area — daisyui, separate from web USER)

> Extracted from existing admin components (`src/components/admin/**`). The admin area uses **daisyui**
> themes scoped to `.admin` (light + dark). Admin UI is **Vietnamese, not translated**. Rule for admin:
> use daisyui semantic classes — do NOT hardcode hex/px.

### Styling conventions (admin)
- daisyui component + semantic classes: `input`, `textarea`, `btn`, `badge`, `tabs`/`tab`, `select`, etc.
- Font: `--font-inter-sans`. Class merge: `cn()`. Icons: `@/components/common/Icon` (Iconify `ph:*`).
- Dark mode: admin supports light+dark via daisyui theme on `.admin`; new admin UI must work in both
  (use semantic daisyui classes, and `text-gray-700 dark:text-gray-400` pattern as seen in `Label`).

### Admin token map (observed)
| Purpose | Class / token |
|---|---|
| Text input | `input rounded-xl w-full` (`ui/form/Input.tsx`) |
| Textarea | `textarea rounded-xl w-full textarea-sm`, `rows=5` (`ui/form/Textarea.tsx`) |
| Input/textarea error | `input-error` / `textarea-error` |
| Field label | `mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400` (`ui/form/Label.tsx`) |
| Required marker | `text-error` `*` |
| Error message | `text-xs text-error mt-1` (`ui/form/WithError.tsx`) |
| Badge (soft) | `badge badge-soft badge-primary` (`FilterTag`), status badges `badge badge-soft <color>` (`OrderTable`) |
| Tabs | `tabs tabs-box` + `tab` / `tab-active` (daisyui; sizes `tabs-xs`/`tabs-sm`) |
| Ghost/small button | `btn btn-ghost btn-xs` |
| Radius | `rounded-xl` (inputs), daisyui defaults elsewhere |

### Contrast / a11y (admin)
- daisyui semantic color pairs (`*-content` on `*`) are AA-compliant by theme construction in both admin
  light and dark; prefer them over ad-hoc colors. Keep visible focus rings (no `outline:none`).

### sprint-2-config-i18n additions
- New admin component `LocalizedFieldInput` (`src/components/admin/features/settings/elements/`):
  locale tab strip (`tabs tabs-box tabs-xs`, one `tab` per `routing.locales`) above a reused
  `SettingsTextInput`/`SettingsTextareaInput`; `Chưa dịch` = `badge badge-warning badge-xs` on an
  untranslated non-default-locale tab; `Copy từ English` = `btn btn-ghost btn-xs`. No new raw tokens
  introduced — all daisyui semantic classes already in the admin theme.

### sprint-3-entity-i18n additions
- New admin component `LocaleTabStrip` (`src/components/admin/features/products/form-elements/`): a
  **group-level** locale selector (vs sprint-2's field-level `LocalizedFieldInput`) reusing the SAME visual
  contract — `tabs tabs-box tabs-xs`, `tab`/`tab-active`, `Chưa dịch` = `badge badge-warning badge-xs`,
  `Copy từ English` = `btn btn-ghost btn-xs text-primary`. One strip controls all translated fields on a
  product/category/addon form; non-translated fields render outside it. Region separator between translated
  and shared fields = `divider` or `border-t border-base-300 pt-4`. No new raw tokens — all daisyui semantic
  classes already in the admin theme; works in admin light + dark.
