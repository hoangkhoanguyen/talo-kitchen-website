/**
 * One-off, idempotent migration: append the "dineIn" shipping method to the
 * stored `order` app config (configs.key = 'order', config_type = 'app',
 * value.shipping.methods). Safe to run multiple times — it does nothing if
 * a method with `method === "dineIn"` already exists.
 *
 * The shipping `label`/`description` fields are NOT marked `localized` in
 * shippingMeta, so by default they are stored as plain strings (English), same
 * as door2door/pickup. If the stored methods already use localized objects
 * ({ en, vi }), the new method is written as { en, vi } to match.
 *
 * Standalone tsx script — NOT part of the Next.js runtime. Does NOT import
 * `getDb()`; creates its own `postgres` client from DATABASE_URL / DB_SCHEMA.
 *
 * Usage:
 *   DB_SCHEMA=<schema> npm run migrate:dine-in
 *
 * After running, the cached config must be invalidated (the app caches app
 * configs with no auto-revalidate): restart/redeploy the app, or re-save the
 * "order" settings in admin.
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { EShippingMethod } from "@/types/app-configs";
import type { Config } from "@/types/configs";

const DINE_IN = {
  en: {
    label: "Dine-in",
    description:
      "Eat at the restaurant. Order from your table and our staff will serve you.",
  },
  vi: {
    label: "Ăn tại quán",
    description:
      "Dùng bữa tại nhà hàng. Bạn gọi món tại bàn và nhân viên sẽ phục vụ bạn.",
  },
};

type Method = Record<string, unknown> & { method?: string; label?: unknown };

/** Pure: returns the new config value, or null when dineIn already exists. */
export function addDineInMethod(value: Config): Config | null {
  const shipping = (value.shipping ?? {}) as Record<string, unknown>;
  const methods = (
    Array.isArray(shipping.methods) ? shipping.methods : []
  ) as Method[];

  if (methods.some((m) => m.method === EShippingMethod.dineIn)) return null;

  const localized = methods.some(
    (m) => m.label !== null && typeof m.label === "object",
  );

  const newMethod: Method = localized
    ? {
        method: EShippingMethod.dineIn,
        label: { en: DINE_IN.en.label, vi: DINE_IN.vi.label },
        description: {
          en: DINE_IN.en.description,
          vi: DINE_IN.vi.description,
        },
        isDefault: false,
      }
    : {
        method: EShippingMethod.dineIn,
        label: DINE_IN.en.label,
        description: DINE_IN.en.description,
        isDefault: false,
      };

  return {
    ...value,
    shipping: { ...shipping, methods: [...methods, newMethod] },
  } as Config;
}

async function main() {
  const schema = process.env.DB_SCHEMA;
  if (!schema) {
    console.warn(
      "[add-dine-in-method] WARNING: DB_SCHEMA is not set — refusing to guess a schema. " +
        "Set DB_SCHEMA explicitly before running this script.",
    );
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("[add-dine-in-method] ERROR: DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { prepare: false });

  try {
    console.log(`[add-dine-in-method] schema = "${schema}"`);

    type Row = { key: string; config_type: string; value: Config };
    const rows = (await sql<Row[]>`
      SELECT key, config_type, value
      FROM ${sql(schema)}.configs
      WHERE key = 'order' AND config_type = 'app'
    `) as unknown as Row[];

    if (rows.length === 0) {
      console.error(
        "[add-dine-in-method] ERROR: app config 'order' not found — nothing to migrate.",
      );
      process.exit(1);
    }

    const row = rows[0];
    const updated = addDineInMethod(row.value);
    if (!updated) {
      console.log("[add-dine-in-method] dineIn already present — no change.");
      return;
    }

    // Backup BEFORE updating.
    const backupsDir = path.join(process.cwd(), "scripts", "backups");
    fs.mkdirSync(backupsDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupsDir, `configs-order-${ts}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(rows, null, 2), "utf-8");
    console.log(`[add-dine-in-method] backup written to ${backupPath}`);

    await sql`
      UPDATE ${sql(schema)}.configs
      SET value = ${sql.json(updated as any)}, updated_at = now()
      WHERE key = 'order' AND config_type = 'app'
    `;
    console.log("[add-dine-in-method] dineIn method added.");
  } finally {
    await sql.end();
  }
}

// Run only when executed directly (keeps addDineInMethod importable in tests).
if (process.argv[1] && /add-dine-in-method\.[tj]s$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error("[add-dine-in-method] FAILED:", err);
    process.exit(1);
  });
}
