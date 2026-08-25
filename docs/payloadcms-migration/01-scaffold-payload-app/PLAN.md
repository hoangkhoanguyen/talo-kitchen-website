# Implementation Plan: Scaffold Payload App (Feature 1)

## Tổng quan

Feature này khởi tạo (scaffold) một **Payload CMS app mới hoàn toàn**, đứng độc lập ở
folder **sibling** cạnh repo cũ:

- App mới: `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload`
- Repo cũ (giữ **read-only reference**, không sửa): `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen`

Mục tiêu của feature 1 là dựng **khung nền tảng** để các feature sau (collections,
data migration, media, v.v.) có chỗ để build lên:

- Scaffold bằng `npx create-payload-app` với template `blank`.
- Cấu hình database adapter `@payloadcms/db-postgres` trỏ tới **Supabase Postgres dev** đã cấp,
  cô lập trong schema **`dev`** (`schemaName: 'dev'`) — KHÔNG dùng named schema `prod` của app cũ, KHÔNG đụng `public`.
- Cài + cấu hình khung storage adapter `@payloadcms/storage-s3` trỏ tới **R2 bucket hiện có**.
- Thiết lập `.env` (không commit secret), git init, thêm remote `legacy` trỏ repo cũ.
- Verify: `npm run dev` chạy, mở `/admin` tạo first admin, `payload generate:types` chạy được.
- Ghi lại version thực tế đã cài (Next / react / payload) + note peer-dep conflict nếu có.

> **Điểm quan trọng:** `create-payload-app` là interactive (clack TTY UI). Chạy trong shell
> non-interactive sẽ lỗi `uv_tty_init EINVAL`. Vì vậy bước scaffold **PHẢI do user tự chạy
> trong terminal thật**. PLAN này viết ra chính xác lệnh + lựa chọn để user thao tác, KHÔNG
> cố chạy tự động qua tool/agent.

## Phạm vi (Scope)

### In scope (Feature 1)

- Tạo Postgres database mới, tách riêng, + connection string.
- Chạy `create-payload-app` (template `blank`, DB Postgres) trong terminal thật.
- Cấu hình `payload.config.ts`: `postgresAdapter`, `Users` collection mặc định, `sharp`.
- Cài package `@payloadcms/storage-s3` + thêm **khung plugin adapter** trỏ R2 (chỉ khung,
  chưa cần Media collection hoàn chỉnh).
- Thiết lập `.env` với `PAYLOAD_SECRET`, `DATABASE_URI` (DB mới), và các key `R2_*`.
- `git init` + `git remote add legacy <repo cũ>`.
- Chạy dev, tạo first admin user, `payload generate:types`.
- Xác nhận & ghi lại version thực tế.

### Out of scope (KHÔNG thuộc feature này)

- **Media collection hoàn chỉnh + upload/migrate ảnh vào R2** → thuộc **feature 7**. Feature 1
  chỉ cài package storage-s3 và để sẵn khung `collections: {}` trong plugin (chưa map collection nào).
- Bất kỳ **content collection** nghiệp vụ nào (products, posts, categories...) → feature sau.
- **Data migration** từ DB cũ (schema `prod`) sang DB Payload mới → feature sau.
- Deploy / hosting config production → chưa chốt (xem Rủi ro).
- Chuyển frontend Next.js hiện tại sang dùng Payload API → feature sau.

## Phương án kỹ thuật

| Hạng mục | Quyết định |
|---|---|
| Vị trí app | Folder sibling `talo-kitchen-payload`, tách hẳn repo cũ |
| Template | `blank` (không dùng `website` để tránh scaffold thừa) |
| Payload version | `3.88.0` (latest tại thời điểm plan) |
| Next / React / TS | Theo pin của template blank: **Next 16.3.0, React 19.2.6, TypeScript 6.0.3** |
| DB adapter | `@payloadcms/db-postgres` (Drizzle-based, dùng driver `pg` nội bộ) |
| DB schema | Schema **`dev`** trên Supabase (`schemaName: 'dev'`) — **KHÔNG** dùng `prod` hay `public` |
| DB instance | Postgres database MỚI, tách riêng — không đụng DB app cũ |
| Storage | `@payloadcms/storage-s3` → R2 (S3-compatible), region `auto`, `forcePathStyle: true` |
| Env var DB | Payload dùng tên **`DATABASE_URI`** (app cũ dùng `DATABASE_URL` — chú ý khác tên) |

**Ghi chú về Next 16:** `@payloadcms/next` peerDep next =
`">=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.6 <17.0.0"`
→ Next 16 được hỗ trợ chính thức. Template blank pin next `16.3.0` nên nằm trong range,
**không kỳ vọng peer-dep conflict**. Vẫn phải verify lại ở Bước 8.

## Các bước thực hiện

### Bước 1 — Tạo Postgres database MỚI + connection string

Tạo một database riêng cho Payload (đặt tên gợi nhớ, ví dụ `talo_payload`). KHÔNG dùng lại
DB của app cũ.

Local Postgres (ví dụ):

**KHÔNG cần tạo DB mới** — user đã cấp sẵn một Supabase Postgres dev. Dùng đúng connection string này (lưu ở memory `dev-database-credentials`):

```
DATABASE_URI=postgresql://dev_user.whvfkuqgbfsuacanckis:dev-claude-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

> Ràng buộc: **CHỈ dùng schema `dev`** trong DB này (đã xác nhận, đang rỗng 0 bảng). Cấu hình Payload adapter với `schemaName: 'dev'` (xem Bước 3). Tuyệt đối không đụng schema `public`.
>
> ⚠️ **Pooler caveat:** port `6543` là Supabase **transaction pooler (pgbouncer)**, không hỗ trợ prepared statements / một số DDL. Payload (drizzle) chạy `push`/migration DDL lúc boot → có thể lỗi. Nếu gặp lỗi prepared statement/DDL: dùng **direct/session connection port `5432`** cho lần tạo bảng (đổi `6543`→`5432` trong `DATABASE_URI`), hoặc thêm tham số pooler phù hợp. Verify ở Bước 7.

### Bước 2 — Chạy `create-payload-app` trong TERMINAL THẬT (interactive)

> **User tự chạy bước này**, không qua tool. Mở terminal thật tại folder cha
> `/Users/hoangkhoanguyen/Local_Workspace/work/khoa`:

```bash
cd /Users/hoangkhoanguyen/Local_Workspace/work/khoa
npx create-payload-app@latest -n talo-kitchen-payload -t blank --use-npm -a claude
```

Giải thích flags:

- `-n talo-kitchen-payload` — tên project → tạo folder `talo-kitchen-payload`.
- `-t blank` — template blank.
- `--use-npm` — dùng npm (đồng bộ với app cũ).
- `-a claude` — cài Payload skill cho Claude (dùng `--no-agent` nếu không muốn).
- (Tùy chọn `--no-deps` nếu muốn cài dependency thủ công sau — mặc định KHÔNG dùng.)

Trong clack UI interactive, chọn:

1. Template: **blank**
2. Database: **Postgres**
3. Database connection string: dán chuỗi `DATABASE_URI` Supabase dev từ Bước 1.

> Wizard sẽ tự ghi `DATABASE_URI` và sinh `PAYLOAD_SECRET` vào `.env`.
> Nếu chạy trong môi trường non-interactive sẽ gặp `uv_tty_init EINVAL` — đây là lý do bắt
> buộc chạy ở terminal thật.

Sau khi xong, các bước còn lại có thể làm qua tool/agent bên trong folder mới.

### Bước 3 — Cấu hình `payload.config.ts` (db-postgres + Users + sharp)

File: `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload/src/payload.config.ts`

Template blank đã sinh sẵn `postgresAdapter`, `Users` collection và `sharp`. Xác nhận nội dung
khung như sau (giữ schema mặc định, KHÔNG set `schemaName: 'prod'`):

```ts
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [Users],
  editor: /* lexicalEditor() do template sinh sẵn */ undefined as any,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    schemaName: 'dev', // BẮT BUỘC: cô lập mọi bảng Payload trong schema 'dev' của Supabase
  }),
  sharp,
  plugins: [
    // s3Storage(...) sẽ thêm ở Bước 4
  ],
})
```

> Giữ nguyên `editor: lexicalEditor()` mà template sinh ra (đoạn `undefined as any` ở trên chỉ
> là placeholder để nhấn mạnh — KHÔNG copy dòng đó). `Users` collection mặc định
> (`src/collections/Users.ts`) đã có `auth: true`, dùng làm admin user tạm cho feature 1.

### Bước 4 — Cài + cấu hình khung `@payloadcms/storage-s3` cho R2

Cài package (trong folder app mới):

```bash
cd /Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload
npm install @payloadcms/storage-s3
```

Thêm plugin vào mảng `plugins` trong `payload.config.ts`. Đây là **khung adapter** — trỏ đúng
R2 endpoint/credentials, còn phần map `collections` (Media) sẽ hoàn thiện ở **feature 7**:

```ts
import { s3Storage } from '@payloadcms/storage-s3'

// ... trong buildConfig:
plugins: [
  s3Storage({
    // KHUNG: chưa map collection nào ở feature 1 (Media hoàn thiện ở feature 7).
    collections: {
      // media: true,  // <-- feature 7 sẽ bật khi có Media collection
    },
    bucket: process.env.R2_BUCKET_NAME || '',
    config: {
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    },
  }),
],
```

> `R2_PUBLIC_URL` chưa dùng trực tiếp trong khung này; feature 7 sẽ dùng nó cho
> `generateFileURL` / public serving của Media. Feature 1 chỉ cần package đã cài + adapter
> cấu hình đúng credentials, không lỗi khi boot.

### Bước 5 — Thiết lập `.env` (KHÔNG commit secret)

File `/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload/.env`
(wizard đã tạo `PAYLOAD_SECRET` + `DATABASE_URI`; bổ sung các key `R2_*`):

```dotenv
# Payload
PAYLOAD_SECRET=<random-secret-đã-được-wizard-sinh>

# Database: Supabase dev (schema 'dev' cấu hình trong payload.config.ts)
DATABASE_URI=postgresql://dev_user.whvfkuqgbfsuacanckis:dev-claude-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Cloudflare R2 (bucket hiện có, tái dùng credentials app cũ)
R2_ACCOUNT_ID=<r2-account-id>
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_BUCKET_NAME=<r2-bucket-name>
R2_PUBLIC_URL=<https://public-r2-domain>
```

> Lấy giá trị `R2_*` từ `.env.local` của app cũ
> (`/Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen/.env.local`).
> **KHÔNG commit secret**: xác nhận `.gitignore` của app mới có ignore `.env` (template Payload
> ignore sẵn). Nếu cần, tạo `.env.example` chỉ chứa KEY rỗng để commit làm tài liệu.

### Bước 6 — Git init + remote `legacy`

Template thường đã `git init`. Đảm bảo repo mới độc lập và thêm remote tham chiếu repo cũ:

```bash
cd /Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload
git init            # nếu chưa có
git add -A
git commit -m "chore: scaffold payload app (blank template)"
git remote add legacy /Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen
git remote -v       # xác nhận remote 'legacy' xuất hiện
```

> Remote `legacy` chỉ để tra cứu/blame code cũ (`git log legacy/main`, `git show legacy/main:<path>`),
> KHÔNG push/pull vào đó.

### Bước 7 — Chạy dev + tạo admin + generate:types

```bash
cd /Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload
npm run dev
```

1. Mở `http://localhost:3000/admin` → thấy trang **Create first user**.
2. Tạo admin user đầu tiên (email của bạn + password).
3. Sau khi đăng nhập được, dừng dev nếu cần và chạy:

```bash
npm run generate:types
# tương đương: npx payload generate:types
```

→ Sinh/cập nhật file `src/payload-types.ts`.

> Lần boot đầu, Payload chạy migration/`push` để tạo bảng trong schema `dev` của Supabase. Nếu gặp lỗi prepared statement/DDL do pooler (6543), tạm đổi `DATABASE_URI` sang port `5432` (direct/session) cho lần tạo bảng rồi trả lại.

### Bước 8 — Verify versions + note peer-dep

Chạy để ghi lại version thực tế:

```bash
cd /Users/hoangkhoanguyen/Local_Workspace/work/khoa/talo-kitchen-payload
npm ls next react react-dom payload @payloadcms/db-postgres @payloadcms/next @payloadcms/storage-s3 typescript
```

Ghi lại kết quả vào phần "Kết quả thực tế" (điền sau khi implement). Kỳ vọng:
Next `16.3.0`, React `19.2.6`, Payload `3.88.0`, TypeScript `6.0.3`.

Nếu `npm install` in cảnh báo `ERESOLVE` / peer-dep conflict → **note lại chi tiết** (package
nào, version yêu cầu vs thực tế), và cân nhắc `--legacy-peer-deps` chỉ khi thật sự cần (ghi rõ lý do).

## Câu hỏi mở / Rủi ro

1. **Deployment target chưa chốt.** App cũ chạy Next standalone; chưa quyết Payload deploy ở đâu
   (Vercel / VPS / container). Ảnh hưởng cấu hình build & storage public URL. → Cần chốt trước feature deploy.
2. **TypeScript 6 (template) vs TS 5 (app cũ).** App cũ dùng `typescript ^5`; template blank pin
   TS `6.0.3`. Có thể có khác biệt hành vi strict/typecheck khi copy code cũ sang. → Quyết định: giữ TS 6
   của template (mặc định) hay hạ về 5 cho đồng bộ? Đề xuất: giữ TS 6, xử lý lỗi type khi phát sinh.
3. **Có nên copy `tsconfig` / `.prettierrc` / `eslint.config` từ app cũ không?** App cũ có
   `.prettierrc`, `eslint.config.mjs` (eslint 9 + eslint-config-next), path alias `@/* -> ./src/*`.
   Payload sinh config riêng. → Quyết định sau: giữ config Payload làm chuẩn, chỉ mượn path alias/prettier
   rules nếu team muốn đồng bộ style. Chưa làm ở feature 1.
4. **Khác tên env DB:** app cũ `DATABASE_URL`, Payload `DATABASE_URI`. Dễ nhầm khi copy env. → Đã note rõ.
5. **Reuse R2 credentials:** feature 1 dùng chung credentials/bucket với app cũ. Cần đảm bảo prefix/path
   không ghi đè object của app cũ khi feature 7 bật upload (feature 7 sẽ xử lý prefix).
6. **`-a claude` (Payload skill):** thêm file cấu hình agent vào repo mới; xác nhận không xung đột
   với `.claude/` sẵn có (nếu có) và không commit thứ không mong muốn.
