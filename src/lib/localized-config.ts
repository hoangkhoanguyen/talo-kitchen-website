import { routing } from "@/i18n/routing";
import type { Config, LocalizedText, Locale } from "@/types/configs";
import type { FieldType, MetaValue } from "@/types/settings";

/**
 * Pure helpers for resolving/migrating localized text fields inside a Config.
 * NOTE: no `server-only` import here — must be importable from both a
 * standalone tsx script and from Next server code.
 */

export function isLocalizedField(field: FieldType): boolean {
  return (
    (field.type === "text" || field.type === "textarea") &&
    field.localized === true
  );
}

export function normalizeLocalized(v: unknown): LocalizedText {
  if (typeof v === "string") {
    return { [routing.defaultLocale]: v } as LocalizedText;
  }
  if (v == null) {
    return {};
  }
  if (typeof v === "object" && !Array.isArray(v)) {
    return v as LocalizedText;
  }
  // anything else unexpected (number, boolean, array, ...) → defensive fallback
  return {};
}

export function resolveLocalizedString(v: unknown, locale: Locale): string {
  const norm = normalizeLocalized(v);
  const localized = norm[locale];
  if (typeof localized === "string" && localized !== "") {
    return localized;
  }
  const fallback = norm[routing.defaultLocale as Locale];
  if (typeof fallback === "string" && fallback !== "") {
    return fallback;
  }
  return "";
}

/**
 * Core generic traversal shared by resolve and migrate. `transformLeaf` is a
 * closure that already captures whatever context (e.g. locale) it needs, so
 * this function itself stays context-free.
 */
export function walkFields(
  obj: any,
  fields: FieldType[],
  transformLeaf: (val: unknown) => unknown
): any {
  if (obj == null || typeof obj !== "object") {
    // EC-12: nested branch missing → keep as-is
    return obj;
  }

  const result: any = { ...obj };

  for (const field of fields) {
    const val = obj[field.key];
    if (val === undefined) continue;

    if (isLocalizedField(field)) {
      result[field.key] = transformLeaf(val);
    } else if (field.type === "object") {
      result[field.key] = walkFields(val, field.fields, transformLeaf);
    } else if (field.type === "array" && Array.isArray(val)) {
      const itemType = field.itemType;
      if (itemType.type === "object") {
        // EC-07/EC-08: walk actual items, not meta length/index
        const itemFields = itemType.fields;
        result[field.key] = val.map((item: any) =>
          walkFields(item, itemFields, transformLeaf)
        );
      }
      // itemType 'image' or other → leave val as-is (don't touch)
    }
    // everything else (number/boolean/image/select/slug/array whose itemType
    // isn't object) → keep val unchanged (RULE-03)
  }

  return result;
}

export function resolveFields(
  obj: any,
  fields: FieldType[],
  locale: Locale
): any {
  return walkFields(obj, fields, (val) => resolveLocalizedString(val, locale));
}

export function resolveConfig(
  value: Config,
  sections: MetaValue[],
  locale: Locale
): Config {
  const result: Config = { ...value };
  for (const section of sections) {
    if (value[section.key] !== undefined) {
      result[section.key] = resolveFields(
        value[section.key],
        section.fields,
        locale
      );
    }
  }
  return result;
}

export function migrateLocalized(v: unknown): LocalizedText {
  const norm = normalizeLocalized(v);
  const result: LocalizedText = {};
  for (const locale of routing.locales) {
    result[locale] =
      norm[locale] ??
      (locale === routing.defaultLocale
        ? norm[routing.defaultLocale as Locale] ?? ""
        : "");
  }
  return result;
}

export function migrateFields(obj: any, fields: FieldType[]): any {
  return walkFields(obj, fields, migrateLocalized);
}

export function migrateConfig(value: Config, sections: MetaValue[]): Config {
  const result: Config = { ...value };
  for (const section of sections) {
    if (value[section.key] !== undefined) {
      result[section.key] = migrateFields(value[section.key], section.fields);
    }
  }
  return result;
}
