import { DB, getDb } from "@/db/drizzle";
import {
  productAddonTranslations,
  productCategoryTranslations,
  productTranslations,
} from "@/db/schemas";
import type {
  ProductAddonTranslationDB,
  ProductCategoryTranslationDB,
  ProductTranslationDB,
} from "@/types/products";
import type { Locale } from "@/types/configs";
import { sql } from "drizzle-orm";

/**
 * In-memory resolvers + tx-scoped upsert helpers shared by product/category/
 * addon services (design §4, §8 RULE-07/12). Pure, locale-agnostic (RULE-20):
 * caller passes whatever `locale` it needs resolved — no hardcoded "en"/"vi".
 *
 * COALESCE semantics (RULE-07 / EC-01..04): per FIELD, not per row.
 *   resolved.field = translationRow?.field || base.field
 * A translation row can exist for the locale but still fall back field-by-field
 * when that particular field is empty/null/"" on the translation side.
 */

// ---------------------------------------------------------------------------
// Resolvers
// ---------------------------------------------------------------------------

function findTranslation<T extends { locale: string }>(
  translations: T[] | undefined | null,
  locale: Locale,
): T | undefined {
  if (!translations || translations.length === 0) return undefined;
  return translations.find((t) => t.locale === locale);
}

export interface ResolvedProductFields {
  title: string;
  description: string | null;
  subDescription: string | null;
  allergenInfo: string | null;
}

/**
 * Resolve product-level translatable fields (title/description/subDescription/
 * allergenInfo) for `locale`, COALESCE-ing per-field onto `base` (the row from
 * the main `products` table, or any object shaped like it).
 *
 * - Missing translation row for `locale` → fallback entirely to `base` (EC-02/EC-05/EC-15).
 * - Translation row present but a given field is `""`/`null`/`undefined` →
 *   that field falls back to `base`, other fields keep the translated value (EC-03).
 * - Both translation and base empty for a field → `""` (title, always-string) or
 *   `null` (nullable fields), never throws (EC-04).
 */
export function resolveProductFields<
  Base extends {
    title: string;
    description: string | null;
    subDescription: string | null;
    allergenInfo: string | null;
  },
>(
  base: Base,
  translations: Pick<
    ProductTranslationDB,
    "locale" | "title" | "description" | "subDescription" | "allergenInfo"
  >[] = [],
  locale: Locale,
): ResolvedProductFields {
  const translation = findTranslation(translations, locale);

  return {
    title: translation?.title || base.title || "",
    description: translation?.description || base.description || null,
    subDescription:
      translation?.subDescription || base.subDescription || null,
    allergenInfo: translation?.allergenInfo || base.allergenInfo || null,
  };
}

export interface ResolvedCategoryFields {
  name: string;
  description: string | null;
}

/**
 * Resolve category-level translatable fields (name/description) for `locale`.
 * Same per-field COALESCE semantics as `resolveProductFields` (EC-06).
 */
export function resolveCategoryFields<
  Base extends { name: string; description: string | null },
>(
  base: Base,
  translations: Pick<
    ProductCategoryTranslationDB,
    "locale" | "name" | "description"
  >[] = [],
  locale: Locale,
): ResolvedCategoryFields {
  const translation = findTranslation(translations, locale);

  return {
    name: translation?.name || base.name || "",
    description: translation?.description || base.description || null,
  };
}

/**
 * Resolve the addon translatable field (name) for `locale`. Returns just the
 * resolved field — caller spreads it over the base addon object (design §4).
 */
export function resolveAddon<Base extends { name: string }>(
  base: Base,
  translations: Pick<ProductAddonTranslationDB, "locale" | "name">[] = [],
  locale: Locale,
): { name: string } {
  const translation = findTranslation(translations, locale);

  return {
    name: translation?.name || base.name || "",
  };
}

// ---------------------------------------------------------------------------
// Upsert (tx-scoped, RULE-12)
// ---------------------------------------------------------------------------

export type ProductTranslationUpsertRecord = Partial<
  Record<
    Locale,
    {
      title: string;
      description?: string | null;
      subDescription?: string | null;
      allergenInfo?: string | null;
    }
  >
>;

export type CategoryTranslationUpsertRecord = Partial<
  Record<Locale, { name: string; description?: string | null }>
>;

export type AddonTranslationUpsertRecord = Partial<
  Record<Locale, { name: string }>
>;

/**
 * Upsert one row per locale key present in `record` for a product
 * (`INSERT ... ON CONFLICT (product_id, locale) DO UPDATE`, idempotent thanks
 * to the UNIQUE(product_id, locale) constraint). Runs inside an existing
 * transaction when `tx` is provided (RULE-12).
 */
export async function upsertProductTranslations(
  productId: number,
  record: ProductTranslationUpsertRecord,
  tx?: DB,
) {
  const executor = tx ?? getDb();
  const locales = Object.keys(record) as Locale[];
  if (locales.length === 0) return [];

  const values = locales.map((locale) => {
    const fields = record[locale]!;
    return {
      productId,
      locale,
      title: fields.title ?? null,
      description: fields.description ?? null,
      subDescription: fields.subDescription ?? null,
      allergenInfo: fields.allergenInfo ?? null,
    };
  });

  return executor
    .insert(productTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [productTranslations.productId, productTranslations.locale],
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        subDescription: sql`excluded.sub_description`,
        allergenInfo: sql`excluded.allergen_info`,
        updatedAt: new Date(),
      },
    })
    .returning();
}

/**
 * Upsert one row per locale key present in `record` for a category
 * (`INSERT ... ON CONFLICT (category_id, locale) DO UPDATE`).
 */
export async function upsertCategoryTranslations(
  categoryId: number,
  record: CategoryTranslationUpsertRecord,
  tx?: DB,
) {
  const executor = tx ?? getDb();
  const locales = Object.keys(record) as Locale[];
  if (locales.length === 0) return [];

  const values = locales.map((locale) => {
    const fields = record[locale]!;
    return {
      categoryId,
      locale,
      name: fields.name ?? null,
      description: fields.description ?? null,
    };
  });

  return executor
    .insert(productCategoryTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [
        productCategoryTranslations.categoryId,
        productCategoryTranslations.locale,
      ],
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        updatedAt: new Date(),
      },
    })
    .returning();
}

/**
 * Upsert one row per locale key present in `record` for an addon
 * (`INSERT ... ON CONFLICT (addon_id, locale) DO UPDATE`).
 */
export async function upsertAddonTranslations(
  addonId: number,
  record: AddonTranslationUpsertRecord,
  tx?: DB,
) {
  const executor = tx ?? getDb();
  const locales = Object.keys(record) as Locale[];
  if (locales.length === 0) return [];

  const values = locales.map((locale) => {
    const fields = record[locale]!;
    return {
      addonId,
      locale,
      name: fields.name ?? null,
    };
  });

  return executor
    .insert(productAddonTranslations)
    .values(values)
    .onConflictDoUpdate({
      target: [
        productAddonTranslations.addonId,
        productAddonTranslations.locale,
      ],
      set: {
        name: sql`excluded.name`,
        updatedAt: new Date(),
      },
    })
    .returning();
}
