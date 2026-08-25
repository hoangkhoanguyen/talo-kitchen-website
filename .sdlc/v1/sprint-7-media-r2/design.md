# Sprint 7 — Media on Cloudflare R2 (`@payloadcms/storage-s3`) — Combined Spec + Design (v1)

Feature 7 of the PayloadCMS migration (INVENTORY §"Media" + Tầng 4 `images` API + Cross-cutting "Media"). This is a **combined spec + design**: requirements are derived from INVENTORY and the old app code, with Key Assumptions recorded inline (KA-xx). No greenfield decisions — the design extends the already-scaffolded `Media` collection and the existing R2 bucket.

- SDLC docs (this file): `talo-kitchen/.sdlc/v1/sprint-7-media-r2/`
- CODE target (paths only, no code written by architect): sibling `../talo-kitchen-payload/src/`
- OLD app (read-only reference): `talo-kitchen/src/lib/r2.ts`, `talo-kitchen/src/app/(admin)/admin/api/images/route.ts`, `talo-kitchen/next.config.ts`

---

## Derived Requirements (from INVENTORY + old code)

### Rules
- **RULE-01** Media files stored on the existing Cloudflare R2 bucket via `@payloadcms/storage-s3` (S3-compatible): endpoint `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`, `region: 'auto'`, `forcePathStyle: true`. (architecture.md §Media; old `r2.ts`.)
- **RULE-02** The `media` collection keeps its `alt` text field (required) — parity with old `product_images.altText` and Payload upload best practice.
- **RULE-03** Uploads restricted to images only (`mimeTypes: ['image/*']`) — parity with old `ALLOWED_EXTENSIONS` (jpg/jpeg/png/gif/webp/svg).
- **RULE-04** `media` is publicly readable (`access.read = () => true`); write ops (create/update/delete) require an authenticated staff user.
- **RULE-05** Files are served from the **existing R2 public domain** (`R2_PUBLIC_URL`), NOT streamed through the Payload `/api/media/file/**` route. The stored `url` and `adminThumbnail` resolve to `${R2_PUBLIC_URL}/${filename}`.
- **RULE-06** Product images connect to Media docs via the `products.images[].image` relationship (`relationTo: 'media'`) already built in sprint-2 — unchanged; this sprint only makes that relationship's target able to store/serve real files.
- **RULE-07** R2 file continuity: existing object keys are preserved (**no prefix**, no re-keying); the 44 legacy files stay reachable at their current URLs. (See KA-01 / Risk R-1.)
- **RULE-08** New-app `next.config.ts` `images.remotePatterns` includes the R2 public host (`*.r2.dev`) + `assets.talokitchenhg.com`; the 2 legacy Ltelle domains are dropped (KA-03).
- **RULE-09** When the storage plugin is enabled Payload disables its own static file handling for that collection; serving therefore relies on the R2 public domain (consistent with RULE-05).
- **RULE-10** All R2 config values are read from `process.env.*` (never hardcoded); secret credentials never reach the client bundle.

### Edge Cases
- **EC-01** Any `R2_*` env var missing/empty → plugin cannot authenticate to R2. Fail-fast at boot; env vars documented as required.
- **EC-02** Non-image file upload attempt → rejected by `mimeTypes: ['image/*']` (400 from Payload upload validation).
- **EC-03** A Media doc whose `filename` has no matching object in the bucket (e.g. bad sprint-8 migration row) → broken image URL. Serving layer cannot repair this; sprint-8 must verify object existence.
- **EC-04** Upload filename collides with an existing Media doc → Payload appends a unique suffix by default. Must NOT be disabled in a way that would overwrite legacy keys unexpectedly (see KA-01).
- **EC-05** `adminThumbnail` must load from the R2 public domain (no local file exists once the plugin is on) — else admin list/edit previews break.
- **EC-06** Products still referencing dropped legacy Ltelle domains would 404 in the new app — a migration data concern; flagged to sprint-8, not solved here.
- **EC-07** A product saved with a null `images[].image` (sprint-2 EC-07) remains valid after media is wired — no regression.

### NFRs
- **NFR-01 Security** — R2 credentials live only in server env; the S3 client runs server-side inside the plugin. Upload/update/delete gated by authenticated staff access.
- **NFR-02 Performance** — public files served directly from R2 / custom-domain CDN (`disablePayloadAccessControl`), not proxied/streamed through the Next server.
- **NFR-03 Migration continuity** — URL scheme (`${R2_PUBLIC_URL}/${key}`) matches the old app exactly, so already-published links keep resolving.
- **NFR-04 Backward-compat naming** — the `media` slug and the flat (prefix-less) key scheme are frozen; sprint-2/5/8/9 depend on them.

---

# PART 1 — Human Review

## 1. Design Overview
- **Extend, don't replace.** The `media` collection already exists (`upload: true`, `alt` text, public read) and is registered. Sprint-7 only (a) installs `@payloadcms/storage-s3`, (b) registers `s3Storage` in `plugins[]` pointed at R2, (c) hardens `Media.ts` upload options + public-URL serving. No new collections, no new endpoints.
- **Public-domain serving over Payload route.** We set `disablePayloadAccessControl: true` + `generateFileURL` so `media.url` and `adminThumbnail` point at `${R2_PUBLIC_URL}/${filename}`. This preserves the old app's URL contract (NFR-03) and keeps serving off the Next server (NFR-02). Payload's own `/api/media/file/**` route is effectively bypassed (RULE-09).
- **Continuity = flat keys, no prefix (Option A).** The plugin is configured with **no `prefix`**, so Payload reads/writes objects at the bucket root — exactly where the old app's 44 files live. A Media doc whose `filename` equals an existing key resolves to the existing object without moving/re-keying files. The mechanism for creating those docs at migration time is the main open risk handed to sprint-8 (R-1).

## 2. Tech Decisions
- **TD-1** Install `@payloadcms/storage-s3@3.88.0` (pin to Payload version). Exact command (npm — repo uses `package-lock.json`):
  ```
  npm install @payloadcms/storage-s3@3.88.0
  ```
  (If the team switches to pnpm: `pnpm add @payloadcms/storage-s3@3.88.0`.)
- **TD-2** Serve via **R2 public domain**, not Payload route: `disablePayloadAccessControl: true` + `generateFileURL`. (Recommended by task.)
- **TD-3** **No `imageSizes`** on the Media upload config (see KA-02). Keep a single original file per image; Next/Image handles responsive resizing on the frontend, and migrated docs have no generated sizes anyway. `imageSizes` can be added later without breaking existing docs.
- **TD-4** `mimeTypes: ['image/*']` for upload restriction (RULE-03).
- **TD-5** Wire write access on `Media` to the shared `src/access` helpers (`isAuthenticated` / `isAdminOrManager`) established in sprint-3, instead of leaving it to Payload defaults (NFR-01).

## 3. Risks / Trade-offs
- **R-1 (MAIN RISK → sprint-8) — Referencing pre-existing R2 keys.** Payload normally *owns* filenames: `payload.create({ collection:'media', file })` uploads bytes and may append a uniqueness suffix. To attach a Media doc to an already-in-bucket key **without re-uploading**, sprint-8 must EITHER:
  - **(A-preferred) Direct DB insert** of the media row (`filename` = existing key, plus `mimeType`, `filesize`, `width`, `height`, `alt`) via the migration script, bypassing the upload pipeline. `url` then resolves through `generateFileURL`. Requires the row's metadata columns to be populated (HEAD the object / read old data for dims).
  - **(A-fallback) Re-upload in place**: fetch bytes from the current public URL and `payload.create` with the identical filename. With no prefix and an empty `media` collection there is no doc-level collision, so Payload keeps the same key and overwrites the same object — old URLs still work, at the cost of re-transferring 44 files.
  This is the reason Option A (keep keys) beats Option B (re-key under a Payload prefix): Option B would 44× move files and break every already-published URL. **Flagged to sprint-8; sprint-7 only guarantees the serving/URL scheme supports Option A.**
- **R-2 — `generateFileURL` / `disablePayloadAccessControl` support surface.** These are per-collection options inherited from `@payloadcms/plugin-cloud-storage` (which `storage-s3` wraps). Feature-builder must confirm the exact option names against the installed `3.88.0` types (`generate:types` + TS check). If `generateFileURL` is unavailable in this version, fall back to setting `adminThumbnail` as a function + relying on `disablePayloadAccessControl` returning the raw S3/endpoint URL, then override `R2_PUBLIC_URL` via a custom `afterRead` on `url`. Verify at implementation.
- **R-3 — Env host mismatch for `next.config`.** `R2_PUBLIC_URL` may be an `*.r2.dev` host or the custom `assets.talokitchenhg.com`. We list **both** patterns so either resolves (RULE-08). Confirm the actual host in `.env` at build.
- **R-4 — Losing server-side revoke / bucket listing.** Old `images` GET listed the whole bucket (`ListObjectsV2`). Payload replaces this with the `media` collection list (DB-backed). Objects that exist in R2 but have no Media doc will NOT appear in admin — acceptable and expected; only tracked media is manageable (this is the desired DB-tracking upgrade).

---

# PART 2 — Agent Reference

## 4. Architecture
Single-collection change plus one plugin registration. No new modules.

```
../talo-kitchen-payload/src/
  payload.config.ts        [MODIFY] import s3Storage; add to plugins[]
  collections/Media.ts     [MODIFY] upload options (mimeTypes, adminThumbnail); write access
  next.config.ts           [MODIFY] images.remotePatterns (R2 hosts); drop Ltelle
  access/ (index, isAuthenticated, isAdminOrManager)   [reuse, unchanged]

R2 bucket (existing, unchanged)  ← s3Storage plugin (server-side S3 client)
  objects at root keys (flat, no prefix)  ← same keys the old app wrote
Public serving: browser → R2_PUBLIC_URL/<filename>  (CDN/custom domain, not Next)
```

Interaction: `payload.config.ts` registers `s3Storage(...)` in `plugins[]`, targeting the `media` collection. The plugin injects the S3 upload/delete adapter and disables local disk storage for `media`. `Media.ts` declares upload constraints + how the public URL is generated. `next.config.ts` whitelists the R2 host so `next/image` can render media in the frontend (sprint-9 consumer). Product docs reference media through the sprint-2 `products.images[].image` relationship — no code change here.

## 5. Data Model

No new fields required by this sprint. The `media` collection's stored shape is Payload's standard upload schema; the relevant columns (Payload-managed) are:

| Field | Type | Notes |
|---|---|---|
| `id` | serial (Payload PK) | |
| `alt` | text, **required** | RULE-02 (kept) |
| `filename` | text | = the R2 object key (flat, no prefix) — continuity anchor (RULE-07, R-1) |
| `mimeType` | text | Payload-managed |
| `filesize` | number | Payload-managed |
| `width` / `height` | number | Payload-managed (from sharp on upload; must be populated on migrated rows — R-1) |
| `url` | virtual/stored | resolves to `${R2_PUBLIC_URL}/${filename}` via `generateFileURL` (RULE-05) |
| `createdAt` / `updatedAt` | timestamp | auto |

- **No `imageSizes`** (TD-3) → no `sizes.*` variant columns.
- **Optional `legacyId`** (number) MAY be added if sprint-8 wants to trace old rows; the old app did NOT track media in DB (`product_images.url` was a raw string with no media id), so there is no legacy media id to map. **KA-04: do not add `legacyId` to `media`** — the linkage key from old data is the URL/filename, not an id. Sprint-8 matches on filename.
- Product ↔ media linkage lives on `products.images[].image` (sprint-2), unchanged.

## 6. API Contracts

No custom endpoints. Payload's auto-generated REST + admin UI cover everything the old `images` route did:

| Old surface | New surface |
|---|---|
| `POST (admin)/admin/api/images` (upload: crypto-suffix filename + `PutObjectCommand`) | Payload upload: `POST /api/media` (multipart), auth-gated, `mimeTypes` enforced. Response includes `doc.url` = R2 public URL. |
| `GET (admin)/admin/api/images` (list whole bucket via `ListObjectsV2`) | `GET /api/media?limit=&page=&sort=` (DB-backed list) + admin Media list view. Only tracked docs (R-4). |

Error responses (Payload standard `{ errors: [{ message }] }`):
- **EC-02** non-image → `400` (mimeType validation).
- **EC-01** missing R2 env → boot failure (not a request-time 4xx); documented as required env.
- Upload without auth → `403` (RULE-04 write access).
- Missing file on multipart create → `400`.

## 7. UI / Interaction Flow
Payload-generated admin only (no custom frontend this sprint):
- **Media list**: grid/table with thumbnails loaded from `${R2_PUBLIC_URL}/<filename>` (EC-05). Empty state = Payload default "No Media found".
- **Upload/edit drawer**: file picker (image mimeTypes only), required `alt` field. On success the preview + copyable URL point at the R2 public domain. On non-image → inline validation error (EC-02).
- **Product edit** (sprint-2 UI): `images` array rows now resolve real thumbnails via the media relationship.

## 8. Rule & Edge-case Mapping (coverage)

| Requirement | Handled where |
|---|---|
| RULE-01 R2 via storage-s3 (endpoint/region/forcePathStyle) | `s3Storage(...)` in `payload.config.ts` §11 snippet |
| RULE-02 keep required `alt` | `Media.ts` `fields` (unchanged) |
| RULE-03 images-only uploads | `Media.ts` `upload.mimeTypes: ['image/*']` (TD-4) |
| RULE-04 public read / auth write | `Media.access.read = ()=>true`; create/update/delete = `isAuthenticated`/`isAdminOrManager` (TD-5) |
| RULE-05 serve via R2 public domain | `disablePayloadAccessControl:true` + `generateFileURL` + `adminThumbnail` (TD-2) |
| RULE-06 product images → media relationship | sprint-2 `products.images[].image` (no change) |
| RULE-07 key continuity, no prefix | plugin config omits `prefix` (§11); Risk R-1 |
| RULE-08 next.config R2 hosts, drop Ltelle | `next.config.ts` remotePatterns §11 (KA-03) |
| RULE-09 Payload static handling disabled | inherent to storage plugin; serving via public domain (RULE-05) |
| RULE-10 env-driven config, no client leak | `process.env.*` reads server-side in config (NFR-01) |
| EC-01 missing R2 env | required-env note; fail-fast at boot |
| EC-02 non-image upload | `mimeTypes` → 400 |
| EC-03 doc filename w/o object | serving cannot repair → sprint-8 verification (flagged) |
| EC-04 filename collision | Payload default suffix; empty collection at migration avoids it (KA-01) |
| EC-05 admin thumbnail from public domain | `adminThumbnail` function → R2 public URL |
| EC-06 dropped Ltelle domains → 404 refs | flagged to sprint-8 (data check) |
| EC-07 null product image still valid | sprint-2 sub-field NOT required; unaffected |
| NFR-01 security (creds server-side, auth write) | §9 |
| NFR-02 performance (CDN serve) | §9 |
| NFR-03 migration continuity (URL scheme) | §9 |
| NFR-04 backward-compat naming | §9 |

## 9. NFR Design
- **NFR-01 Security** — R2 credentials read from `process.env` inside `payload.config.ts` (server module); never imported into client components. `Media` create/update/delete bound to `isAuthenticated` (or `isAdminOrManager`) from `src/access`. Public `read` is intentional (images are public assets).
- **NFR-02 Performance** — `disablePayloadAccessControl: true` makes `url` a direct R2 public-domain URL, so image bytes are served by R2/CDN, not proxied through Next. `forcePathStyle:true` is required for R2 S3 compatibility.
- **NFR-03 Migration continuity** — `generateFileURL` reproduces the old `${R2_PUBLIC_URL}/${key}` scheme byte-for-byte; no `prefix` keeps keys flat and identical to old writes. Already-published URLs keep resolving.
- **NFR-04 Backward-compat naming** — `media` slug and flat key scheme frozen; documented as a contract for sprint-8/9.

## 10. Regression-safe Plan (affected existing modules)
- **`src/collections/Media.ts`** — extend only: add `upload.mimeTypes` + `upload.adminThumbnail`, tighten `access` for writes. Keep `slug:'media'`, keep `alt` required, keep `upload:true`, keep `access.read`. Do not rename the slug (sprint-2 `relationTo:'media'` depends on it).
- **`src/payload.config.ts`** — additive: add one import + one entry in `plugins[]`. Do not touch `collections[]`, `db` (`schemaName:'dev'`), `admin`, or `editor`.
- **`src/collections/Products.ts`** — no change; the `images[].image` relationship target `'media'` keeps resolving; null images still allowed (EC-07 preserved).
- **`next.config.ts`** — additive to `images` config: add `remotePatterns`; keep existing `localPatterns`, `webpack`, `turbopack`, `withPayload`. (Old-app config is reference only; do not copy its `qualities` unless sprint-9 needs it.)

## 11. File Change Plan + config diffs

**Files (target `../talo-kitchen-payload/`):**
1. `package.json` / `package-lock.json` — **[MODIFY]** add `@payloadcms/storage-s3@3.88.0` (via TD-1 command).
2. `src/payload.config.ts` — **[MODIFY]** import + register `s3Storage`.
3. `src/collections/Media.ts` — **[MODIFY]** upload options + write access.
4. `next.config.ts` — **[MODIFY]** `images.remotePatterns`.

Follow the target repo's root `CLAUDE.md` / Payload conventions; this sprint touches only `src/collections/Media.ts`, `src/payload.config.ts`, `next.config.ts` — no nested module conventions beyond the Payload collection pattern already used in sprint-2/3.

### 11.1 `payload.config.ts` diff (illustrative)
```ts
// add imports
import { s3Storage } from '@payloadcms/storage-s3'

// plugins: [] →
plugins: [
  s3Storage({
    collections: {
      media: {
        disablePayloadAccessControl: true, // serve from R2 public domain, not Payload route (RULE-05/NFR-02)
        generateFileURL: ({ filename }) =>
          `${process.env.R2_PUBLIC_URL}/${filename}`, // NFR-03 URL continuity
        // NO `prefix` → flat keys, continuity with legacy 44 files (RULE-07)
      },
    },
    bucket: process.env.R2_BUCKET_NAME || '',
    config: {
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true, // required for Cloudflare R2 (RULE-01)
    },
  }),
],
```
> Feature-builder: confirm `generateFileURL` / `disablePayloadAccessControl` option names against installed `3.88.0` types (R-2). If `collections: { media: true }` is used instead of the object form, public-URL serving is lost — the object form is required to meet RULE-05.

### 11.2 `Media.ts` diff (illustrative)
```ts
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,                 // RULE-04 public read (kept)
    create: isAuthenticated,          // TD-5 / NFR-01
    update: isAuthenticated,
    delete: isAuthenticated,          // or isAdminOrManager — confirm w/ sprint-3 policy
  },
  admin: {
    useAsTitle: 'alt',
  },
  fields: [
    { name: 'alt', type: 'text', required: true }, // RULE-02 (kept)
  ],
  upload: {
    mimeTypes: ['image/*'],           // RULE-03
    adminThumbnail: ({ doc }) =>       // EC-05 preview from public domain
      `${process.env.R2_PUBLIC_URL}/${doc.filename}`,
    // no imageSizes (TD-3)
  },
}
```

### 11.3 `next.config.ts` remotePatterns diff (illustrative)
```ts
images: {
  localPatterns: [{ pathname: '/api/media/file/**' }], // keep
  remotePatterns: [
    { protocol: 'https', hostname: '*.r2.dev' },              // R2 public (RULE-08)
    { protocol: 'https', hostname: 'assets.talokitchenhg.com' }, // custom domain
    // legacy Ltelle domains dropped (KA-03 / EC-06)
  ],
},
```

---

## Key Assumptions (inline)
- **KA-01 (R2 continuity = Option A, keep existing keys).** No `prefix`; flat keys preserved; the 44 legacy files are NOT moved/re-keyed. Media docs reference existing objects by matching `filename` to the old key. Mechanism for creating those docs (direct DB insert vs re-upload-in-place) is sprint-8's job and is the main flagged risk (R-1). Rejected Option B (re-key under Payload prefix) because it would move 44 files and break every published URL.
- **KA-02 (no `imageSizes`).** Single original per image; responsive handled by `next/image`; keeps migrated docs (which have no generated variants) consistent. Reversible later.
- **KA-03 (drop legacy Ltelle domains).** `ltelle-upload.erosnguyen.com` + `upload.ltelleeatery.com` removed from `remotePatterns`; any product still pointing at them is a sprint-8 data-cleanup item (EC-06).
- **KA-04 (no `legacyId` on media).** Old app didn't DB-track media, so there's no legacy media id; sprint-8 links by filename/URL, not id.
- **KA-05 (public URL serving).** `url`/`adminThumbnail` resolve to `${R2_PUBLIC_URL}/${filename}` via `disablePayloadAccessControl` + `generateFileURL`; the Payload `/api/media/file/**` route is bypassed for `media`.

---

## Summary
- **Endpoints:** 0 new (Payload auto REST `/api/media` replaces the old custom `images` upload/list route).
- **Entities:** 0 new; `media` collection extended (upload options + write access); no schema fields added.
- **Tech Decisions to review:** (1) `npm install @payloadcms/storage-s3@3.88.0`; (2) public-domain serving via `disablePayloadAccessControl` + `generateFileURL` (vs Payload route); (3) no `imageSizes`; (4) `mimeTypes:['image/*']`; (5) write access via `src/access` helpers.
- **Key assumption answers:** R2 continuity = **Option A** (keep existing keys, no prefix — main risk pushed to sprint-8); public URL serving = **yes, via R2 public domain** (`R2_PUBLIC_URL`/`assets.talokitchenhg.com`); `next.config` domains = **`*.r2.dev` + `assets.talokitchenhg.com`, drop both Ltelle domains**.
- **Self-review:** all RULE-01..10, EC-01..07, NFR-01..04 appear in the §8 mapping; every EC has a handling path or an explicit sprint-8 hand-off; every affected existing module (Media, payload.config, Products, next.config) has a §10 regression-safe plan; no new endpoints/entities introduced; no conflict with architecture.md (keeps `media` slug, `schemaName:'dev'`, no Lexical/i18n).
