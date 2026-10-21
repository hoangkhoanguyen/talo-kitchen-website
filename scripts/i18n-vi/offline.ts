/**
 * Offline helper (no DB connection): turns a DBeaver export of the `en`/`vi`
 * rows into a todo list, and a translated vi.json into a reviewable SQL file.
 *
 *   npx tsx scripts/i18n-vi/offline.ts extract <export.json> <todo.json>
 *   npx tsx scripts/i18n-vi/offline.ts sql <export.json> <vi.json> <out.sql>
 *
 * The export is the single-cell JSON produced by the query in README
 * ("Cách B"). DBeaver's own JSON export wraps it in an outer object/array;
 * both the raw and the wrapped form are accepted.
 */
import fs from "node:fs";
import { ENTITY_TABLES, collectConfigItems, fillConfigValue, type Item } from "./lib";

type Row = Record<string, any>;
interface Export {
  schema: string;
  products: Row[];
  categories: Row[];
  addons: Row[];
  configs: { key: string; value: any }[];
}

const isBlank = (v: unknown) => v == null || String(v).trim() === "";

function loadExport(file: string): Export {
  let d: any = JSON.parse(fs.readFileSync(file, "utf-8"));
  // unwrap DBeaver's { "<query>": [ "<json string>" | {export: "<json string>"} ] }
  if (!d.products) {
    const first = Object.values(d)[0] as any;
    const cell = Array.isArray(first) ? first[0] : first;
    d = typeof cell === "string" ? JSON.parse(cell) : JSON.parse(cell.export);
  }
  return d as Export;
}

const KIND_SRC: Record<string, keyof Export> = {
  product: "products",
  category: "categories",
  addon: "addons",
};

function collect(exp: Export): Item[] {
  const items: Item[] = [];
  for (const t of ENTITY_TABLES) {
    const rows = exp[KIND_SRC[t.kind]] as Row[];
    const byId = new Map<number, { en?: Row; vi?: Row }>();
    for (const r of rows) {
      const e = byId.get(r.id) ?? {};
      e[r.locale as "en" | "vi"] = r;
      byId.set(r.id, e);
    }
    for (const [id, { en, vi }] of byId) {
      if (!en) continue;
      for (const [col, [hint]] of Object.entries(t.cols)) {
        if (isBlank(en[col])) continue;
        items.push({
          key: `${t.kind}:${id}.${col}`,
          hint,
          en: String(en[col]),
          vi: isBlank(vi?.[col]) ? "" : String(vi![col]),
        });
      }
    }
  }
  return [...items, ...collectConfigItems(exp.configs)];
}

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

function genSql(exp: Export, vi: Record<string, string>): string {
  const S = exp.schema;
  if (!/^\w+$/.test(S)) throw new Error(`bad schema name: ${S}`);
  const db = new Map(collect(exp).map((i) => [i.key, i]));
  const fill: Record<string, string> = {};
  for (const [k, v] of Object.entries(vi)) {
    const it = db.get(k);
    if (!it || !isBlank(it.vi) || isBlank(v)) continue;
    fill[k] = v;
  }
  const out: string[] = [
    `-- Seed nội dung tiếng Việt vào schema "${S}". Chỉ điền ô vi đang trống, không ghi đè.`,
    `-- ${Object.keys(fill).length} chuỗi. Chạy trong 1 transaction; kiểm tra rồi COMMIT.`,
    "BEGIN;",
    "",
  ];

  for (const t of ENTITY_TABLES) {
    const byId = new Map<number, Record<string, string>>();
    for (const [k, v] of Object.entries(fill)) {
      const m = new RegExp(`^${t.kind}:(\\d+)\\.(\\w+)$`).exec(k);
      if (m) byId.set(+m[1], { ...(byId.get(+m[1]) ?? {}), [m[2]]: v });
    }
    if (byId.size === 0) continue;
    out.push(`-- ${t.table}`);
    for (const [id, cols] of byId) {
      const names = Object.keys(cols);
      out.push(
        `INSERT INTO ${S}.${t.table} (${t.fk}, locale, ${names.join(", ")})\n` +
          `VALUES (${id}, 'vi', ${names.map((c) => q(cols[c])).join(", ")})\n` +
          `ON CONFLICT (${t.fk}, locale) DO UPDATE SET\n` +
          names
            .map(
              (c) =>
                `  ${c} = COALESCE(NULLIF(${S}.${t.table}.${c}, ''), EXCLUDED.${c})`,
            )
            .join(",\n") +
          `,\n  updated_at = now();`,
      );
    }
    out.push("");
  }

  // configs: one UPDATE per config row with the full filled JSON (fill-only-empty
  // is already decided against the exported value; guard with the old value so a
  // concurrent edit by the customer is not overwritten).
  out.push("-- configs (ui)");
  for (const row of exp.configs) {
    const { value, filled } = fillConfigValue(row.key, row.value, fill);
    if (filled === 0) continue;
    out.push(
      `-- ${row.key}: ${filled} field\n` +
        `UPDATE ${S}.configs SET value = ${q(JSON.stringify(value))}::jsonb\n` +
        `WHERE key = ${q(row.key)} AND config_type = 'ui'\n` +
        `  AND value = ${q(JSON.stringify(row.value))}::jsonb;  -- phải báo "UPDATE 1"`,
    );
  }
  out.push("", "COMMIT;", "");
  return out.join("\n");
}

const [mode, a, b, c] = process.argv.slice(2);
if (mode === "extract") {
  const exp = loadExport(a);
  const items = collect(exp);
  const todo = items.filter((i) => isBlank(i.vi));
  const file: Record<string, { hint: string; en: string }> = {};
  todo.forEach((i) => (file[i.key] = { hint: i.hint, en: i.en }));
  fs.writeFileSync(b, JSON.stringify(file, null, 2) + "\n");
  console.log(`schema=${exp.schema} total=${items.length} to-translate=${todo.length} -> ${b}`);
} else if (mode === "sql") {
  const vi = JSON.parse(fs.readFileSync(b, "utf-8")) as Record<string, string>;
  fs.writeFileSync(c, genSql(loadExport(a), vi));
  console.log(`wrote ${c}`);
} else {
  console.error("usage: offline.ts extract <export> <todo.json> | sql <export> <vi.json> <out.sql>");
  process.exit(1);
}
