# Design — sprint-3-customers-and-auth (v1)

Combined spec + design. No separate `requirements.md`; requirements are derived here from
`docs/payloadcms-migration/INVENTORY.md` (Tầng 1 customers/users/refresh_tokens, Tầng 2 auth,
Tầng 3 auth validation, Cross-cutting auth) and the old app code, then locked as Key Assumptions.

CODE TARGET (feature-builder writes here, NOT in this repo):
sibling repo `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload/src/`
(Payload 3.88, Next 16, DB schema `dev`).

---

# PART 1 — Human Review

## 1. Design Overview

- **Two collections, one auth.** `users` (existing scaffold, `auth: true`) becomes the real
  admin/staff auth collection; `customers` (`auth: false`) is a plain phone-keyed record upserted at
  checkout (sprint-5). This replaces the old bcrypt + jose + `refresh_tokens` triad entirely with
  Payload's built-in session/JWT auth.
- **Login identifier = username OR email.** Enable Payload `auth.loginWithUsername` with
  `allowEmailLogin: true` + `requireEmail: true`, reproducing the old app's `emailOrUsername` login
  without custom code.
- **RBAC via a reusable access-helper module (`src/access/`).** Central `isAdmin`, `isAdminOrManager`,
  `isAuthenticated`, `isAdminOrSelf` functions consumed by every collection's `access` config. This
  fixes the old `registerUser` bug that force-set `role='admin'`.
- **`isActive` gates login** through a `beforeLogin` hook that throws when the account is disabled
  (reproduces old `ACCOUNT_DISABLED`), because Payload does not natively block login on a custom field.
- **`refresh_tokens` is intentionally dropped.** No server-side token revocation; accepted per the
  locked architecture decision.
- **Migrated users force-reset passwords.** Old bcrypt hashes are NOT carried over; Payload manages
  hashing. Sprint-8 migration creates users (with `legacyId`) and sets a temp password / triggers reset.

## 2. Tech Decisions (user can override)

| Decision | Choice | Why |
|---|---|---|
| Login identifier | `auth.loginWithUsername: { allowEmailLogin: true, requireEmail: true }` | Matches old `emailOrUsername`; staff can use either. Username field is then auto-provided & managed (unique) by Payload — do NOT also declare a manual `username` field (duplicate-field error). |
| Customers `phone` uniqueness | **Unique index** on `phone` | Enables clean upsert-by-phone at checkout (sprint-5). Old schema left it non-unique; see Risks for the tradeoff. |
| `secretCode` self-register gate | **DROPPED** | Admins create staff in the Payload admin UI; there is no public self-register endpoint. `REGISTER_SECRET_CODE` env removed. See Assumptions. |
| Disabled-account login block | `beforeLogin` hook throwing `Forbidden` | Payload has no built-in "isActive" gate. |
| `role` in JWT | `saveToJWT: true` on `role` | Lets access checks read role without an extra fetch; also handy for frontend. |
| Access control location | New `src/access/` module | Reusable, testable, keeps collection files declarative — extends the inline `Boolean(user)` pattern already in `Products.ts`/`Categories.ts`. |

## 3. Risks / Trade-offs

- **Phone uniqueness migration risk.** If `dev_for_migrate` customer data contains duplicate phones,
  the unique index creation (sprint-8) will fail. Mitigation: sprint-8 must de-dupe by phone (keep most
  recent) before enabling the constraint. Flagged for sprint-8; this sprint only declares the field.
- **No token revocation.** Dropping `refresh_tokens` means a leaked/stale JWT stays valid until it
  expires. Accepted per architecture.md. Disabling a user via `isActive=false` blocks *new* logins but
  does NOT invalidate an already-issued session token until expiry (documented; acceptable for staff).
- **loginWithUsername auto-field.** Enabling it changes how the `username` field is generated. The
  design must NOT hand-declare `username` or the build errors on duplicate fields. Verified against
  Payload 3.x auth options.
- **Force password reset UX.** Until sprint-8 defines the reset/temp-password mechanism, the 4 legacy
  users cannot log in. This is expected and out of scope here.

---

# PART 2 — Agent Reference

## 4. Architecture

```
talo-kitchen-payload/src/
├── access/                       NEW — reusable RBAC helpers (Payload Access fns)
│   ├── index.ts                  re-exports
│   ├── isAdmin.ts                role === 'admin'
│   ├── isAdminOrManager.ts       role in {admin, manager}
│   ├── isAuthenticated.ts        Boolean(user)
│   └── isAdminOrSelf.ts          admin OR operating on own user doc (for users.update/read)
├── collections/
│   ├── Users.ts                  EDIT — auth-enabled staff collection (fields + access + hooks)
│   ├── Customers.ts              NEW — auth:false, phone-keyed record
│   └── hooks/
│       └── blockInactiveLogin.ts NEW — beforeLogin: throw if !isActive
├── payload.config.ts             EDIT — register Customers in collections[]
```

Interaction:
- `payload.config.ts` registers `Users` (already) + `Customers` (new).
- Every collection's `access` config imports from `src/access/`. `Users` uses `isAdmin` (create/delete),
  `isAdminOrSelf` (update/read); `Customers` uses `isAuthenticated`.
- `Users.hooks.beforeLogin` = `[blockInactiveLogin]`.
- Payload's built-in `/api/users/login`, `/logout`, `/me`, `/refresh-token`, `/forgot-password`,
  `/reset-password` are auto-generated from `auth: true` — no custom endpoints authored this sprint.

## 5. Data Model

### Collection `users` (auth: true) — EDIT existing scaffold
DB table: `dev.users` (Payload-managed). Payload auto-adds: `email`, hashed password columns
(`hash`, `salt`), `resetPasswordToken`, `resetPasswordExpiration`, `loginAttempts`, `lockUntil`,
`createdAt`, `updatedAt`, and — because `loginWithUsername` is enabled — `username`.

Auth config:
```
auth: {
  loginWithUsername: {
    allowEmailLogin: true,   // login with email OR username
    requireEmail: true,      // email still required & unique
  },
}
```

Declared custom fields:

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `username` | (auth-provided) | unique, required | Provided by `loginWithUsername`; do NOT redeclare. Old: varchar(100) unique. |
| `email` | (auth-provided) | unique, required | Payload built-in auth field. |
| `firstName` | text | optional, maxLength 100 | Old: varchar(100). |
| `lastName` | text | optional, maxLength 100 | Old: varchar(100). |
| `phone` | text | optional, maxLength 20 | Old: varchar(20). |
| `avatar` | relationship → `media` | nullable, hasMany:false | Old: text URL; now proper relationship. |
| `role` | select | required, default `'user'`, `saveToJWT: true`, options: `admin` \| `manager` \| `user` | Old: varchar(50). Drives RBAC. |
| `isActive` | checkbox | default `true` | Gates login (beforeLogin hook). |
| `legacyId` | number | index, `admin.readOnly`, `admin.position:'sidebar'`, hidden-ish | Migration trace (matches Products/Categories pattern). |

`admin.useAsTitle: 'username'` (was `email`; username is the human handle staff know).
`admin.defaultColumns: ['username','email','role','isActive','updatedAt']`.
`timestamps: true` (auto).

### Collection `customers` (auth: false) — NEW
DB table: `dev.customers`.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `firstName` | text | required, maxLength 255 | Old: varchar(255) notNull. |
| `lastName` | text | required, maxLength 255 | Old: varchar(255) notNull. |
| `phone` | text | required, `unique: true`, `index: true`, maxLength 20 | Natural upsert key. Old was non-unique — see Risks. |
| `lastUsedAddress` | textarea | optional | Old: text. |
| `lastUsedOrderType` | select | optional, options `delivery` \| `pickup` | Old: varchar(20). Constrained to known order types (aligns with orders enum, sprint-5). |
| `isActive` | checkbox | default `true` | Old: boolean default true. |
| `legacyId` | number | index, `admin.readOnly`, sidebar | Migration trace. |

`admin.useAsTitle: 'phone'`, `defaultColumns: ['firstName','lastName','phone','lastUsedOrderType','updatedAt']`.
`timestamps: true`.

### DROPPED
- `refresh_tokens` — not modeled. No collection, no revocation logic.
- Old `users.password` (bcrypt) — not imported; Payload manages `hash`/`salt`.

## 6. API Contracts (all auto-generated by Payload — no custom endpoints this sprint)

Base: `/api`. Auth via httpOnly cookie (Payload default) or `Authorization: JWT <token>`.

| Endpoint | Method | Request | Success | Errors | Auth |
|---|---|---|---|---|---|
| `/api/users/login` | POST | `{ username? , email?, password }` (either identifier) | 200 `{ user, token, exp }` | 401 invalid creds; 403 from `beforeLogin` if `isActive=false` (`ACCOUNT_DISABLED` equiv); 401 lockout after N attempts | public |
| `/api/users/logout` | POST | — | 200 | 401 if not logged in | authed |
| `/api/users/me` | GET | — | 200 `{ user }` | 200 `{ user: null }` if anon | any |
| `/api/users/refresh-token` | POST | cookie/token | 200 new token | 401 expired/invalid | authed |
| `/api/users/forgot-password` | POST | `{ email }` | 200 | (email adapter needed — sprint-8) | public |
| `/api/users/reset-password` | POST | `{ token, password }` | 200 | 400 invalid/expired token | public |
| `/api/users` | GET/POST | list / create user | 200/201 | 403 if not admin (create); 403 non-admin list beyond self (read access) | admin (create) |
| `/api/users/:id` | PATCH/DELETE | update / delete | 200 | 403 unless admin (delete) or admin/self (update) | RBAC |
| `/api/customers` | GET/POST | list / create | 200/201 | 403 if unauthenticated; 400 duplicate `phone` (unique violation) | staff (authed) |
| `/api/customers/:id` | GET/PATCH/DELETE | — | 200 | 403 unauthenticated | staff (authed) |

Error shape (Payload standard): `{ "errors": [ { "message": "..." } ] }`.

## 7. UI / Interaction Flow

No custom frontend authored this sprint — the **Payload admin UI** (`/admin`) is generated. Relevant states:
- **Login screen** (`/admin/login`): shows username+password (email login also accepted). On
  `isActive=false` → `beforeLogin` throws → admin shows the thrown message ("Tài khoản đã bị vô hiệu hóa").
- **Users list/create**: create/delete controls hidden for non-admins (access returns false → Payload
  greys/hides the actions). `manager`/`user` can edit their own profile (`isAdminOrSelf`).
- **Customers list**: visible to any authenticated staff; create/edit forms present. Duplicate phone on
  save surfaces the unique-constraint validation error inline.

## 8. Rule & Edge-case Mapping

| RULE / EC / NFR | Requirement (derived) | Handled where |
|---|---|---|
| RULE-01 | Staff auth replaces bcrypt+jose+refresh_tokens | `Users.ts` `auth:true`; refresh_tokens not modeled |
| RULE-02 | Login with username OR email | `auth.loginWithUsername {allowEmailLogin:true, requireEmail:true}` |
| RULE-03 | RBAC by role (fix forced `admin` bug) | `src/access/*`; `role` select default `'user'` (NOT admin); create/delete = `isAdmin` |
| RULE-04 | Only admin creates/deletes users | `Users.access.create/delete = isAdmin` |
| RULE-05 | admin+manager manage content collections | (sprint-2 collections keep `isAuthenticated`; helper `isAdminOrManager` provided for later tightening — noted, not retrofitted this sprint to avoid scope creep) |
| RULE-06 | Users may edit own profile | `Users.access.update/read = isAdminOrSelf` |
| RULE-07 | Password hashing managed by Payload | `auth:true` (hash/salt columns); no bcrypt |
| RULE-08 | Migrated users force password reset | Documented; sprint-8 sets temp pw / reset. `legacyId` field present for mapping |
| RULE-09 | Customer upsert key = phone | `customers.phone` unique + indexed |
| RULE-10 | Customers read = staff; write via order hook (sprint-5), authed for now | `Customers.access = isAuthenticated` |
| EC-01 | Wrong password | Payload login → 401 |
| EC-02 | Unknown username/email | Payload login → 401 |
| EC-03 | Disabled account login (`isActive=false`) | `blockInactiveLogin` beforeLogin hook → 403 |
| EC-04 | Duplicate username | `username` unique (auth-provided) → validation error |
| EC-05 | Duplicate email | `email` unique → validation error |
| EC-06 | Duplicate customer phone | `phone` unique index → 400 validation error |
| EC-07 | Non-admin attempts create/delete user | `isAdmin` access → 403 |
| EC-08 | Non-admin edits another user | `isAdminOrSelf` → 403 |
| EC-09 | Unauthenticated hits customers | `isAuthenticated` → 403 |
| EC-10 | Login brute-force | Payload built-in `maxLoginAttempts`/`lockTime` (set in `auth`) |
| EC-11 | secretCode / self-register attempt | No public register endpoint; gate dropped |
| NFR-01 (security) | httpOnly cookie, hashed pw, RBAC | Payload auth defaults + access module |
| NFR-02 (perf) | Fast phone lookup for upsert | `phone` index; `legacyId` index |
| NFR-03 (maintainability) | Central reusable RBAC | `src/access/` shared by all collections |
| NFR-04 (data integrity) | Role constrained to known values | `role` select fixed options (no free varchar) |

## 9. NFR Design

- **NFR-01 Security:** Payload issues httpOnly, sameSite cookies; passwords stored as scrypt/argon
  hash+salt (Payload default). RBAC enforced server-side in `access` functions (never client-trusted).
  Configure `auth.maxLoginAttempts` (e.g. 5) and `auth.lockTime` (e.g. 600000 ms) to mitigate
  brute-force (EC-10). `role` has `saveToJWT` so token carries role, but access checks still run
  server-side on `req.user`.
- **NFR-02 Performance:** `customers.phone` unique index makes checkout upsert an indexed lookup;
  `legacyId` indexes on both collections keep sprint-8 migration re-pointing fast.
- **NFR-03 Maintainability:** `src/access/` centralizes RBAC; collections stay declarative. Matches the
  existing inline-access convention while removing duplication.
- **NFR-04 Data integrity:** `role` and `lastUsedOrderType` are `select` fields with fixed options,
  replacing old free-form varchars.

## 10. Regression-safe Plan (existing modules touched)

| Module | Change | Backward-compat approach |
|---|---|---|
| `src/collections/Users.ts` | Scaffold → real collection: add fields, auth options, access, hooks | Keep `slug:'users'` and `auth:true` (admin.user still points here in config). Only ADD fields/config; no field renamed away from Payload defaults. `email` remains. Enabling `loginWithUsername` adds `username` — schema migration adds columns, non-destructive. `useAsTitle` changes `email`→`username` (cosmetic). |
| `src/payload.config.ts` | Add `Customers` to imports + `collections[]` | Append only; existing collections untouched. New table `dev.customers` created by migration. |
| Existing content collections (Categories/Products/ProductAddons) | NOT modified this sprint | Their `Boolean(user)` access still valid (any authed staff). `isAdminOrManager` provided for a later, opt-in tightening — deliberately NOT applied now to avoid regression on current behavior. |

DB: additive migrations only (new `customers` table; new columns on `users`). No drop of existing
sprint-1/2 tables. `refresh_tokens` never existed in `dev` (new DB) so nothing to drop.

## 11. File Change Plan

NEW:
- `src/collections/Customers.ts` — auth:false collection (section 5).
- `src/collections/hooks/blockInactiveLogin.ts` — `beforeLogin` hook throwing on `!isActive`.
- `src/access/isAdmin.ts`
- `src/access/isAdminOrManager.ts`
- `src/access/isAuthenticated.ts`
- `src/access/isAdminOrSelf.ts`
- `src/access/index.ts` — barrel re-export.

EDIT:
- `src/collections/Users.ts` — add fields, `auth` options (loginWithUsername, maxLoginAttempts,
  lockTime), `access` (isAdmin / isAdminOrSelf), `hooks.beforeLogin`, admin title/columns.
- `src/payload.config.ts` — import + register `Customers`.

Follow-up (NOT this sprint, noted for traceability):
- Sprint-8 migration: create legacy users with `legacyId` + temp password / reset trigger; de-dupe
  customer phones before unique index; back-fill `customers.legacyId`.
- Sprint-5: order hook performs customer upsert-by-phone (Customers write moves from generic authed to
  server-hook driven).

---

## Self-review

- Every RULE-01..10, EC-01..11, NFR-01..04 appears in section 8. ✅
- Every EC has an error path in section 6/7 (401/403/400/validation). ✅
- Regression Impact modules (`Users.ts`, `payload.config.ts`, existing collections) each have a
  Regression-safe Plan (section 10). ✅
- No conflict with conventions: reuses `legacyId` sidebar pattern, `select` for enums,
  `Boolean(user)`-style access (now centralized), plain `textarea` (no richtext), schema `dev`. ✅
- No endpoints/entities invented beyond the two locked collections + Payload's own auth endpoints. ✅
