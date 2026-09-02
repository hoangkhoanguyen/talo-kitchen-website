/**
 * Rollback for seed-entities-i18n.ts (and, more broadly, for the TASK-02
 * migration): drops the 3 entity translation tables entirely.
 *
 * Base columns on products / product_categories / product_addons are NEVER
 * touched — dropping the translation tables leaves the English content fully
 * intact on the base tables (the source of truth / final fallback).
 *
 * Standalone tsx script — NOT part of the Next.js runtime. Does NOT import
 * `getDb()` (server-only); creates its own `postgres` client from
 * `DATABASE_URL` / `DB_SCHEMA` env vars.
 *
 * Usage:
 *   DB_SCHEMA=dev_multi_lang npm run rollback:entities-i18n
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
      "[rollback-entities-i18n] WARNING: DB_SCHEMA is not set — refusing to guess a schema. " +
        "Set DB_SCHEMA explicitly (e.g. DB_SCHEMA=dev_multi_lang) before running this script."
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[rollback-entities-i18n] ERROR: DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { prepare: false });

  try {
    console.log(`[rollback-entities-i18n] schema = "${schema}"`);

    // Backup the translation rows themselves before dropping, for audit/
    // manual re-seed reference (base columns are untouched by this rollback,
    // so they are not the concern here — this is just for traceability).
    const backupsDir = path.join(process.cwd(), "scripts", "backups");
    fs.mkdirSync(backupsDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");

    const tables = [
      "product_translations",
      "product_category_translations",
      "product_addon_translations",
    ];
    const existing = await sql<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = ${schema} AND table_name = ANY(${tables})
    `;
    const existingNames = new Set(existing.map((r) => r.table_name));

    const dump: Record<string, unknown[]> = {};
    for (const t of tables) {
      if (!existingNames.has(t)) continue;
      dump[t] = (await sql`SELECT * FROM ${sql(schema)}.${sql(t)}`) as unknown as unknown[];
    }
    const backupPath = path.join(
      backupsDir,
      `entities-i18n-rollback-${ts}.json`
    );
    fs.writeFileSync(
      backupPath,
      JSON.stringify({ schema, ...dump }, null, 2),
      "utf-8"
    );
    console.log(`[rollback-entities-i18n] backup written to ${backupPath}`);

    if (existingNames.size === 0) {
      console.log(
        "[rollback-entities-i18n] none of the 3 translation tables exist — nothing to drop."
      );
      return;
    }

    const dropList = tables.filter((t) => existingNames.has(t));
    console.log(
      `[rollback-entities-i18n] dropping (CASCADE): ${dropList
        .map((t) => `${schema}.${t}`)
        .join(", ")}`
    );

    await sql.unsafe(
      `DROP TABLE ${dropList
        .map((t) => `"${schema}"."${t}"`)
        .join(", ")} CASCADE`
    );

    console.log(
      "[rollback-entities-i18n] done. Base columns on products/product_categories/product_addons are unaffected (English content intact)."
    );
  } finally {
    await sql.end();
  }
}

const isMainModule =
  process.argv[1] != null && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch((err) => {
    console.error("[rollback-entities-i18n] FAILED:", err);
    process.exit(1);
  });
}
