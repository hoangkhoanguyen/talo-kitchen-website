/**
 * ONE-SHOT prod upgrade → multi-language (blue/green).
 *
 * Clone SOURCE schema (prod) → TARGET schema (prod_v2), rồi migrate TARGET sang
 * model mới: tạo 3 bảng *_translations + seed `en`, và localize config JSON.
 * SOURCE (prod) KHÔNG bị đụng — giữ nguyên làm bản rollback.
 *
 * KHÔNG đọc .env.local (tránh đè nhầm sang DB dev). Chỉ đọc process.env.
 *
 * CÁCH CHẠY (điền DATABASE_URL root, nên dùng port 5432 session mode):
 *   DATABASE_URL="postgresql://USER:PASS@HOST:5432/postgres" npx tsx deploy/upgrade-to-v2.ts
 *
 * Tuỳ chọn:
 *   SOURCE_SCHEMA=prod            (mặc định "prod")
 *   TARGET_SCHEMA=prod_v2         (mặc định "prod_v2")
 *   DROP_TARGET=1                 (xoá TARGET nếu đã tồn tại rồi clone lại — cẩn thận)
 */
import postgres from "postgres";
import { migrateConfig } from "@/lib/localized-config";
import { uiMeta } from "@/constants/settings/ui";
import type { Config } from "@/types/configs";

const DATABASE_URL = process.env.DATABASE_URL;
const SOURCE = process.env.SOURCE_SCHEMA || "prod";
const TARGET = process.env.TARGET_SCHEMA || "prod_v2";
const DROP_TARGET = process.env.DROP_TARGET === "1";

function die(msg: string): never {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!DATABASE_URL) die("Thiếu DATABASE_URL. Điền connection string root (port 5432).");
if (SOURCE === TARGET) die("SOURCE và TARGET không được trùng nhau.");
if (DATABASE_URL.includes(":6543")) {
  console.warn("⚠️  Đang dùng port 6543 (pooler). DDL/clone nên chạy port 5432 (session mode). Vẫn tiếp tục...");
}

// clone_schema: copy structure (INCLUDING ALL) + sequences + data + FK, đổi schema.
const CLONE_SCHEMA_FN = `
CREATE OR REPLACE FUNCTION public.__clone_schema(src text, dst text) RETURNS void AS $$
DECLARE r record; coldef text; colname text;
BEGIN
  EXECUTE format('CREATE SCHEMA %I', dst);
  -- sequences (tạo + set giá trị hiện tại)
  FOR r IN SELECT sequence_name AS n FROM information_schema.sequences WHERE sequence_schema = src LOOP
    EXECUTE format('CREATE SEQUENCE %I.%I', dst, r.n);
    EXECUTE format('SELECT setval(%L, (SELECT last_value FROM %I.%I), true)', dst||'.'||r.n, src, r.n);
  END LOOP;
  -- tables: structure (defaults/PK/unique/check/index) + data. FK làm sau.
  FOR r IN SELECT table_name AS n FROM information_schema.tables
           WHERE table_schema = src AND table_type='BASE TABLE' LOOP
    EXECUTE format('CREATE TABLE %I.%I (LIKE %I.%I INCLUDING ALL)', dst, r.n, src, r.n);
    -- re-point default nextval() từ src.seq -> dst.seq
    FOR colname, coldef IN SELECT column_name, column_default FROM information_schema.columns
        WHERE table_schema = dst AND table_name = r.n AND column_default LIKE 'nextval%' LOOP
      EXECUTE format('ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT %s',
        dst, r.n, colname, replace(coldef, quote_ident(src)||'.', quote_ident(dst)||'.'));
    END LOOP;
    EXECUTE format('INSERT INTO %I.%I SELECT * FROM %I.%I', dst, r.n, src, r.n);
  END LOOP;
  -- foreign keys (LIKE INCLUDING ALL KHÔNG copy FK)
  FOR r IN SELECT c.conname, t.relname AS tbl, pg_get_constraintdef(c.oid) AS def
           FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
           WHERE c.contype='f' AND c.connamespace = src::regnamespace LOOP
    EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I %s', dst, r.tbl, r.conname,
      regexp_replace(r.def, 'REFERENCES ([A-Za-z_][A-Za-z0-9_]*)\\.', 'REFERENCES '||quote_ident(dst)||'.'));
  END LOOP;
END;
$$ LANGUAGE plpgsql;
`;

const ENTITY_DDL = (s: string) => `
SET search_path TO ${s}, public;
CREATE TABLE product_translations (
  id serial PRIMARY KEY NOT NULL, product_id integer NOT NULL, locale varchar(10) NOT NULL,
  title varchar(255), description text, sub_description text, allergen_info text,
  created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT product_translations_product_id_locale_unique UNIQUE (product_id, locale)
);
CREATE TABLE product_category_translations (
  id serial PRIMARY KEY NOT NULL, category_id integer NOT NULL, locale varchar(10) NOT NULL,
  name varchar(255), description varchar(1024),
  created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT product_category_translations_category_id_locale_unique UNIQUE (category_id, locale)
);
CREATE TABLE product_addon_translations (
  id serial PRIMARY KEY NOT NULL, addon_id integer NOT NULL, locale varchar(10) NOT NULL, name varchar(255),
  created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT product_addon_translations_addon_id_locale_unique UNIQUE (addon_id, locale)
);
ALTER TABLE product_translations ADD CONSTRAINT product_translations_product_id_fk
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE cascade;
ALTER TABLE product_category_translations ADD CONSTRAINT product_category_translations_category_id_fk
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE cascade;
ALTER TABLE product_addon_translations ADD CONSTRAINT product_addon_translations_addon_id_fk
  FOREIGN KEY (addon_id) REFERENCES product_addons(id) ON DELETE cascade;
INSERT INTO product_translations (product_id, locale, title, description, sub_description, allergen_info)
  SELECT id,'en',title,description,sub_description,allergen_info FROM products
  ON CONFLICT (product_id, locale) DO NOTHING;
INSERT INTO product_category_translations (category_id, locale, name, description)
  SELECT id,'en',name,description FROM product_categories
  ON CONFLICT (category_id, locale) DO NOTHING;
INSERT INTO product_addon_translations (addon_id, locale, name)
  SELECT id,'en',name FROM product_addons
  ON CONFLICT (addon_id, locale) DO NOTHING;
`;

async function main() {
  const sql = postgres(DATABASE_URL!, { prepare: false });
  const q = (s: string) => sql.unsafe(s);
  try {
    console.log(`\n=== upgrade-to-v2: ${SOURCE} → ${TARGET} ===`);

    // Guards
    const [{ exists: srcExists }] = await sql<{ exists: boolean }[]>`
      SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name=${SOURCE}) AS exists`;
    if (!srcExists) die(`Schema nguồn "${SOURCE}" không tồn tại.`);
    const [{ exists: dstExists }] = await sql<{ exists: boolean }[]>`
      SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name=${TARGET}) AS exists`;
    if (dstExists) {
      if (!DROP_TARGET) die(`Schema đích "${TARGET}" đã tồn tại. Xoá tay, hoặc chạy lại với DROP_TARGET=1.`);
      console.log(`• DROP_TARGET=1 → xoá schema "${TARGET}" cũ...`);
      await q(`DROP SCHEMA ${TARGET} CASCADE`);
    }

    // PHASE 1 — clone
    console.log(`\n[1/4] Clone ${SOURCE} → ${TARGET} ...`);
    await q(CLONE_SCHEMA_FN);
    await q(`SELECT public.__clone_schema('${SOURCE}','${TARGET}')`);
    await q(`DROP FUNCTION IF EXISTS public.__clone_schema(text, text)`);

    // verify clone: cùng số bảng + row count từng bảng khớp
    const tables = await sql<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema=${SOURCE} AND table_type='BASE TABLE' ORDER BY table_name`;
    for (const { table_name } of tables) {
      const [{ c: cs }] = await q(`SELECT count(*)::int c FROM ${SOURCE}.${table_name}`) as unknown as [{ c: number }];
      const [{ c: cd }] = await q(`SELECT count(*)::int c FROM ${TARGET}.${table_name}`) as unknown as [{ c: number }];
      if (cs !== cd) die(`Clone lỗi: ${table_name} nguồn ${cs} ≠ đích ${cd} row.`);
    }
    console.log(`      ✓ clone khớp ${tables.length} bảng (row count trùng khớp).`);

    // PHASE 2 — entity translations + seed en
    console.log(`\n[2/4] Tạo 3 bảng *_translations + seed en trên ${TARGET} ...`);
    await q(ENTITY_DDL(TARGET));
    for (const [base, tt, idcol] of [
      ["products", "product_translations", "product_id"],
      ["product_categories", "product_category_translations", "category_id"],
      ["product_addons", "product_addon_translations", "addon_id"],
    ]) {
      const [{ b }] = await q(`SELECT count(*)::int b FROM ${TARGET}.${base}`) as unknown as [{ b: number }];
      const [{ e }] = await q(`SELECT count(*)::int e FROM ${TARGET}.${tt} WHERE locale='en'`) as unknown as [{ e: number }];
      if (b !== e) die(`Seed lỗi: ${base}=${b} ≠ ${tt}(en)=${e}.`);
      console.log(`      ✓ ${tt}: ${e} row en (khớp ${base}).`);
    }

    // PHASE 3 — config i18n (string -> {en,vi}) trên TARGET
    console.log(`\n[3/4] Migrate config JSON trên ${TARGET} ...`);
    type Row = { key: string; value: Config };
    const rows = (await sql`SELECT key, value FROM ${sql(TARGET)}.configs WHERE config_type='ui'`) as unknown as Row[];
    let changed = 0;
    for (const row of rows) {
      const migrated = migrateConfig(row.value, uiMeta[row.key] ?? []);
      if (JSON.stringify(migrated) === JSON.stringify(row.value)) continue;
      await sql`UPDATE ${sql(TARGET)}.configs SET value=${sql.json(migrated as any)} WHERE key=${row.key} AND config_type='ui'`;
      changed++;
    }
    console.log(`      ✓ ${rows.length} config ui, ${changed} bản đã localize.`);

    // PHASE 4 — done
    console.log(`\n[4/4] ✅ XONG. Schema "${TARGET}" đã sẵn sàng cho code multi-language.`);
    console.log(`   → Bước tiếp: set Vercel DB_SCHEMA=${TARGET}, merge branch, deploy.`);
    console.log(`   → Rollback: switch Vercel về deployment cũ (code cũ vẫn đọc "${SOURCE}").\n`);
  } catch (err) {
    console.error("\n❌ THẤT BẠI:", err);
    console.error(`   Schema "${SOURCE}" KHÔNG bị đụng. Xoá "${TARGET}" (DROP SCHEMA ${TARGET} CASCADE) rồi chạy lại.\n`);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
