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
  const staticTags = REVALIDATION_MAP[action];
  staticTags.forEach((tag) => {
    revalidateTag(tag, "default");
  });

  // Revalidate dynamic tags nếu có params
  if (params) {
    if (params.productSlug) {
      revalidateTag(CACHE_TAGS.PRODUCTS.BY_SLUG(params.productSlug), "default");
    }
    if (params.productId) {
      revalidateTag(
        CACHE_TAGS.PRODUCTS.BY_SLUG(`id:${params.productId}`),
        "default",
      );
    }
    if (params.categoryId) {
      revalidateTag(
        CACHE_TAGS.PRODUCTS.BY_CATEGORY(params.categoryId),
        "default",
      );
    }
    if (params.configKey) {
      revalidateTag(CACHE_TAGS.CONFIGS.BY_KEY(params.configKey), "default");
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
    revalidateTag(
      CACHE_TAGS.PRODUCTS.BY_CATEGORY(params.oldCategoryId),
      "default",
    );
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
