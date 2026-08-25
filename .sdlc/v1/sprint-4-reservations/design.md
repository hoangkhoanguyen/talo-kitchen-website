# Design — sprint-4-reservations (v1)

Combined spec + design. No separate `requirements.md`; requirements are derived here from
`docs/payloadcms-migration/INVENTORY.md` (Tầng 1 `reservations` + `reservation_status_history`,
Tầng 2 status-history / note-guard / code-gen rules, Tầng 3 `reservation.ts` validation) and the old
app code (`src/db/schemas/reservations/*`, `src/validations/reservation.ts`,
`src/services/reservations.ts`, `src/actions/admin/reservation.ts`), then locked as Key Assumptions.

CODE TARGET (feature-builder writes here, NOT in this repo):
sibling repo `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload/src/`
(Payload 3.88, Next 16, DB schema `dev`).

---

# PART 1 — Human Review

## 1. Design Overview

- **Two collections mirroring the two old tables.** `reservations` (main record) + a **separate**
  `reservation-status-history` collection. This is a 1:1 map of the old `reservations` /
  `reservation_status_history` tables, keeps history queryable/auditable, and is the cleanest shape for
  the sprint-8 data migration (each old row → one new row with `legacyId`). Chosen over an array field
  on the reservation — see Assumptions/Risks.
- **Reservation `code` is hook-generated, never user-entered.** A `beforeChange` (create-only) hook
  generates `LFW` + random and **fixes the old non-unique bug** by looping with a uniqueness check
  (retry up to N times) before assigning. The field is `unique` + `index` and read-only in admin.
- **Status history written by an `afterChange` hook.** When (and only when) `status` differs from
  `previousDoc.status` on an update, the hook inserts one history row (`previousStatus` → `newStatus`).
  This ports `updateReservationStatus`'s transaction into a Payload hook.
- **Internal-note edits guarded by a `beforeChange` hook.** Editing `internalNote` is blocked when the
  current (`originalDoc`) status is `cancelled` or `completed`, reproducing `canEditReservationNote`.
- **`numberOfPeople` becomes a `number`** (old column was `varchar(20)`). Cleaner validation/sorting;
  migration must cast the string to int. See Assumptions.
- **Create is public; read/update/delete are staff-only.** The public `/reservation` booking form
  (frontend, sprint-9) needs unauthenticated create; all other operations require an authenticated user.

## 2. Tech Decisions (user can override)

| Decision | Choice | Why |
|---|---|---|
| Status history storage | **Separate `reservation-status-history` collection** | 1:1 with old table, auditable/queryable, clean sprint-8 migration. Array field would couple history into the reservation row and complicate migration. |
| `numberOfPeople` type | **`number`** (min 1, required) | Old `varchar(20)` was a string only for lack of typing; number gives real validation + sorting. Migration casts `parseInt`. |
| `code` generation | Hook `beforeChange` (create only), `LFW`+random with **uniqueness retry loop** | Fixes old bug where `'LFW'+random` was not checked for collisions. |
| `arrivalTime` type | **`text`** with `HH:mm` regex validate | Payload has no native time-only field; old column was Postgres `time`. Text + regex is the simplest faithful port and matches the old string-based form input. |
| `arrivalDate` type | **`date`** field, `displayFormat` date-only, `pickerAppearance: 'dayOnly'` | Old column was Postgres `date`. |
| `status` | `select`, 6 fixed options, `defaultValue: 'scheduled'` | Ports the old pgEnum; enforced option set. |
| Create access | **Public (`create: () => true`)** | Public booking form. Reads/updates/deletes stay `isAuthenticated`. |
| Access helpers | Reuse `src/access/` (`isAuthenticated`) | Project convention (sprint-3). |

## 3. Risks / Trade-offs

- **Public create surface.** Making `create` public exposes an unauthenticated write endpoint (spam/abuse
  risk). Mitigation options for a later sprint: a captcha / rate-limit / dedicated endpoint. This sprint
  keeps the collection-level public create for parity with the old public booking flow; flagged.
- **Code-gen retry is best-effort, not transactional.** Two concurrent creates could still theoretically
  collide between the uniqueness `find` and the insert. The `unique` DB index is the real guarantee — a
  collision surfaces as a DB unique-violation error. The retry loop just makes it practically never
  happen. Accepted.
- **`numberOfPeople` cast risk in migration.** Any legacy value that isn't a clean integer (e.g. "2-3",
  "nhiều") will fail the cast. Sprint-8 must decide a fallback (e.g. null / 1) — flagged for sprint-8;
  this sprint only defines the number field.
- **History timestamps.** Payload `timestamps: true` adds both `createdAt` and `updatedAt` to the history
  collection; the old table had only `createdAt`. The extra `updatedAt` is harmless. History rows are
  never updated.

---

# PART 2 — Agent Reference

## 4. Architecture

Two new Payload collections registered in `payload.config.ts`, plus three hooks under
`src/collections/hooks/`.

```
Reservations (collection)
  ├─ hooks.beforeChange:  [generateReservationCode, guardInternalNoteEdit]
  ├─ hooks.afterChange:   [appendReservationStatusHistory]
  └─ fields: code, customerFullName, customerPhone, note, internalNote,
             numberOfPeople, arrivalTime, arrivalDate, status, legacyId, legacyUuid

ReservationStatusHistory (collection)   ← written only by appendReservationStatusHistory
  └─ fields: reservation (rel), previousStatus, newStatus  (+ timestamps)
```

Interaction:
- Public booking (frontend, later sprint) → `POST /api/reservations` → `generateReservationCode`
  assigns `code` → row created with `status='scheduled'`.
- Staff changes `status` in admin → `guardInternalNoteEdit` runs first (allows, since only status
  changed) → row saved → `appendReservationStatusHistory` inserts a history row.
- Staff edits `internalNote` on an active reservation → allowed. On a `cancelled`/`completed` one →
  `guardInternalNoteEdit` throws.

## 5. Data Model (schema `dev`)

### Collection `reservations` (slug `reservations`)

| Field | Payload type | Constraints / config | Notes |
|---|---|---|---|
| `code` | text | `unique: true`, `index: true`, `admin.readOnly: true` | Hook-generated `LFW`+random. Not user-entered. |
| `customerFullName` | text | `required`, `minLength: 2`, `maxLength: 255` | |
| `customerPhone` | text | `required`, `minLength: 7`, `maxLength: 20`, `index: true` | Index for admin search. |
| `note` | textarea | `defaultValue: ''`, `maxLength: 1000` | Customer note. |
| `internalNote` | textarea | `defaultValue: ''` | Staff note; edit-guarded. |
| `numberOfPeople` | number | `required`, `min: 1`, `admin.step: 1` | Was `varchar(20)` — migration casts to int. |
| `arrivalTime` | text | `required`, `validate` = `HH:mm` regex | Was Postgres `time`. |
| `arrivalDate` | date | `required`, `admin.date.pickerAppearance: 'dayOnly'`, `displayFormat: 'yyyy-MM-dd'` | Was Postgres `date`. |
| `status` | select | options below, `required`, `defaultValue: 'scheduled'`, `index: true` | Ports pgEnum. |
| `legacyId` | number | `index: true`, `admin.readOnly`, `admin.position: 'sidebar'`, hidden-ish | Old serial id trace. |
| `legacyUuid` | text | `index: true`, `admin.readOnly`, `admin.position: 'sidebar'` | Old `uuid` column preserved for trace/re-point. |

- `status` options (value order preserved from old enum):
  `scheduled`, `confirmed`, `seated`, `completed`, `cancelled`, `no_show`.
- `admin.useAsTitle: 'code'`.
- `admin.defaultColumns: ['code', 'customerFullName', 'customerPhone', 'numberOfPeople', 'arrivalDate', 'arrivalTime', 'status', 'createdAt']`.
- `admin.defaultSort: '-createdAt'` (matches old list order `desc(createdAt)`).
- `timestamps: true` (Payload `createdAt`/`updatedAt`).

### Collection `reservation-status-history` (slug `reservation-status-history`)

| Field | Payload type | Constraints / config | Notes |
|---|---|---|---|
| `reservation` | relationship → `reservations` | `required`, `hasMany: false`, `index: true` | Old `reservation_id` FK. |
| `previousStatus` | select | same 6 options, `required` | |
| `newStatus` | select | same 6 options, `required` | |
| `legacyId` | number | `index`, readOnly, sidebar | Old serial id trace. |

- `timestamps: true` → provides `createdAt` (old table's only timestamp). No `updatedAt` in old table; extra column harmless, rows never updated.
- `admin.useAsTitle: 'id'`; `admin.defaultColumns: ['reservation', 'previousStatus', 'newStatus', 'createdAt']`.
- `admin.defaultSort: 'createdAt'` (old `orderBy: [createdAt]`).

## 6. API Contracts (Payload auto-generated REST)

Payload generates REST from the collection configs; no custom endpoints this sprint. Contracts below are
the generated behavior with the access + validation this design imposes.

### `POST /api/reservations` — create (public)
- Auth: **none required** (`create: () => true`).
- Body (JSON): `customerFullName`, `customerPhone`, `numberOfPeople`, `arrivalTime`, `arrivalDate`,
  `note?`. `status` defaults to `scheduled`. `code` MUST NOT be supplied (hook overwrites).
- Success `201`: `{ doc: { id, code, status: 'scheduled', ... }, message }`.
- Errors:
  - `400` ValidationError — missing/invalid required field, name length, phone length, note > 1000,
    numberOfPeople < 1, bad `arrivalTime` format (EC-05/EC-06). Shape: `{ errors: [{ message, field }] }`.
  - `500` — DB unique violation on `code` if the retry loop somehow exhausted (EC-01 fallback).

### `GET /api/reservations` — list (staff)
- Auth: **authenticated** (`read: isAuthenticated`) → `403` `{ errors:[{message}] }` if anonymous.
- Query: Payload `where`, `limit`, `page`, `sort`. Supports search on `code`/`customerFullName`/
  `customerPhone` (via `where[...][like]`) and `status` filter (`where[status][in]`), replacing the old
  `getAdminReservationTable`.
- Success `200`: `{ docs, totalDocs, page, limit, totalPages, ... }`.

### `GET /api/reservations/:id` — read one (staff)
- Auth: authenticated. `403` if anonymous, `404` if not found.
- To load history: `GET /api/reservation-status-history?where[reservation][equals]=:id&sort=createdAt`
  (replaces old `with: { statusHistory }`).

### `PATCH /api/reservations/:id` — update (staff)
- Auth: authenticated. `403` if anonymous.
- Body: any updatable field. Common: `{ status }` or `{ internalNote }`.
- On `status` change → `appendReservationStatusHistory` writes a history row (RULE-02).
- Errors:
  - `403` guard — editing `internalNote` while status is `cancelled`/`completed` (EC-02). Hook throws
    `Forbidden`; shape `{ errors:[{ message: 'Không thể cập nhật ghi chú cho đặt bàn này' }] }`.
  - `400` ValidationError — same field rules as create.
- Note: old app rejected a no-op status update (`SAME_STATUS`); here an unchanged status simply produces
  **no** history row (EC-03) and succeeds silently. This is acceptable behavior, not an error.

### `DELETE /api/reservations/:id` — delete (staff)
- Auth: authenticated. `403` if anonymous. (Not used by old app UI; kept as Payload default staff op.)

### `reservation-status-history` endpoints
- `read: isAuthenticated`; `create/update/delete` access = **`() => false`** (written only by the hook,
  which runs with `overrideAccess`). Prevents manual tampering with the audit trail.

## 7. UI / Interaction Flow

No custom frontend in this sprint (public booking form is sprint-9). Admin UI is Payload-generated:
- **List view**: columns per `defaultColumns`, sorted newest-first; built-in search/filter covers the old
  admin table's search + status filter. (Old dead param `reservation_type` intentionally not ported.)
- **Edit view**: `code`, `legacyId`, `legacyUuid` are read-only. Changing `status` and saving triggers
  the history hook. Attempting to edit `internalNote` on a `cancelled`/`completed` reservation surfaces
  the guard error as a form-level error toast.
- **History**: visible as its own collection list, filterable by `reservation`.

## 8. Rule & Edge-case Mapping (coverage)

| ID | Requirement (derived) | Where handled |
|---|---|---|
| RULE-01 | `code` auto-generated, unique, not user-entered | `generateReservationCode` hook (create) + `unique`+`index` on `code` + `admin.readOnly` |
| RULE-02 | Log history row when status changes | `appendReservationStatusHistory` afterChange hook |
| RULE-03 | Block `internalNote` edit when status cancelled/completed | `guardInternalNoteEdit` beforeChange hook |
| RULE-04 | Default status `scheduled` | `status` field `defaultValue: 'scheduled'` |
| RULE-05 | Staff-only read/update/delete; public create | Access config (`read/update/delete: isAuthenticated`, `create: () => true`) |
| RULE-06 | fullName 2–255 | `customerFullName` minLength/maxLength |
| RULE-07 | phone 7–20 | `customerPhone` minLength/maxLength |
| RULE-08 | note ≤ 1000 | `note` maxLength 1000 |
| RULE-09 | numberOfPeople required, ≥1 | `numberOfPeople` required + min 1 |
| RULE-10 | arrivalTime & arrivalDate required | both `required` |
| RULE-11 | status limited to 6 enum values | `select` fixed options |
| RULE-12 | History audit trail immutable | history `create/update/delete: () => false` |
| EC-01 | Code collision on generation | Retry loop in `generateReservationCode` + `unique` index as hard backstop |
| EC-02 | Edit internalNote on cancelled/completed | `guardInternalNoteEdit` throws `Forbidden` (403) |
| EC-03 | Update with unchanged status | history hook compares `previousDoc.status` → no row written, no error |
| EC-04 | Legacy `numberOfPeople` stored as string | Field is `number`; sprint-8 migration casts `parseInt` (flagged) |
| EC-05 | Invalid arrivalTime format | `arrivalTime` `validate` HH:mm regex → 400 |
| EC-06 | Missing required fields | Payload `required` validation → 400 |
| EC-07 | Legacy uuid must be preserved | `legacyUuid` text field (+ `legacyId`) |
| NFR-01 | Admin list search/filter performant | `index` on `code`, `customerPhone`, `status`; history `reservation` indexed |
| NFR-02 | Reservation data not publicly readable | `read: isAuthenticated` (only create public) |
| NFR-03 | Auditable status changes | separate `reservation-status-history` collection |

## 9. NFR Design

- **NFR-01 (performance):** DB indexes on `reservations.code` (unique), `customerPhone`, `status`, plus
  `reservation-status-history.reservation`. Covers the old list query (search by code/name/phone,
  filter by status, sort by createdAt). `createdAt` is already indexed by Payload timestamps.
- **NFR-02 (security):** Collection `access.read/update/delete = isAuthenticated`; only `create` is
  public for the booking form. History collection is read-auth + no manual writes.
- **NFR-03 (auditability):** Dedicated history collection, hook-written, write-locked at the access
  layer so the trail can't be edited/deleted through the API.

## 10. Regression-safe Plan

Both collections are **new**; no existing collection is modified. The only shared file touched is
`payload.config.ts`, extended additively:
- Add two imports and append `Reservations`, `ReservationStatusHistory` to the `collections` array.
  Order-independent; no change to existing collections, access helpers, or the `dev` schema of already
  migrated tables. Payload will generate the two new tables in schema `dev` on next start/migrate.
- No change to `src/access/` (reuse existing `isAuthenticated`). No change to `payload-types.ts` by hand
  (regenerated).

## 11. File Change Plan

Created (in `talo-kitchen-payload/src/`):
- `collections/Reservations.ts` — collection config + `HH:mm` inline `validate` for `arrivalTime`.
- `collections/ReservationStatusHistory.ts` — history collection config.
- `collections/hooks/generateReservationCode.ts` — `CollectionBeforeChangeHook`, create-only, retry loop.
- `collections/hooks/appendReservationStatusHistory.ts` — `CollectionAfterChangeHook`, diff status,
  `req.payload.create({ collection: 'reservation-status-history', ... , req })`.
- `collections/hooks/guardInternalNoteEdit.ts` — `CollectionBeforeChangeHook`, throws when guarded.

Modified:
- `payload.config.ts` — import + register the two collections (see diff below).

Regenerated (do not hand-edit):
- `payload-types.ts` — via `payload generate:types`.

CLAUDE.md to follow: root `talo-kitchen-payload/CLAUDE.md` (Payload skill at `.claude/skills/payload/`).

### payload.config registration diff (illustrative)

```ts
// imports
import { Reservations } from './collections/Reservations'
import { ReservationStatusHistory } from './collections/ReservationStatusHistory'

// collections array
collections: [
  Users, Media, Categories, Products, ProductAddons, Customers,
  Reservations, ReservationStatusHistory,
],
```

### Hook behavior notes (for feature-builder)

- `generateReservationCode`: run only when `operation === 'create'`. Build candidate
  `` `LFW${randomAlphanumeric(n)}` ``; query `req.payload.find({ collection:'reservations', where:{ code:{ equals: candidate } }, limit:1, req })`; retry up to ~5 times on hit; assign `data.code = candidate`; return `data`. The `unique` index is the hard guarantee.
- `guardInternalNoteEdit`: run when `operation === 'update'`. If
  `originalDoc.status === 'cancelled' || originalDoc.status === 'completed'` **and**
  `data.internalNote !== undefined && data.internalNote !== originalDoc.internalNote` → throw
  `Forbidden('Không thể cập nhật ghi chú cho đặt bàn này')`. Otherwise return `data`.
- `appendReservationStatusHistory`: run when `operation === 'update'` and `previousDoc.status !== doc.status`. Create one history row `{ reservation: doc.id, previousStatus: previousDoc.status, newStatus: doc.status }` with `overrideAccess: true` and `req`. No row on create (parity with old app, which only logged transitions).

---

## Key Assumptions (locked)

1. **Status history = separate collection** (`reservation-status-history`), not an array field — 1:1 with
   old table, auditable, migration-friendly.
2. **`numberOfPeople` = `number`** (min 1, required), replacing old `varchar(20)`; sprint-8 casts legacy
   strings, with a fallback decision deferred to sprint-8.
3. **Reservation `create` is public**; `read`/`update`/`delete` are `isAuthenticated`. (Booking form is
   unauthenticated.)
4. **`arrivalTime` = text with `HH:mm` regex validate**; **`arrivalDate` = date (day-only)**.
5. **History rows are write-locked** at the API (`create/update/delete: () => false`); only the hook
   writes them.
6. **No custom endpoints** — Payload's generated REST + admin covers all old service/action behavior;
   the old `SAME_STATUS` rejection becomes a silent no-op (no history row).
7. **`legacyId` + `legacyUuid`** both preserved on `reservations` for sprint-8 trace/re-point.

---

## Summary

- **Entities:** 2 new collections — `reservations`, `reservation-status-history`.
- **Endpoints:** 0 custom; Payload-generated REST for both collections (create public on reservations,
  everything else staff-only; history is read-only + hook-written).
- **Hooks:** 3 — `generateReservationCode`, `appendReservationStatusHistory`, `guardInternalNoteEdit`.
- **Tech decisions to review:** (a) status-history as a separate collection vs array; (b)
  `numberOfPeople` as `number` (migration cast); (c) public `create` access on reservations;
  (d) `arrivalTime` as validated text.
- **Coverage:** mapping table covers RULE-01..12, EC-01..07, NFR-01..03 — 100% of derived requirements.
