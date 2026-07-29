/**
 * Cache Tags Constants
 *
 * Tag structure: <domain>:<entity>:<scope>:<identifier>
 * Examples:
 * - products:all
 * - products:item:123
 * - products:category:456
 * - configs:ui:layout
 *
 * QUY ƯỚC CACHE:
 * - ✅ Cache: User-facing services (menu, product detail, configs)
 * - ❌ Không cache: Admin services, cart validation
 */

export const CACHE_TAGS = {
  // ==================== USER-FACING (CẦN CACHE) ====================

  // Products (User-facing)
  PRODUCTS: {
    ALL: "products:all", // getProducts() - Menu all products
    BY_SLUG: (slug: string) => `products:slug:${slug}`, // getProductBySlug() - Product detail
    BY_CATEGORY: (categoryId: number) => `products:category:${categoryId}`, // getProductsByCategory() - Menu by category
    RELATED: (productId: number) => `products:related:${productId}`, // getRelatedProducts() - Related products
  },

  // Configs (User-facing)
  CONFIGS: {
    BY_KEY: (key: string) => `configs:${key}`, // getConfig(key) - Specific config by key
  },

  // ==================== KHÔNG CACHE ====================
  // Admin services không cache - luôn fetch real-time
  // Cart validation không cache - luôn check real-time
} as const;
