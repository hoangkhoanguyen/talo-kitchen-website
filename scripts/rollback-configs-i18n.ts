/**
 * Rollback for migrate-configs-i18n.ts: turns localized fields `{ en, vi }`
 * back into a plain string (the default-locale value), for every UI config
 * row's fields marked `localized: true` in uiMeta.
 *
 * Standalone tsx script — NOT part of the Next.js runtime. Does NOT import
 * `getDb()` (server-only); creates its own `postgres` client from
 * `DATABASE_URL` / `DB_SCHEMA` env vars.
 *
 * Usage:
 *   DB_SCHEMA=dev_multi_lang npm run rollback:configs-i18n
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { walkFields, normalizeLocalized } from "@/lib/localized-config";
import { uiMeta } from "@/constants/settings/ui";
import { routing } from "@/i18n/routing";
import type { Config } from "@/types/configs";
import type { MetaValue } from "@/types/settings";

function rollbackFields(obj: any, fields: MetaValue["fields"]): any {
  return walkFields(obj, fields, (val) => {
    const norm = normalizeLocalized(val);
    return norm[routing.defaultLocale as keyof typeof norm] ?? "";
  });
}

export function rollbackConfig(value: Config, sections: MetaValue[]): Config {
  const result: Config = { ...value };
  for (const section of sections) {
    if (value[section.key] !== undefined) {
      result[section.key] = rollbackFields(value[section.key], section.fields);
    }
  }
  return result;
}

async function main() {
  const schema = process.env.DB_SCHEMA;
  if (!schema) {
    console.warn(
      "[rollback-configs-i18n] WARNING: DB_SCHEMA is not set — refusing to guess a schema. " +
        "Set DB_SCHEMA explicitly (e.g. DB_SCHEMA=dev_multi_lang) before running this script."
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[rollback-configs-i18n] ERROR: DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { prepare: false });

  try {
    console.log(`[rollback-configs-i18n] schema = "${schema}"`);

    type Row = { key: string; config_type: string; value: Config };
    const rows = (await sql<Row[]>`
      SELECT key, config_type, value
      FROM ${sql(schema)}.configs
      WHERE config_type = 'ui'
    `) as unknown as Row[];

    console.log(
      `[rollback-configs-i18n] fetched ${rows.length} ui config row(s): ${rows
        .map((r) => r.key)
        .join(", ")}`
    );

    const backupsDir = path.join(process.cwd(), "scripts", "backups");
    fs.mkdirSync(backupsDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupsDir, `configs-ui-rollback-${ts}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(rows, null, 2), "utf-8");
    console.log(`[rollback-configs-i18n] backup written to ${backupPath}`);

    for (const row of rows) {
      const meta = uiMeta[row.key] ?? [];
      const rolledBack = rollbackConfig(row.value, meta);
      const before = JSON.stringify(row.value);
      const after = JSON.stringify(rolledBack);

      if (before === after) {
        console.log(`[rollback-configs-i18n] ${row.key}: no change`);
        continue;
      }

      await sql`
        UPDATE ${sql(schema)}.configs
        SET value = ${sql.json(rolledBack as any)}
        WHERE key = ${row.key} AND config_type = 'ui'
      `;
      console.log(`[rollback-configs-i18n] ${row.key}: rolled back (value changed)`);
    }

    console.log("[rollback-configs-i18n] done.");
  } finally {
    await sql.end();
  }
}

const isMainModule =
  process.argv[1] != null &&
  import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch((err) => {
    console.error("[rollback-configs-i18n] FAILED:", err);
    process.exit(1);
  });
}
