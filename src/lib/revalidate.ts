import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS, REVALIDATION_MAP } from "@/constants/cache";

/**
 * Revalidate Utilities
 *
 * Helper functions để revalidate cache khi có thay đổi dữ liệu
 */

/**
 * Revalidate cache theo action cụ thể
 * @param action - Action key từ REVALIDATION_MAP
 * @param params - Dynamic parameters để tạo tags
 */
export function revalidateByAction(
  action: keyof typeof REVALIDATION_MAP,
  params?: {
    productSlug?: string;
    productId?: number;
    categoryId?: number;
    configKey?: string;
  },
) {
  // Revalidate static tags từ REVALIDATION_MAP
  //
  // BUGFIX (found in sprint-2-config-i18n testing, blocks EC-11/AC-05.2/RULE-09
  // for the WHOLE app, not just configs): `revalidateTag(tag, "default")`
  // passed "default" as a cache-life *profile name*. This project does not
  // configure `cacheLifeProfiles` (no dynamicIO/cacheComponents in
  // next.config), so Next 16 can never resolve "default" to a real profile —
  // it silently falls into the soft/stale-while-revalidate branch instead of
  // the immediate-purge branch, so `unstable_cache`-tagged entries (products,
  // categories, configs) were NEVER actually invalidated after any admin
  // save. Passing an explicit `{ expire: 0 }` cache-life object (instead of a
  // profile name) makes Next take the immediate-purge branch unconditionally
  // (see next/dist/server/web/spec-extension/revalidate.js — `cacheLife.expire
  // === 0` short-circuits to `pathWasRevalidated =
  // ActionDidRevalidateStaticAndDynamic`), while staying within the typed
  // `revalidateTag(tag, profile: string | CacheLifeConfig)` API (no deprecated
  // single-arg call). Verified via a real admin save → /vi round trip in
  // tests/i18n/config-i18n-admin.spec.ts.
  const IMMEDIATE = { expire: 0 } as const;
  const staticTags = REVALIDATION_MAP[action];
  staticTags.forEach((tag) => {
    revalidateTag(tag, IMMEDIATE);
  });

  // Revalidate dynamic tags nếu có params
  if (params) {
    if (params.productSlug) {
      revalidateTag(CACHE_TAGS.PRODUCTS.BY_SLUG(params.productSlug), IMMEDIATE);
    }
    if (params.productId) {
      revalidateTag(
        CACHE_TAGS.PRODUCTS.BY_SLUG(`id:${params.productId}`),
        IMMEDIATE,
      );
    }
    if (params.categoryId) {
      revalidateTag(
        CACHE_TAGS.PRODUCTS.BY_CATEGORY(params.categoryId),
        IMMEDIATE,
      );
    }
    if (params.configKey) {
      revalidateTag(CACHE_TAGS.CONFIGS.BY_KEY(params.configKey), IMMEDIATE);
    }
  }
}

/**
 * Revalidate khi tạo product
 */
export function revalidateProductCreate(categoryId?: number) {
  revalidateByAction("PRODUCT_CREATE", { categoryId });
}

/**
 * Revalidate khi update product
 */
export function revalidateProductUpdate(params: {
  slug: string;
  productId: number;
  categoryId?: number;
  oldCategoryId?: number;
}) {
  revalidateByAction("PRODUCT_UPDATE", {
    productSlug: params.slug,
    productId: params.productId,
    categoryId: params.categoryId,
  });

  // Revalidate old category nếu đổi category
  if (params.oldCategoryId && params.oldCategoryId !== params.categoryId) {
    revalidateTag(CACHE_TAGS.PRODUCTS.BY_CATEGORY(params.oldCategoryId), {
      expire: 0,
    });
  }
}

/**
 * Revalidate khi update category
 */
export function revalidateCategoryUpdate(categoryId: number) {
  revalidateByAction("CATEGORY_UPDATE", { categoryId });
}

/**
 * Revalidate khi update config
 */
export function revalidateConfigUpdate(configKey: string) {
  revalidateByAction("CONFIG_UPDATE", { configKey });
}

/**
 * Revalidate khi upload/delete image
 */
export function revalidateImageChange(params: {
  slug?: string;
  productId: number;
  categoryId?: number;
}) {
  revalidateByAction("IMAGE_UPLOAD", {
    productSlug: params.slug,
    productId: params.productId,
    categoryId: params.categoryId,
  });
}

/**
 * Revalidate toàn bộ cache (dùng khi cần)
 */
export function revalidateAll() {
  revalidateByAction("FULL_REFRESH");
  revalidatePath("/", "layout");
}
