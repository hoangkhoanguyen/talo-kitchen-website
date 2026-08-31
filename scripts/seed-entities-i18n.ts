/**
 * One-off seed: create the `locale = 'en'` translation row for every existing
 * product / category / addon from its base (English) columns.
 *
 * Standalone tsx script — NOT part of the Next.js runtime. Does NOT import
 * `getDb()` (server-only); creates its own `postgres` client from
 * `DATABASE_URL` / `DB_SCHEMA` env vars.
 *
 * Idempotent: uses `ON CONFLICT (entity_id, locale) DO NOTHING`, so re-running
 * never overwrites an `en` row an admin may have already edited by hand.
 * Copies `NULL` base columns as `NULL` (no coercion to empty string).
 *
 * Usage:
 *   DB_SCHEMA=dev_multi_lang npm run seed:entities-i18n
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

async function main() {
  const schema = process.env.DB_SCHEMA;
  if (!schema) {
    console.warn(
      "[seed-entities-i18n] WARNING: DB_SCHEMA is not set — refusing to guess a schema. " +
        "Set DB_SCHEMA explicitly (e.g. DB_SCHEMA=dev_multi_lang) before running this script."
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[seed-entities-i18n] ERROR: DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { prepare: false });

  try {
    console.log(`[seed-entities-i18n] schema = "${schema}"`);

    // Guard: fail loudly (non-zero exit) if the translation tables don't
    // exist yet (e.g. TASK-02 migration hasn't been applied).
    const requiredTables = [
      "product_translations",
      "product_category_translations",
      "product_addon_translations",
    ];
    const existing = await sql<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = ${schema} AND table_name = ANY(${requiredTables})
    `;
    const existingNames = new Set(existing.map((r) => r.table_name));
    const missing = requiredTables.filter((t) => !existingNames.has(t));
    if (missing.length > 0) {
      console.error(
        `[seed-entities-i18n] ERROR: missing table(s) in schema "${schema}": ${missing.join(
          ", "
        )}. Run the TASK-02 migration first.`
      );
      process.exit(1);
    }

    // Backup base columns BEFORE any insert.
    const products = await sql`
      SELECT id, title, description, sub_description, allergen_info
      FROM ${sql(schema)}.products
    `;
    const categories = await sql`
      SELECT id, name, description
      FROM ${sql(schema)}.product_categories
    `;
    const addons = await sql`
      SELECT id, name
      FROM ${sql(schema)}.product_addons
    `;

    const backupsDir = path.join(process.cwd(), "scripts", "backups");
    fs.mkdirSync(backupsDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(
      backupsDir,
      `entities-i18n-seed-${ts}.json`
    );
    fs.writeFileSync(
      backupPath,
      JSON.stringify({ schema, products, categories, addons }, null, 2),
      "utf-8"
    );
    console.log(`[seed-entities-i18n] backup written to ${backupPath}`);
    console.log(
      `[seed-entities-i18n] fetched ${products.length} product(s), ${categories.length} categor(y/ies), ${addons.length} addon(s)`
    );

    const productResult = await sql`
      INSERT INTO ${sql(schema)}.product_translations
        (product_id, locale, title, description, sub_description, allergen_info)
      SELECT id, 'en', title, description, sub_description, allergen_info
      FROM ${sql(schema)}.products
      ON CONFLICT (product_id, locale) DO NOTHING
      RETURNING product_id
    `;
    console.log(
      `[seed-entities-i18n] product_translations: inserted ${productResult.length} row(s) (of ${products.length} product(s); rest already had an 'en' row)`
    );

    const categoryResult = await sql`
      INSERT INTO ${sql(schema)}.product_category_translations
        (category_id, locale, name, description)
      SELECT id, 'en', name, description
      FROM ${sql(schema)}.product_categories
      ON CONFLICT (category_id, locale) DO NOTHING
      RETURNING category_id
    `;
    console.log(
      `[seed-entities-i18n] product_category_translations: inserted ${categoryResult.length} row(s) (of ${categories.length} categor(y/ies); rest already had an 'en' row)`
    );

    const addonResult = await sql`
      INSERT INTO ${sql(schema)}.product_addon_translations
        (addon_id, locale, name)
      SELECT id, 'en', name
      FROM ${sql(schema)}.product_addons
      ON CONFLICT (addon_id, locale) DO NOTHING
      RETURNING addon_id
    `;
    console.log(
      `[seed-entities-i18n] product_addon_translations: inserted ${addonResult.length} row(s) (of ${addons.length} addon(s); rest already had an 'en' row)`
    );

    console.log("[seed-entities-i18n] done.");
  } finally {
    await sql.end();
  }
}

const isMainModule =
  process.argv[1] != null && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch((err) => {
    console.error("[seed-entities-i18n] FAILED:", err);
    process.exit(1);
  });
}
