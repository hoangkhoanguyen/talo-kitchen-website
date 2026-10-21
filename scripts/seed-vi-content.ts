/**
 * Seed Vietnamese (`vi`) content into the database.
 *
 * Standalone tsx script — NOT part of the Next.js runtime. Does NOT import
 * `getDb()` (server-only); creates its own `postgres` client from
 * `DATABASE_URL` / `DB_SCHEMA` env vars.
 *
 * Three modes (see scripts/i18n-vi/README.md for the full walkthrough):
 *
 *   check      read-only: count strings that still have no `vi`
 *   translate  read `en` from the DB, translate with the Claude API, write
 *              scripts/i18n-vi/vi.json (review/edit that file by hand)
 *   apply      write vi.json into the DB. DRY-RUN unless --apply is passed.
 *              Never overwrites a non-empty `vi` (customer edits are safe).
 *
 * Usage:
 *   npm run vi:check     -- --env=dev
 *   npm run vi:translate -- --env=dev
 *   npm run vi:apply     -- --env=prod             # dry-run
 *   npm run vi:apply     -- --env=prod --apply     # real write
 * --env=<name> loads .env.<name> (DATABASE_URL, DB_SCHEMA, ANTHROPIC_API_KEY...).
 */
import { config as loadEnv } from "dotenv";

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import postgres from "postgres";
import {
  ENTITY_TABLES,
  assertTablesExist,
  collectAllItems,
  fillConfigValue,
  maxLen,
  type Item,
  type Sql,
} from "./i18n-vi/lib";

// --env=dev|prod (required) -> loads ONLY .env.<name>. Deliberately does not
// read .env / .env.local, so a stray DATABASE_URL there can't hit the wrong DB.
const envArg = process.argv.find((a) => a.startsWith("--env="))?.slice(6);
if (!envArg || !/^[\w-]+$/.test(envArg)) {
  console.error(
    "[seed-vi-content] ERROR: pass --env=<name> (e.g. --env=dev or --env=prod) to load .env.<name>.",
  );
  process.exit(1);
}
const envFile = `.env.${envArg}`;
if (!fs.existsSync(envFile)) {
  console.error(`[seed-vi-content] ERROR: ${envFile} not found in ${process.cwd()}.`);
  process.exit(1);
}
loadEnv({ path: envFile });

const DIR = path.join(process.cwd(), "scripts", "i18n-vi");
const VI_FILE = path.join(DIR, "vi.json");
const STYLE_FILE = path.join(DIR, "style-guide.md");
const BATCH_SIZE = 30;

type ViFile = Record<string, { en: string; vi: string }>;

function fail(msg: string): never {
  console.error(`[seed-vi-content] ERROR: ${msg}`);
  process.exit(1);
}

function readViFile(): ViFile {
  if (!fs.existsSync(VI_FILE)) return {};
  return JSON.parse(fs.readFileSync(VI_FILE, "utf-8")) as ViFile;
}

function writeViFile(data: ViFile) {
  fs.writeFileSync(VI_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

const isBlank = (v: unknown) => v == null || String(v).trim() === "";

// ------------------------------------------------------------------- check

function printMissing(items: Item[]) {
  const missing = items.filter((i) => isBlank(i.vi));
  const groups = new Map<string, number>();
  for (const i of missing) {
    const g = i.key.split(/[:.]/)[0] === "config" ? "config" : i.key.split(":")[0];
    groups.set(g, (groups.get(g) ?? 0) + 1);
  }
  console.log(
    `[seed-vi-content] ${items.length} translatable string(s); ${missing.length} still without 'vi'`,
  );
  for (const [g, n] of groups) console.log(`  - ${g}: ${n} missing`);
  return missing;
}

// --------------------------------------------------------------- translate

async function callClaude(
  system: string,
  batch: Item[],
): Promise<Record<string, string>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) fail("ANTHROPIC_API_KEY is not set (needed for translate).");
  const model = process.env.VI_MODEL || "claude-sonnet-5-5";

  const payload = batch.map((it, i) => ({
    id: String(i + 1),
    context: it.hint,
    english: it.en,
  }));
  const user =
    "Translate each item's `english` text into Vietnamese following the style guide.\n" +
    "Reply with ONLY a JSON object mapping each `id` to its Vietnamese string, nothing else.\n\n" +
    JSON.stringify(payload, null, 2);

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 8000,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const body: any = await res.json();
      const text: string = body.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const parsed = JSON.parse(text.slice(start, end + 1));
      const out: Record<string, string> = {};
      batch.forEach((it, i) => {
        const v = parsed[String(i + 1)];
        if (typeof v === "string" && v.trim() !== "") out[it.key] = v;
      });
      return out;
    } catch (err) {
      console.warn(`  attempt ${attempt} failed: ${(err as Error).message}`);
      if (attempt === 4) throw err;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 1)));
    }
  }
  return {};
}

async function translate(items: Item[]) {
  const file = readViFile();
  const todo = items.filter(
    (i) => isBlank(i.vi) && isBlank(file[i.key]?.vi),
  );
  console.log(
    `[seed-vi-content] ${todo.length} string(s) to translate (${Object.keys(file).length} already in vi.json are skipped)`,
  );
  if (todo.length === 0) return;

  const style = fs.existsSync(STYLE_FILE)
    ? fs.readFileSync(STYLE_FILE, "utf-8")
    : "";
  const system =
    "You are a professional English-to-Vietnamese translator for a restaurant website.\n\n" +
    style;

  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    console.log(
      `  translating ${i + 1}-${i + batch.length} of ${todo.length}...`,
    );
    const result = await callClaude(system, batch);
    for (const it of batch) {
      const vi = result[it.key];
      if (vi === undefined) {
        console.warn(`  no translation returned for ${it.key} (re-run to retry)`);
        continue;
      }
      file[it.key] = { en: it.en, vi };
    }
    writeViFile(file); // save after every batch so a crash loses nothing
  }
  console.log(`[seed-vi-content] wrote ${VI_FILE}`);
  console.log(
    "Review/edit the 'vi' values in that file, then run: npm run vi:apply",
  );
}

// ------------------------------------------------------------------- apply

async function confirm(schema: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const ans = await rl.question(
    `\nThis will WRITE to schema "${schema}". Type the schema name to confirm: `,
  );
  rl.close();
  if (ans.trim() !== schema) fail("confirmation did not match; aborted.");
}

async function apply(
  sql: Sql,
  schema: string,
  items: Item[],
  configs: { key: string; value: any }[],
  doWrite: boolean,
) {
  const file = readViFile();
  if (Object.keys(file).length === 0) {
    fail("scripts/i18n-vi/vi.json is empty/missing. Run vi:translate first.");
  }

  // Strings to fill = in vi.json, exist in DB, DB `vi` currently empty.
  const dbByKey = new Map(items.map((i) => [i.key, i]));
  const vi: Record<string, string> = {};
  let orphan = 0;
  let alreadySet = 0;
  for (const [key, { vi: v }] of Object.entries(file)) {
    if (isBlank(v)) continue;
    const it = dbByKey.get(key);
    if (!it) {
      orphan++;
      continue;
    }
    if (!isBlank(it.vi)) {
      alreadySet++;
      continue;
    }
    const limit = maxLen(key);
    if (limit && v.length > limit) {
      fail(`${key}: translation is ${v.length} chars, column limit is ${limit}.`);
    }
    vi[key] = v;
  }
  const keys = Object.keys(vi);
  console.log(
    `[seed-vi-content] to fill: ${keys.length}; skipped (DB already has vi): ${alreadySet}; skipped (not in DB): ${orphan}`,
  );
  keys.slice(0, 5).forEach((k) =>
    console.log(`  e.g. ${k}\n       en: ${dbByKey.get(k)!.en.slice(0, 70)}\n       vi: ${vi[k].slice(0, 70)}`),
  );

  if (!doWrite) {
    console.log("\nDRY-RUN: nothing was written. Re-run with --apply to write.");
    return;
  }
  if (keys.length === 0) {
    console.log("[seed-vi-content] nothing to write.");
    return;
  }

  await confirm(schema);

  // Backup BEFORE any write.
  const backupsDir = path.join(process.cwd(), "scripts", "backups");
  fs.mkdirSync(backupsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backup: Record<string, unknown> = { schema, configs };
  for (const t of ENTITY_TABLES) {
    backup[t.table] = await sql`SELECT * FROM ${sql(schema)}.${sql(t.table)}`;
  }
  const backupPath = path.join(backupsDir, `vi-content-seed-${ts}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf-8");
  console.log(`[seed-vi-content] backup written to ${backupPath}`);

  await sql.begin(async (tx) => {
    // --- entity translation tables: fill only empty columns
    for (const t of ENTITY_TABLES) {
      const byId = new Map<number, Record<string, string>>();
      for (const k of keys) {
        const m = new RegExp(`^${t.kind}:(\\d+)\\.(\\w+)$`).exec(k);
        if (!m) continue;
        const id = Number(m[1]);
        byId.set(id, { ...(byId.get(id) ?? {}), [m[2]]: vi[k] });
      }
      for (const [id, cols] of byId) {
        const names = Object.keys(cols);
        const row = { [t.fk]: id, locale: "vi", ...cols };
        const sets = names
          .map(
            (c) =>
              tx`${tx(c)} = COALESCE(NULLIF(${tx(schema)}.${tx(t.table)}.${tx(c)}, ''), EXCLUDED.${tx(c)})`,
          )
          .reduce((a, b) => tx`${a}, ${b}`);
        await tx`
          INSERT INTO ${tx(schema)}.${tx(t.table)} ${tx(row, t.fk, "locale", ...names)}
          ON CONFLICT (${tx(t.fk)}, locale)
          DO UPDATE SET ${sets}, updated_at = now()
        `;
      }
      console.log(
        `  ${t.table}: ${byId.size} row(s) upserted`,
      );
    }

    // --- ui configs: fill only empty `vi` leaves
    for (const row of configs) {
      const { value, filled } = fillConfigValue(row.key, row.value, vi);
      if (filled === 0) continue;
      await tx`
        UPDATE ${tx(schema)}.configs
        SET value = ${tx.json(value)}
        WHERE key = ${row.key} AND config_type = 'ui'
      `;
      console.log(`  configs/${row.key}: ${filled} field(s) filled`);
    }
  });
  console.log("[seed-vi-content] write committed.");

  const url = process.env.REVALIDATE_URL;
  if (url) {
    try {
      const res = await fetch(url);
      console.log(`[seed-vi-content] revalidate ${url} -> HTTP ${res.status}`);
    } catch (err) {
      console.warn(
        `[seed-vi-content] revalidate call failed (${(err as Error).message}); call it manually.`,
      );
    }
  } else {
    console.log(
      "[seed-vi-content] REVALIDATE_URL not set: call GET <your-domain>/api/revalidate-all manually so /vi shows the new data.",
    );
  }
}

// -------------------------------------------------------------------- main

async function main() {
  const mode = process.argv[2];
  if (!["check", "translate", "apply"].includes(mode)) {
    fail("usage: seed-vi-content.ts <check|translate|apply> --env=<dev|prod> [--apply]");
  }
  const schema = process.env.DB_SCHEMA;
  if (!schema) {
    fail(
      "DB_SCHEMA is not set — refusing to guess a schema (e.g. DB_SCHEMA=prod).",
    );
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) fail("DATABASE_URL is not set.");

  const sql = postgres(databaseUrl, { prepare: false });
  try {
    const host = (() => {
      try {
        return new URL(databaseUrl).host;
      } catch {
        return "?";
      }
    })();
    console.log(`[seed-vi-content] mode=${mode} env=${envFile} host=${host} schema="${schema}"`);

    await assertTablesExist(sql, schema);
    const { items, configs } = await collectAllItems(sql, schema);

    if (mode === "check") printMissing(items);
    else if (mode === "translate") await translate(items);
    else await apply(sql, schema, items, configs, process.argv.includes("--apply"));
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error("[seed-vi-content] FAILED:", err);
  process.exit(1);
});
