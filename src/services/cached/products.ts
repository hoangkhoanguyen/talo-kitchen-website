/**
 * Cached Product Services
 *
 * Services này được cache để phục vụ user-facing pages
 * Admin services KHÔNG cache, luôn fetch real-time
 */

import { CACHE_TAGS } from "@/constants/cache";
import { createDynamicCachedFunction } from "@/lib/cache";
import {
  getProductsByCategorySlug,
  getProductDetailsBySlug,
  getProductBySlug,
  getMultipleProductsByIds,
  getProductDetailsForQuickCartById,
} from "@/services/products";

/**
 * ✅ CACHED: Get products by category slug
 * Dùng cho: Menu page - /menu/[categorySlug]
 */
export const getProductsByCategorySlugCached = createDynamicCachedFunction(
  getProductsByCategorySlug,
  (categorySlug: string) => ["products", "category", categorySlug],
  (categorySlug: string) => {
    // Nếu là "all" thì dùng tag ALL, còn không dùng tag BY_CATEGORY
    if (categorySlug === "all") {
      return [CACHE_TAGS.PRODUCTS.ALL];
    }
    // Note: Cần categoryId để tạo tag chính xác, nhưng ở đây chỉ có slug
    // Workaround: Dùng ALL tag và revalidate khi category thay đổi
    return [CACHE_TAGS.PRODUCTS.ALL];
  },
);

/**
 * ✅ CACHED: Get product by slug (for card display)
 * Dùng cho: Product card display
 */
export const getProductBySlugCached = createDynamicCachedFunction(
  getProductBySlug,
  (slug: string) => ["products", "card", slug],
  (slug: string) => [CACHE_TAGS.PRODUCTS.BY_SLUG(slug)],
);

/**
 * ✅ CACHED: Get product details by slug
 * Dùng cho: Product detail page - /dish/[slug]
 */
export const getProductDetailsBySlugCached = createDynamicCachedFunction(
  getProductDetailsBySlug,
  (slug: string) => ["products", "details", slug],
  (slug: string) => [CACHE_TAGS.PRODUCTS.BY_SLUG(slug)],
);

/**
 * ✅ CACHED: Get related products (multiple products by IDs)
 * Dùng cho: Related products section
 */
export const getRelatedProductsCached = createDynamicCachedFunction(
  getMultipleProductsByIds,
  (ids: number[]) => ["products", "related", ...ids.sort().map(String)],
  () => {
    // Related products cần revalidate khi bất kỳ product nào thay đổi
    return [CACHE_TAGS.PRODUCTS.ALL];
  },
);

/**
 * ✅ CACHED: Get product details for quick cart modal
 * Dùng cho: Quick cart modal/drawer
 */
export const getProductDetailsForQuickCartByIdCached =
  createDynamicCachedFunction(
    getProductDetailsForQuickCartById,
    (id: number) => ["products", "quick-cart", id.toString()],
    (id: number) => [CACHE_TAGS.PRODUCTS.BY_SLUG(`id:${id}`)],
  );
