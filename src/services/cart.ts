import { getDb } from "@/db/drizzle";
import { productAddons, productImages } from "@/db/schemas";
import { ProductAddOnDB, WebProduct } from "@/types/products";
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

export async function getCartProductsByIds(ids: number[]): Promise<
  (Pick<
    WebProduct,
    "id" | "category" | "imageUrl" | "price" | "slug" | "title"
  > & {
    addons: Pick<ProductAddOnDB, "id" | "name" | "price">[];
  })[]
> {
  if (!ids.length) return []; // Tránh query không cần thiết

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
      },
    },
  });

  return productList.map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    imageUrl: product.images[0]?.url || "",
    category: product.category?.name || "",
    addons: product.addons,
  }));
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
