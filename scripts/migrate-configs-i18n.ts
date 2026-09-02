/**
 * One-off migration: localize UI config JSON fields marked `localized: true`
 * in uiMeta (string -> { en, vi }).
 *
 * Standalone tsx script — NOT part of the Next.js runtime. Does NOT import
 * `getDb()` (server-only); creates its own `postgres` client from
 * `DATABASE_URL` / `DB_SCHEMA` env vars.
 *
 * Usage:
 *   DB_SCHEMA=dev_multi_lang npm run migrate:configs-i18n
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { migrateConfig } from "@/lib/localized-config";
import { uiMeta } from "@/constants/settings/ui";
import type { Config } from "@/types/configs";

async function main() {
  const schema = process.env.DB_SCHEMA;
  if (!schema) {
    console.warn(
      "[migrate-configs-i18n] WARNING: DB_SCHEMA is not set — refusing to guess a schema. " +
        "Set DB_SCHEMA explicitly (e.g. DB_SCHEMA=dev_multi_lang) before running this script."
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[migrate-configs-i18n] ERROR: DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { prepare: false });

  try {
    console.log(`[migrate-configs-i18n] schema = "${schema}"`);

    type Row = { key: string; config_type: string; value: Config };
    const rows = (await sql<Row[]>`
      SELECT key, config_type, value
      FROM ${sql(schema)}.configs
      WHERE config_type = 'ui'
    `) as unknown as Row[];

    console.log(
      `[migrate-configs-i18n] fetched ${rows.length} ui config row(s): ${rows
        .map((r) => r.key)
        .join(", ")}`
    );

    // Backup BEFORE any update.
    const backupsDir = path.join(process.cwd(), "scripts", "backups");
    fs.mkdirSync(backupsDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupsDir, `configs-ui-${ts}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(rows, null, 2), "utf-8");
    console.log(`[migrate-configs-i18n] backup written to ${backupPath}`);

    for (const row of rows) {
      const meta = uiMeta[row.key] ?? [];
      const migrated = migrateConfig(row.value, meta);
      const before = JSON.stringify(row.value);
      const after = JSON.stringify(migrated);

      if (before === after) {
        console.log(`[migrate-configs-i18n] ${row.key}: no change / already migrated`);
        continue;
      }

      await sql`
        UPDATE ${sql(schema)}.configs
        SET value = ${sql.json(migrated as any)}
        WHERE key = ${row.key} AND config_type = 'ui'
      `;
      console.log(`[migrate-configs-i18n] ${row.key}: migrated (value changed)`);
    }

    console.log("[migrate-configs-i18n] done.");
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("[migrate-configs-i18n] FAILED:", err);
  process.exit(1);
});
