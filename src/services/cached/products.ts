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
import type { Locale } from "@/types/configs";
import { applyPricing, applyPricingOne } from "@/services/pricing-apply";

/**
 * ✅ CACHED: Get products by category slug
 * Dùng cho: Menu page - /menu/[categorySlug]
 * Cache key theo locale (mỗi locale 1 entry), tag GIỮ NGUYÊN (không kèm
 * locale) để 1 lần revalidate xoá cache của mọi locale (RULE-10).
 */
const getProductsByCategorySlugCachedRaw = createDynamicCachedFunction(
  getProductsByCategorySlug,
  (categorySlug: string, locale: Locale) => [
    "products",
    "category",
    categorySlug,
    locale,
  ],
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
const getProductBySlugCachedRaw = createDynamicCachedFunction(
  getProductBySlug,
  (slug: string, locale: Locale) => ["products", "card", slug, locale],
  (slug: string) => [CACHE_TAGS.PRODUCTS.BY_SLUG(slug)],
);

/**
 * ✅ CACHED: Get product details by slug
 * Dùng cho: Product detail page - /dish/[slug]
 */
const getProductDetailsBySlugCachedRaw = createDynamicCachedFunction(
  getProductDetailsBySlug,
  (slug: string, locale: Locale) => ["products", "details", slug, locale],
  (slug: string) => [CACHE_TAGS.PRODUCTS.BY_SLUG(slug)],
);

/**
 * ✅ CACHED: Get related products (multiple products by IDs)
 * Dùng cho: Related products section
 */
const getRelatedProductsCachedRaw = createDynamicCachedFunction(
  getMultipleProductsByIds,
  (ids: number[], locale: Locale) => [
    "products",
    "related",
    ...ids.sort().map(String),
    locale,
  ],
  () => {
    // Related products cần revalidate khi bất kỳ product nào thay đổi
    return [CACHE_TAGS.PRODUCTS.ALL];
  },
);

/**
 * ✅ CACHED: Get product details for quick cart modal
 * Dùng cho: Quick cart modal/drawer
 */
const getProductDetailsForQuickCartByIdCachedRaw =
  createDynamicCachedFunction(
    getProductDetailsForQuickCartById,
    (id: number, locale: Locale) => [
      "products",
      "quick-cart",
      id.toString(),
      locale,
    ],
    (id: number) => [CACHE_TAGS.PRODUCTS.BY_SLUG(`id:${id}`)],
  );

/* ------------------------------------------------------------------ */
/* Giá theo khung giờ: cache chỉ giữ GIÁ GỐC, giá hiệu lực áp SAU cache  */
/* tại thời điểm request (Data Cache không được chứa dữ liệu theo giờ).  */
/* ------------------------------------------------------------------ */

export const getProductsByCategorySlugCached = async (
  categorySlug: string,
  locale: Locale,
) => applyPricing(await getProductsByCategorySlugCachedRaw(categorySlug, locale));

export const getProductBySlugCached = async (slug: string, locale: Locale) =>
  applyPricingOne(await getProductBySlugCachedRaw(slug, locale));

export const getProductDetailsBySlugCached = async (slug: string, locale: Locale) =>
  applyPricingOne(await getProductDetailsBySlugCachedRaw(slug, locale));

export const getRelatedProductsCached = async (ids: number[], locale: Locale) =>
  applyPricing(await getRelatedProductsCachedRaw(ids, locale));

export const getProductDetailsForQuickCartByIdCached = async (
  id: number,
  locale: Locale,
) => applyPricingOne(await getProductDetailsForQuickCartByIdCachedRaw(id, locale));
