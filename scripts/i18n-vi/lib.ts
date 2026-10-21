/**
 * Shared helpers for the Vietnamese content seed (scripts/seed-vi-content.ts).
 *
 * Standalone tsx code — NOT part of the Next.js runtime, no `server-only`.
 *
 * An "item" is one translatable string, identified by a stable key:
 *   product:<id>.<column>        e.g. product:12.title
 *   category:<id>.<column>       e.g. category:3.name
 *   addon:<id>.<column>          e.g. addon:7.name
 *   config:<configKey>:<path>    e.g. config:homepage:hero.description
 *                                     config:homepage:reviews.items.0.content
 */
import type postgres from "postgres";
import { uiMeta } from "@/constants/settings/ui";
import { isLocalizedField, normalizeLocalized } from "@/lib/localized-config";
import type { FieldType } from "@/types/settings";

export type Sql = ReturnType<typeof postgres>;

export interface Item {
  key: string;
  /** Short context for the translator (what kind of text this is). */
  hint: string;
  en: string;
  /** Current non-empty `vi` value in the DB ("" when missing/empty). */
  vi: string;
}

interface EntityTable {
  kind: "product" | "category" | "addon";
  table: string;
  fk: string;
  /** column -> [human hint, max length or 0 for unlimited] */
  cols: Record<string, [string, number]>;
}

export const ENTITY_TABLES: EntityTable[] = [
  {
    kind: "product",
    table: "product_translations",
    fk: "product_id",
    cols: {
      title: ["dish/product name on a restaurant menu", 255],
      description: ["dish/product description on a restaurant menu", 0],
      sub_description: ["short secondary description of a dish/product", 0],
      allergen_info: ["allergen information for a dish/product", 0],
    },
  },
  {
    kind: "category",
    table: "product_category_translations",
    fk: "category_id",
    cols: {
      name: ["menu category name", 255],
      description: ["menu category description", 1024],
    },
  },
  {
    kind: "addon",
    table: "product_addon_translations",
    fk: "addon_id",
    cols: {
      name: ["topping/add-on name for a dish", 255],
    },
  },
];

const isBlank = (v: unknown) => v == null || String(v).trim() === "";

// ---------------------------------------------------------------- entities

export async function collectEntityItems(
  sql: Sql,
  schema: string,
): Promise<Item[]> {
  const items: Item[] = [];
  for (const t of ENTITY_TABLES) {
    const rows = await sql<Record<string, any>[]>`
      SELECT * FROM ${sql(schema)}.${sql(t.table)}
      WHERE locale IN ('en', 'vi')
      ORDER BY ${sql(t.fk)}
    `;
    const byId = new Map<number, { en?: any; vi?: any }>();
    for (const r of rows) {
      const e = byId.get(r[t.fk]) ?? {};
      e[r.locale as "en" | "vi"] = r;
      byId.set(r[t.fk], e);
    }
    for (const [id, { en, vi }] of byId) {
      if (!en) continue;
      for (const [col, [hint]] of Object.entries(t.cols)) {
        if (isBlank(en[col])) continue;
        items.push({
          key: `${t.kind}:${id}.${col}`,
          hint,
          en: String(en[col]),
          vi: isBlank(vi?.[col]) ? "" : String(vi[col]),
        });
      }
    }
  }
  return items;
}

// ------------------------------------------------------------------ configs

interface LeafRef {
  path: string[];
  hint: string;
  value: unknown;
}

/** Same traversal rules as `walkFields` in src/lib/localized-config.ts, but
 *  records the path of every `localized: true` leaf. */
function collectLeaves(
  obj: any,
  fields: FieldType[],
  prefix: string[],
  out: LeafRef[],
) {
  if (obj == null || typeof obj !== "object") return;
  for (const field of fields as any[]) {
    const val = obj[field.key];
    if (val === undefined) continue;
    const path = [...prefix, field.key];
    if (isLocalizedField(field)) {
      out.push({ path, hint: field.label || field.key, value: val });
    } else if (field.type === "object") {
      collectLeaves(val, field.fields, path, out);
    } else if (
      field.type === "array" &&
      Array.isArray(val) &&
      field.itemType?.type === "object"
    ) {
      val.forEach((item: any, i: number) =>
        collectLeaves(item, field.itemType.fields, [...path, String(i)], out),
      );
    }
  }
}

function configLeaves(configKey: string, value: any): LeafRef[] {
  const out: LeafRef[] = [];
  for (const section of uiMeta[configKey] ?? []) {
    if (value?.[section.key] === undefined) continue;
    collectLeaves(value[section.key], section.fields, [section.key], out);
  }
  return out;
}

export async function fetchUiConfigs(sql: Sql, schema: string) {
  return (await sql<{ key: string; value: any }[]>`
    SELECT key, value FROM ${sql(schema)}.configs WHERE config_type = 'ui'
  `) as unknown as { key: string; value: any }[];
}

export function collectConfigItems(
  rows: { key: string; value: any }[],
): Item[] {
  const items: Item[] = [];
  for (const row of rows) {
    for (const leaf of configLeaves(row.key, row.value)) {
      const norm = normalizeLocalized(leaf.value);
      if (isBlank(norm.en)) continue;
      items.push({
        key: `config:${row.key}:${leaf.path.join(".")}`,
        hint: `website UI text — ${row.key} / ${leaf.hint}`,
        en: String(norm.en),
        vi: isBlank(norm.vi) ? "" : String(norm.vi),
      });
    }
  }
  return items;
}

/**
 * Returns a deep copy of `value` where every localized leaf that has a
 * translation in `vi` and an empty `vi` gets filled. Never overwrites a
 * non-empty `vi`. `filled` counts the leaves changed.
 */
export function fillConfigValue(
  configKey: string,
  value: any,
  vi: Record<string, string>,
): { value: any; filled: number } {
  const next = JSON.parse(JSON.stringify(value));
  let filled = 0;
  for (const leaf of configLeaves(configKey, next)) {
    const tr = vi[`config:${configKey}:${leaf.path.join(".")}`];
    if (isBlank(tr)) continue;
    const norm = normalizeLocalized(leaf.value);
    if (!isBlank(norm.vi)) continue;
    // walk to the parent and replace the leaf
    let parent = next;
    for (const p of leaf.path.slice(0, -1)) parent = parent[p];
    parent[leaf.path[leaf.path.length - 1]] = { ...norm, vi: tr };
    filled++;
  }
  return { value: next, filled };
}

// ------------------------------------------------------------------- misc

export async function collectAllItems(sql: Sql, schema: string) {
  const configs = await fetchUiConfigs(sql, schema);
  return {
    configs,
    items: [
      ...(await collectEntityItems(sql, schema)),
      ...collectConfigItems(configs),
    ],
  };
}

export async function assertTablesExist(sql: Sql, schema: string) {
  const need = [...ENTITY_TABLES.map((t) => t.table), "configs"];
  const found = await sql<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_name = ANY(${need})
  `;
  const have = new Set(found.map((r) => r.table_name));
  const missing = need.filter((t) => !have.has(t));
  if (missing.length) {
    throw new Error(
      `missing table(s) in schema "${schema}": ${missing.join(", ")}`,
    );
  }
}

export function maxLen(key: string): number {
  const m = /^(product|category|addon):\d+\.(\w+)$/.exec(key);
  if (!m) return 0;
  const t = ENTITY_TABLES.find((x) => x.kind === m[1])!;
  return t.cols[m[2]]?.[1] ?? 0;
}
