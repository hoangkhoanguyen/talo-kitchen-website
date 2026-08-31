import { getDb } from "@/db/drizzle";
import { productAddons, productImages } from "@/db/schemas";
import { ProductAddOnDB, WebProduct } from "@/types/products";
import type { Locale } from "@/types/configs";
import { resolveLocale } from "@/lib/locale";
import {
  resolveAddon,
  resolveCategoryFields,
  resolveProductFields,
} from "@/services/products/translations";
import { asc } from "drizzle-orm";
// Disabled cache imports - using direct DB calls now
// import { createDynamicCachedFunction } from "@/lib/cache-utils";
// import { CACHE_TAGS } from "@/constants/cache";

export async function checkCartLength({
  productIds,
}: {
  productIds: number[];
}) {
  if (!productIds.length) return 0; // Tránh query không cần thiết
  const db = getDb();
  const products = await db.query.products.findMany({
    where(fields, operators) {
      return operators.and(
        operators.inArray(fields.id, productIds),
        operators.eq(fields.isActive, true),
      );
    },
    columns: { id: true },
  });

  const validProductIds = new Set(products.map((p) => p.id));
  const count = productIds.filter((id) => validProductIds.has(id)).length;
  return count;
}

export async function getCartProductsByIds(
  ids: number[],
  locale: Locale,
): Promise<
  (Pick<
    WebProduct,
    "id" | "category" | "imageUrl" | "price" | "slug" | "title"
  > & {
    addons: Pick<ProductAddOnDB, "id" | "name" | "price">[];
  })[]
> {
  if (!ids.length) return []; // Tránh query không cần thiết

  // Defensive guard at the service boundary (EC-15): callers should already
  // resolve locale (server action / hooks), but sanitize here too.
  const resolvedLocale = resolveLocale(locale);

  const db = getDb();

  const productList = await db.query.products.findMany({
    where(fields, { and, eq, inArray }) {
      return and(eq(fields.isActive, true), inArray(fields.id, ids));
    },
    columns: {
      id: true,
      title: true,
      price: true,
      slug: true,
    },
    with: {
      translations: {
        where(fields, { eq }) {
          return eq(fields.locale, resolvedLocale);
        },
        columns: {
          locale: true,
          title: true,
          description: true,
          subDescription: true,
          allergenInfo: true,
        },
      },
      images: {
        columns: {
          url: true,
          altText: true,
        },
        orderBy: [asc(productImages.sortOrder)],
        limit: 1,
      },
      category: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
        with: {
          translations: {
            where(fields, { eq }) {
              return eq(fields.locale, resolvedLocale);
            },
            columns: {
              locale: true,
              name: true,
              description: true,
            },
          },
        },
      },
      addons: {
        where(fields, operators) {
          const { eq } = operators;
          return eq(fields.isActive, true);
        },
        orderBy: [asc(productAddons.sortOrder)],
        columns: {
          id: true,
          name: true,
          price: true,
        },
        with: {
          translations: {
            where(fields, { eq }) {
              return eq(fields.locale, resolvedLocale);
            },
            columns: {
              locale: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return productList.map((product) => {
    const { title } = resolveProductFields(
      {
        title: product.title,
        description: null,
        subDescription: null,
        allergenInfo: null,
      },
      product.translations,
      resolvedLocale,
    );

    const categoryName = product.category
      ? resolveCategoryFields(
          { name: product.category.name, description: null },
          product.category.translations,
          resolvedLocale,
        ).name
      : "";

    return {
      id: product.id,
      slug: product.slug,
      title,
      price: product.price,
      imageUrl: product.images[0]?.url || "",
      category: categoryName,
      addons: product.addons.map((addon) => ({
        ...addon,
        ...resolveAddon(addon, addon.translations, resolvedLocale),
      })),
    };
  });
}

// ==================== CACHED VERSIONS (DISABLED) ====================
// Note: These cached functions are disabled to simplify the system
// All functions now use direct database calls for real-time data

/*
export const getCartProductsByIdsCached = createDynamicCachedFunction(
  getCartProductsByIds,
  (ids) => ["cart", "products", ids.sort().join(",")],
  () => [CACHE_TAGS.PRODUCTS.ALL, CACHE_TAGS.CATEGORIES.ALL],
);
*/
