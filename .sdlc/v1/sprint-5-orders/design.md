# Design — sprint-5-orders (v1)

Combined spec + design. No separate `requirements.md`; requirements are DERIVED here from
`docs/payloadcms-migration/INVENTORY.md` (Tầng 1 orders/order_items/order_item_addons/order_status_history,
Tầng 2 CRITICAL rules, Tầng 3 checkout validation, Tầng 4 admin order API) and the old app code
(`src/db/schemas/orders/*`, `src/services/orders.ts`, `src/actions/admin/order.ts`,
`src/actions/web/order.ts`, `src/validations/checkout.ts`), then locked as **Key Assumptions**.

CODE TARGET (feature-builder writes here, NOT in this repo):
sibling repo `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload/src/`
(Payload 3.88, Next 16, DB schema `dev`). This SDLC doc lives in the current repo only.

This is the most complex sprint: 4 new collections + 1 custom public endpoint + 5 hooks, all wired to
enforce the anti-price-tampering rule server-side.

---

# PART 1 — Human Review

## 1. Design Overview

- **Four separate collections, not nested arrays.** `orders`, `order-items`, `order-item-addons`,
  `order-status-history`. This mirrors the 4 old Drizzle tables 1:1, keeps snapshots queryable, and makes
  the sprint-8 legacy→Payload row migration a straight per-table mapping with `legacyId`. Trade-off vs
  array-in-order discussed in §3.
- **Order creation goes through ONE dedicated public endpoint** `POST /api/orders/checkout` (registered on
  the `orders` collection). It runs, atomically inside a single DB transaction: (1) `validateOrderData`
  anti-tamper re-fetch, (2) server-side price derivation, (3) customer upsert-by-phone, (4) order + items +
  addons creation with snapshots, (5) code generation. This replaces the old
  `createOrderAction`→`validateOrderData`+`createOrder` transaction. Reason: the CRITICAL price check MUST
  be server-side and must run in the same transaction as the writes — a public `create` access on the
  collection cannot guarantee the client won't tamper with `price`/`totalPrice`.
- **Admin never creates orders through the endpoint.** Staff read/update orders through the Payload admin
  UI (status change, internal note). Direct `create` via admin/REST is locked down (see §Access) so the
  anti-tamper path can't be bypassed. Admin writes only touch `status` and `internalNote`.
- **Business rules live in typed hooks** under `src/collections/hooks/` (matching the existing
  `cascadeDeleteAddons` / `ensureSinglePrimaryImage` convention): `generateOrderCode`,
  `appendOrderStatusHistory`, `guardOrderInternalNote`. The anti-tamper `validateOrderData` + snapshotting +
  customer upsert live inside the checkout endpoint handler (shared helper module), not in a collection
  hook, because they need the full items/addons payload before any row exists.
- **Order code uniqueness bug fixed** via generate-check-retry loop (old app used a bare
  `Math.random().toString(36)` with no uniqueness guarantee). Unique index + retry.
- **Timestamps normalized.** Old `orders.updatedAt` lacked timezone; Payload's `timestamps: true` gives
  consistent `withTimezone` `createdAt`/`updatedAt` on every collection — bug resolved for free.

## 2. Tech Decisions (user can override)

| Decision | Choice | Why |
|---|---|---|
| Items/addons storage | **Separate collections** `order-items` + `order-item-addons` | 1:1 with old tables → clean sprint-8 migration + queryable snapshots. See §3 for the array alternative. |
| Order-creation surface | **Custom endpoint** `POST /api/orders/checkout`, no auth | Anti-tamper + snapshot + upsert must run server-side atomically; a public collection `create` can't. |
| Where `validateOrderData` lives | **Endpoint handler helper** (`orders/checkout` flow), server-side, re-fetching each product/addon by id with `depth:0` | Needs whole cart before rows exist; keeps CRITICAL logic out of client reach. |
| Price trust model | **Server DERIVES all prices from DB** (stronger than old app) + optional expected-price echo → 400 on mismatch | Old app compared client price to DB price and rejected. We go further: DB price is authoritative for the stored snapshot, so even a passed check can't persist a tampered price. |
| Transaction | **Manual** `payload.db.beginTransaction()` / `commitTransaction` / `rollbackTransaction`, thread `req.transactionID` through every `create` | All-or-nothing checkout; Postgres adapter supports it natively. |
| Code generation | `generateOrderCode` hook (`beforeValidate`, `operation === 'create'`), retry loop against unique index | Fixes non-unique random bug. |
| Status history | Separate `order-status-history` collection, written by `appendOrderStatusHistory` `afterChange` hook | Matches old table; hook compares `previousDoc.status` vs `doc.status`. |
| Internal-note guard | `guardOrderInternalNote` `beforeChange` hook | Reproduces old `canEditOrderNote` (block when cancelled/completed). |
| Enums | Payload `select` for `orderType`, `status`, `paymentMethod` | Old enums were commented-out/unenforced; select enforces the closed set. |
| paymentMethod | `select` with single option `cash` (extensible) | Old app only supported cash. |
| shippingFee | Plain `number` default `0`, value supplied by frontend for this sprint | Shipping rules/methods live in Global `order-settings` (sprint-6). Server-side shipping recompute deferred — see §3 risk. |

## 3. Risks / Trade-offs

- **Separate collections vs nested arrays.** Arrays-in-order would give a single-document read and implicit
  atomicity, but (a) diverge from the old 4-table shape → messier sprint-8 migration, (b) lose the ability
  to query/aggregate line items, (c) make the `order-item-addons` two-level nesting awkward. Chosen:
  separate collections. Cost: checkout must create N+M rows and manage its own transaction.
- **shippingFee is client-supplied this sprint.** Until Global `order-settings` (sprint-6) exists, the
  endpoint trusts the frontend-computed `shippingFee`. This is a residual tamper surface for the fee only
  (not item/addon prices, which are DB-derived). Mitigation: sprint-6 must move fee computation server-side
  and re-derive it inside the checkout handler. Flagged, out of scope here.
- **Public endpoint = no auth.** `POST /api/orders/checkout` is intentionally unauthenticated (web
  customers). It must therefore: validate every input, derive prices from DB, cap items count, and reject
  empty carts. No rate limiting in Payload core — note for a future NFR (reverse-proxy / edge throttle).
- **Transaction + pgbouncer.** Runtime uses the pooler (6543). Manual transactions require a session, which
  the pooler in transaction-pooling mode can still serve per-transaction; verified the adapter opens a
  dedicated connection per `beginTransaction`. If checkout intermittently fails under pooler, fall back to
  `disableTransaction`-free single-connection. Flagged for feature-builder to smoke-test.
- **Snapshot of product image/slug.** Old app stored image URL + slug only in the response, NOT in the DB
  row (order_items has no image column). We ADD `productSlug` + `productImageUrl` snapshot columns to
  `order-items` so the admin/receipt view is stable even if the product later changes. Minor schema
  addition beyond the old table — justified by requirement "snapshot product primary image/slug at
  creation". Documented as an intentional, additive change.

---

# PART 2 — Agent Reference

## 4. Architecture

```
Web customer (checkout page)
        │  POST /api/orders/checkout  (no auth, JSON body)
        ▼
┌─────────────────────────────────────────────────────────────┐
│ Orders.endpoints['/checkout']  (handler)                      │
│  1. parse + shape-validate body (helper: validateCheckoutBody)│
│  2. validateOrderData(items)  ── re-fetch products+addons     │
│     (depth:0) → reject missing/inactive/mismatch/foreign addon│
│  3. beginTransaction()                                        │
│  4. upsertCustomerByPhone(customer, req)                      │
│  5. payload.create('orders', ...)  → fires:                   │
│       • generateOrderCode (beforeValidate, unique+retry)      │
│       • guardOrderInternalNote (beforeChange, no-op on create)│
│       • appendOrderStatusHistory (afterChange, no-op create)  │
│  6. for each item: derive price/total from DB, snapshot       │
│       productName/price/slug/imageUrl → create 'order-items'  │
│       for each addon: derive price/total → 'order-item-addons'│
│  7. recompute order.totalPrice server-side → update order     │
│  8. commitTransaction()  (rollback on any throw)              │
│  9. return { order, items }                                   │
└─────────────────────────────────────────────────────────────┘

Admin (Payload UI)
   • orders list/detail (REST auto-generated, filters)
   • change status → appendOrderStatusHistory (afterChange) writes history row
   • edit internalNote → guardOrderInternalNote (beforeChange) blocks if cancelled/completed
```

Collections & responsibilities:
- **`orders`** — order header + snapshots of customer + totals + status. Owns the checkout endpoint and 3
  hooks. `useAsTitle: 'code'`.
- **`order-items`** — one row per cart line; relationship → `orders` + `products`; snapshot columns.
- **`order-item-addons`** — one row per selected addon on a line; relationship → `order-items` + `product-addons`; snapshot columns.
- **`order-status-history`** — append-only audit of status transitions; relationship → `orders`.

Shared helper module `src/collections/hooks/orderCheckout.ts` (or `src/lib/orders/`) holds
`validateOrderData`, `upsertCustomerByPhone`, and the price-derivation logic used by the endpoint.

## 5. Data Model

DB schema `dev`. All collections `timestamps: true` (adds `createdAt`/`updatedAt`, both `withTimezone`).
All get a `legacyId` (number, indexed, sidebar readOnly) for sprint-8 trace. `orders` additionally keeps
`legacyUuid` (text) because the old table had a `uuid` unique column.

### Collection `orders` (`src/collections/Orders.ts`)
| Field | Type | Constraints / notes |
|---|---|---|
| `code` | text | **unique**, index, `admin.readOnly`, generated by `generateOrderCode` hook (retry). Old varchar(20). |
| `firstName` | text | required, maxLength 255 |
| `lastName` | text | required, maxLength 255 |
| `customerPhone` | text | required, index, maxLength 20 (search + join to customers) |
| `totalPrice` | number | required, min 0 — **server-computed**, `admin.readOnly` |
| `note` | textarea | optional (customer note) |
| `internalNote` | textarea | `defaultValue: ''` — guarded by hook |
| `orderType` | select | options `delivery`,`pickup`; required. Enforces old commented enum |
| `orderTypeLabel` | text | maxLength 100, optional (display label) |
| `deliveryAddress` | textarea | `defaultValue: ''` |
| `addressNote` | textarea | `defaultValue: ''` |
| `status` | select | options `pending`,`processing`,`completed`,`cancelled`; `defaultValue: 'pending'`; index |
| `paymentMethod` | select | options `['cash']`; required; default `cash` (extensible) |
| `shippingFee` | number | `defaultValue: 0`, min 0 |
| `legacyId` | number | index, sidebar readOnly |
| `legacyUuid` | text | index, sidebar readOnly (old `uuid` column) |

`admin`: `useAsTitle: 'code'`, `defaultColumns: ['code','firstName','lastName','customerPhone','totalPrice','orderType','status','createdAt']`.
`defaultSort: '-createdAt'`.

### Collection `order-items` (`src/collections/OrderItems.ts`)
| Field | Type | Constraints / notes |
|---|---|---|
| `order` | relationship → `orders` | required, index, hasMany false |
| `product` | relationship → `products` | required, index, hasMany false (live ref for trace) |
| `productName` | text | required — **snapshot** at creation |
| `price` | number | required, min 0 — **snapshot** (DB-derived) |
| `quantity` | number | required, min 1 |
| `totalPrice` | number | required, min 0 = `quantity*price + Σ addon totals` (server-computed) |
| `productSlug` | text | snapshot (for receipt/admin link stability) |
| `productImageUrl` | text | snapshot of primary image URL at creation (empty string if none) |
| `note` | textarea | `defaultValue: ''` |
| `legacyId` | number | index, sidebar readOnly |

`admin.useAsTitle: 'productName'`.

### Collection `order-item-addons` (`src/collections/OrderItemAddons.ts`)
| Field | Type | Constraints / notes |
|---|---|---|
| `orderItem` | relationship → `order-items` | required, index, hasMany false |
| `addon` | relationship → `product-addons` | required, index, hasMany false |
| `addonName` | text | required — **snapshot** |
| `price` | number | required, min 0 — **snapshot** (DB-derived) |
| `quantity` | number | required, min 1 |
| `totalPrice` | number | required, min 0 = `quantity*price` |
| `legacyId` | number | index, sidebar readOnly |

`admin.useAsTitle: 'addonName'`.

### Collection `order-status-history` (`src/collections/OrderStatusHistory.ts`)
| Field | Type | Constraints / notes |
|---|---|---|
| `order` | relationship → `orders` | required, index, hasMany false |
| `previousStatus` | text | required, maxLength 50 |
| `newStatus` | text | required, maxLength 50 |
| `legacyId` | number | index, sidebar readOnly |

`createdAt` from `timestamps` serves as the history timestamp (old table had explicit `createdAt`).
`admin.useAsTitle: 'newStatus'`. Rows are written only by the `appendOrderStatusHistory` hook.

## 6. API Contracts

### 6.1 `POST /api/orders/checkout` (custom, public, no auth)
Registered in `Orders.endpoints`. Content-Type `application/json`.

Request body:
```jsonc
{
  "firstName": "string (1..255, required)",
  "lastName": "string (1..255, required)",
  "customerPhone": "string (10..20, required)",
  "orderType": "delivery | pickup (required)",
  "orderTypeLabel": "string (optional)",
  "paymentMethod": "cash (required)",
  "deliveryAddress": "string (required & >=5 when orderType=delivery, else optional)",
  "addressNote": "string (<=300, optional)",
  "note": "string (<=300, optional)",
  "shippingFee": 0,
  "items": [
    {
      "productId": "number (required)",
      "quantity": "number >=1 (required)",
      "note": "string (optional)",
      "addons": [
        { "addonId": "number (required)", "quantity": "number >=1 (required)" }
      ]
    }
  ]
}
```
Note: client `price`/`totalPrice` are NOT read; server derives them from DB. If the client sends an
`expectedTotal`, the handler MAY compare and reject on mismatch (optional tamper signal).

Success `200`:
```jsonc
{
  "success": true,
  "data": {
    "order": { "id": 1, "code": "A1B2C3D4", "totalPrice": 123, "status": "pending", ... },
    "items": [ { "id": 10, "productName": "...", "price": 50, "quantity": 2, "totalPrice": 100,
                 "productImageUrl": "...", "productSlug": "...", "addons": [ ... ] } ]
  }
}
```

Errors (all `{ success:false, error, code }`, thrown as `APIError` with status):
| Status | code | Trigger (EC) |
|---|---|---|
| 400 | `INVALID_BODY` | missing/invalid shape, bad enum, empty `items` (EC-07), quantity<1 (EC-13) |
| 400 | `DELIVERY_ADDRESS_REQUIRED` | orderType=delivery & address <5 chars (EC-12) |
| 400 | `INVALID_ORDER_DATA` | product missing (EC-01) / inactive (EC-02) / price mismatch (EC-03) / addon missing/inactive (EC-04) / addon not belonging to product (EC-05) — mirrors old `INVALID_ORDER_DATA` |
| 500 | `CODE_GENERATION_FAILED` | unique code not found after retries (EC-06) |
| 500 | `ORDER_CREATE_FAILED` | any write failure → transaction rolled back (EC-14) |

CORS: wrap responses with `headersWithCors` so the web frontend origin can call it.

### 6.2 Admin order list — `GET /api/orders` (Payload auto-generated REST)
Auth required (staff). Supports `?limit`, `?page`, `?sort=-createdAt`, and `where[...]` filters replacing
the old hand-rolled query:
- search → `where[or][0][code][like]`, `[firstName][like]`, `[lastName][like]`, `[customerPhone][like]`
- date range → `where[createdAt][greater_than_equal]` / `[less_than_equal]`
- status[] → `where[status][in]=pending,processing`
- orderType[] → `where[orderType][in]=delivery,pickup`

### 6.3 Admin order detail — `GET /api/orders/:id?depth=2`
Auth required. `depth=2` populates items → addons → product/addon refs. Status history fetched via
`GET /api/order-status-history?where[order][equals]=:id&sort=createdAt`.

### 6.4 Status change / internal note — Payload `PATCH /api/orders/:id` (admin UI)
Auth required (`isAuthenticated`). Only `status` and `internalNote` are editable by staff (other fields
`admin.readOnly`). Hook side effects:
- status change → `appendOrderStatusHistory` writes a history row.
- same-status "change" → no history row (hook compares values); the admin UI simply persists unchanged.
  (Old app returned `SAME_STATUS`; in Payload a no-op save is harmless — documented, not an error.)
- internalNote edit while status ∈ {cancelled, completed} → `guardOrderInternalNote` throws `403`
  `CANNOT_EDIT_ORDER` (EC-10).

## 7. UI / Interaction Flow

No new custom UI in this sprint (frontend checkout page is sprint-9; admin uses Payload-generated UI).
Admin states covered by Payload defaults:
- **Orders list**: columns per `defaultColumns`; filter/sort via list controls; empty state = Payload "No
  results".
- **Order detail**: header fields readOnly except `status` (select) + `internalNote` (textarea). Items and
  addons visible via their own collection lists filtered by relationship (or a read-only join view).
- **Error state**: `guardOrderInternalNote` / status hook throws surface as Payload admin toast errors.

## 8. Rule & Edge-case Mapping

| ID | Requirement | Handled by |
|---|---|---|
| RULE-01 | Order code unique, generated, retry (fix random bug) | `generateOrderCode` hook (beforeValidate, create) + unique index on `orders.code` |
| RULE-02 | Reject missing/inactive product (anti-tamper) | `validateOrderData` in checkout handler (re-fetch, `isActive` check) |
| RULE-03 | Reject missing/inactive/mismatch addon; addon must belong to product | `validateOrderData` (addon map keyed per product) |
| RULE-04 | Upsert customer by phone (active); update if changed else create | `upsertCustomerByPhone` in checkout handler, inside txn |
| RULE-05 | Snapshot productName/price + primary image URL + slug; addonName/price | checkout handler derives + writes snapshot columns on `order-items`/`order-item-addons` |
| RULE-06 | `totalPrice` computed server-side (order + items + addons) | checkout handler; fields `admin.readOnly` |
| RULE-07 | Status change → write status history | `appendOrderStatusHistory` afterChange hook (previousDoc vs doc) |
| RULE-08 | Block internalNote edit when cancelled/completed | `guardOrderInternalNote` beforeChange hook |
| RULE-09 | orderType enforced (delivery/pickup) | `select` field options |
| RULE-10 | status enum + default pending | `select` field + `defaultValue: 'pending'` |
| RULE-11 | paymentMethod (cash) enforced | `select` options `['cash']` |
| RULE-12 | deliveryAddress required (>=5) when delivery | `validateCheckoutBody` in handler (mirrors old zod superRefine) |
| RULE-13 | phone 10-20, names required | field constraints + `validateCheckoutBody` |
| RULE-14 | defaults: internalNote/deliveryAddress/addressNote = '' | `defaultValue: ''` on fields |
| RULE-15 | Timezone-consistent timestamps | `timestamps: true` (withTimezone) on all 4 collections |
| RULE-16 | Order creation atomic | manual transaction in checkout handler; rollback on throw |
| RULE-17 | Register 4 collections | `payload.config.ts` collections array (see §11) |
| EC-01 | Product not found | `validateOrderData` → 400 `INVALID_ORDER_DATA` |
| EC-02 | Product inactive | `validateOrderData` → 400 `INVALID_ORDER_DATA` |
| EC-03 | Item price tampered | server derives price; optional expectedTotal echo → 400 |
| EC-04 | Addon missing/inactive | `validateOrderData` → 400 `INVALID_ORDER_DATA` |
| EC-05 | Addon not belonging to product | `validateOrderData` per-product addon map → 400 |
| EC-06 | Code collision exhausts retries | `generateOrderCode` → throw → 500 `CODE_GENERATION_FAILED` |
| EC-07 | Empty items array | `validateCheckoutBody` → 400 `INVALID_BODY` |
| EC-08 | Status update to same status | hook no-ops (no history row); documented non-error |
| EC-09 | Order not found on update | Payload REST → 404 |
| EC-10 | internalNote edit on cancelled/completed | `guardOrderInternalNote` → 403 `CANNOT_EDIT_ORDER` |
| EC-11 | Invalid enum value | `select` field validation → 400 |
| EC-12 | Delivery missing address | `validateCheckoutBody` → 400 `DELIVERY_ADDRESS_REQUIRED` |
| EC-13 | quantity <= 0 | `validateCheckoutBody` + field `min:1` → 400 |
| EC-14 | Partial failure mid-create | transaction rollback → 500 `ORDER_CREATE_FAILED` |
| NFR-01 | Anti-tamper security | prices DB-derived server-side; endpoint only trusted price source |
| NFR-02 | Public checkout, guarded | endpoint `create/update/delete` access on `orders` = staff-only; endpoint validates all input |
| NFR-03 | Admin list query perf | indexes: `code`(unique), `status`, `customerPhone`, `orders.createdAt` (implicit), relationship indexes |
| NFR-04 | Atomicity | manual transaction threaded via `req.transactionID` |
| NFR-05 | RBAC | `access` uses `isAuthenticated` for read/update; create/delete denied to non-staff |

## 9. NFR Design

- **NFR-01 (anti price-tampering, CRITICAL):** `validateOrderData` re-fetches each product (with its
  addons) at `depth:0` inside the endpoint; item/addon `price` and `totalPrice` are computed from the DB
  row, never from the client. Inactive/missing/foreign-addon rows reject the whole order. This is the
  security core of the sprint.
- **NFR-02 (public endpoint hardening):** `orders` collection `access.create` = `() => false` for external
  REST (only the endpoint, running as system, writes); `access.read/update` = `isAuthenticated`;
  `delete` = `isAdmin`. `order-items`/`order-item-addons`/`order-status-history` `create` restricted so
  they're only written transactionally (staff read-only in admin). Endpoint validates body shape, caps
  `items.length` (e.g. ≤ 100), rejects empty carts.
- **NFR-03 (admin list performance):** indexes on `orders.code` (unique), `orders.status`,
  `orders.customerPhone`; `createdAt` covered by timestamp; relationship FKs (`order`, `product`, `addon`,
  `orderItem`) indexed for detail joins and history lookups.
- **NFR-04 (atomicity):** `payload.db.beginTransaction()` → all `payload.create/update` calls pass
  `req` carrying `transactionID` → `commitTransaction` on success, `rollbackTransaction` in `catch`.
- **NFR-05 (RBAC):** all 4 collections import from `src/access` (`isAuthenticated`, `isAdmin`), consistent
  with existing collections; no inline duplication beyond the established `Boolean(user)` pattern.

## 10. Regression-safe Plan

Existing modules touched:
- **`payload.config.ts`** — additive only: import + append the 4 new collections to the `collections`
  array. No change to existing collection order semantics, `db`, `secret`, or `admin`. Order the new
  collections after `Customers` (dependency: `customers`, `products`, `product-addons` already registered
  before them). No schema change to existing tables.
- **`customers` collection** — NOT modified structurally. The checkout handler only performs
  find + create/update via Local API using the existing fields (`phone`, `firstName`, `lastName`,
  `lastUsedAddress`, `lastUsedOrderType`, `isActive`). Relies on the `phone` unique index already declared
  in sprint-3. Backward compatible.
- **`products` / `product-addons`** — read-only from this sprint (validate + snapshot). New relationship
  fields on `order-items`/`order-item-addons` point INTO them but add no columns to them. The Postgres
  adapter does not auto-cascade; deleting a product with historical orders is out of scope — snapshots
  make order rows self-sufficient, so a future product delete does not corrupt order history (the live
  `product` relationship may dangle but `productName`/`price`/`slug`/`imageUrl` snapshots remain). Note for
  feature-builder: do NOT add order cascade to `cascadeDeleteAddons`.

## 11. File Change Plan

Create (in `talo-kitchen-payload/src/`):
- `collections/Orders.ts` — collection + `endpoints: [checkoutOrder]` + hooks wiring.
- `collections/OrderItems.ts`
- `collections/OrderItemAddons.ts`
- `collections/OrderStatusHistory.ts`
- `collections/hooks/generateOrderCode.ts` — beforeValidate, unique+retry (`CollectionBeforeValidateHook`).
- `collections/hooks/appendOrderStatusHistory.ts` — afterChange (`CollectionAfterChangeHook`).
- `collections/hooks/guardOrderInternalNote.ts` — beforeChange (`CollectionBeforeChangeHook`).
- `collections/endpoints/checkoutOrder.ts` — the `POST /checkout` handler (or `lib/orders/checkout.ts`).
- `lib/orders/validateOrderData.ts` — anti-tamper re-fetch + price derivation helper.
- `lib/orders/upsertCustomerByPhone.ts` — customer upsert helper.
- `lib/orders/validateCheckoutBody.ts` — body shape/enum/address/quantity validation (replaces old zod).

Modify:
- `payload.config.ts` — register `Orders`, `OrderItems`, `OrderItemAddons`, `OrderStatusHistory`.

payload.config diff (conceptual):
```ts
import { Orders } from './collections/Orders'
import { OrderItems } from './collections/OrderItems'
import { OrderItemAddons } from './collections/OrderItemAddons'
import { OrderStatusHistory } from './collections/OrderStatusHistory'
// ...
collections: [
  Users, Media, Categories, Products, ProductAddons, Customers,
  Orders, OrderItems, OrderItemAddons, OrderStatusHistory,
],
```

CLAUDE.md to follow when implementing: repo root `talo-kitchen-payload/CLAUDE.md` (Payload skill at
`.claude/skills/payload/` — HOOKS.md, ENDPOINTS.md, ADAPTERS.md#transactions are the relevant refs).

---

## Self-review

- Every RULE-01..17, EC-01..14, NFR-01..05 appears in §8 mapping. ✅
- Every EC has an error path in §6 (API contracts) or a hook throw. ✅
- Regression Impact modules (`payload.config`, `customers`, `products`, `product-addons`) each have a
  §10 plan. ✅
- No conflict with conventions: reuses `src/access`, `legacyId` sidebar pattern, hooks folder, select for
  enums, `timestamps: true`, DB schema `dev`. ✅
- No endpoint/entity beyond requirements: only the 4 required collections + the recommended checkout
  endpoint (auto REST reused for admin). Snapshot columns `productSlug`/`productImageUrl` are an explicit,
  justified additive (§3). ✅

## Summary

- **Entities:** 4 new collections — `orders`, `order-items`, `order-item-addons`, `order-status-history`.
- **Endpoints:** 1 custom (`POST /api/orders/checkout`, public) + reuse of Payload auto REST for admin
  list/detail/patch.
- **Hooks:** `generateOrderCode`, `appendOrderStatusHistory`, `guardOrderInternalNote` + 3 endpoint
  helpers (`validateOrderData`, `upsertCustomerByPhone`, `validateCheckoutBody`).

### Key Assumptions (locked)
1. **Items/addons = separate collections** (not nested arrays) — migration fidelity + queryability.
2. **Order creation via a dedicated public endpoint** `POST /api/orders/checkout`, not a public collection
   `create` — anti-tamper must be server-side and transactional.
3. **`validateOrderData` lives in the endpoint handler** (helper module), re-fetching products/addons at
   `depth:0`; server DERIVES all prices from DB (stronger than old client-price comparison).
4. **Admin cannot create orders** (create access denied except the endpoint); staff edit only `status`
   and `internalNote`.
5. **shippingFee is client-supplied this sprint**; server-side fee recompute deferred to sprint-6
   (`order-settings` Global).
6. **Snapshot columns `productSlug` + `productImageUrl` added** to `order-items` (beyond old table) to make
   order history self-sufficient.

### Tech Decisions to review
- Public unauthenticated checkout endpoint + no core rate limiting (needs edge/proxy throttle later).
- Client-supplied `shippingFee` tamper surface until sprint-6.
- Manual transactions under pgbouncer pooler — smoke-test required.
