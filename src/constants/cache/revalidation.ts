import { CACHE_TAGS } from "./tags";

/**
 * Revalidation Strategy Map
 *
 * Định nghĩa các tags cần được revalidate khi có thay đổi dữ liệu
 * theo từng action cụ thể
 *
 * QUY ƯỚC:
 * - Chỉ revalidate cache phía User (Admin không cache)
 * - Revalidate theo business logic trong REVALIDATION_IMPACT_ANALYSIS.md
 */

export const REVALIDATION_MAP = {
  // ==================== PRODUCT ACTIONS ====================

  /**
   * CREATE PRODUCT
   * Ảnh hưởng:
   * - Menu category tương ứng
   * - Menu "All products"
   */
  PRODUCT_CREATE: [
    CACHE_TAGS.PRODUCTS.ALL, // Menu all products
    // Note: BY_CATEGORY sẽ được revalidate động dựa vào categoryId
  ],

  /**
   * UPDATE PRODUCT (bao gồm cả status change)
   * Ảnh hưởng:
   * - Product detail page
   * - Menu category hiện tại/mới/cũ
   * - Menu "All products"
   * - Related products
   */
  PRODUCT_UPDATE: [
    CACHE_TAGS.PRODUCTS.ALL, // Menu all products
    // Note: BY_SLUG, BY_CATEGORY, RELATED sẽ được revalidate động
  ],

  // ==================== CATEGORY ACTIONS ====================

  /**
   * UPDATE CATEGORY
   * Ảnh hưởng:
   * - Menu category page (nếu có)
   * - All products trong category
   * Note: Menu navigation dùng configs, không dùng DB categories
   */
  CATEGORY_UPDATE: [
    CACHE_TAGS.PRODUCTS.ALL, // Products in category might change
    // Note: BY_CATEGORY sẽ được revalidate động
  ],

  // ==================== ORDER ACTIONS ====================
  // Orders KHÔNG ảnh hưởng đến user-facing cache
  // Admin không cache nên không cần revalidate

  // ==================== CONFIG ACTIONS ====================

  /**
   * UPDATE CONFIGS
   * Ảnh hưởng:
   * - Config key cụ thể được update
   * Note: BY_KEY sẽ được revalidate động dựa vào config key
   */
  CONFIG_UPDATE: [
    // Note: CONFIGS.BY_KEY(key) sẽ được revalidate động
  ],

  // ==================== IMAGE ACTIONS ====================

  /**
   * UPLOAD/DELETE PRODUCT IMAGE
   * Ảnh hưởng:
   * - Product detail page
   * - Menu category của product
   * - Menu "All products"
   * - Related products
   */
  IMAGE_UPLOAD: [
    CACHE_TAGS.PRODUCTS.ALL,
    // Note: BY_SLUG, BY_CATEGORY, RELATED sẽ được revalidate động
  ],

  IMAGE_DELETE: [
    CACHE_TAGS.PRODUCTS.ALL,
    // Note: BY_SLUG, BY_CATEGORY, RELATED sẽ được revalidate động
  ],

  // ==================== RESERVATION ACTIONS ====================
  // Reservations KHÔNG ảnh hưởng đến user-facing cache
  // Admin không cache nên không cần revalidate

  // ==================== SPECIAL CASES ====================

  /**
   * FULL REFRESH - Revalidate tất cả cache
   */
  FULL_REFRESH: [
    CACHE_TAGS.PRODUCTS.ALL,
    // Note: Configs sẽ được revalidate theo từng key cụ thể
  ],
} as const;

export type RevalidationAction = keyof typeof REVALIDATION_MAP;
