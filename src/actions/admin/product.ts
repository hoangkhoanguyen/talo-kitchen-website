"use server";
import { adminRoutes } from "@/constants/route";
import {
  createProduct,
  deleteProductImages,
  isExistingSlug,
  updateProductById,
  updateProductStatus,
  getAdminProductById,
} from "@/services/products";
import type {
  AddonTranslationUpsertRecord,
  ProductTranslationUpsertRecord,
} from "@/services/products/translations";
import { verifyAdminAuthSimple } from "@/services/auth";
import {
  AdminCreateProductForm,
  AdminEditProductForm,
  NewProductDB,
} from "@/types/products";
import type { Locale } from "@/types/configs";
import { routing } from "@/i18n/routing";
import { revalidatePath } from "next/cache";
import {
  revalidateProductCreate,
  revalidateProductUpdate,
  revalidateImageChange,
} from "@/lib/revalidate";

/**
 * Convert the zod-validated `translations` branch (en required, vi optional
 * fields per RULE-19) into the `Partial<Record<Locale, {...}>>` shape the
 * upsert service expects (TASK-07 / TASK-19).
 */
function toProductTranslationRecord(
  translations: AdminCreateProductForm["translations"],
): ProductTranslationUpsertRecord {
  const record: ProductTranslationUpsertRecord = {};

  (Object.keys(translations) as Locale[]).forEach((locale) => {
    const value = translations[locale];
    if (!value) return;

    record[locale] = {
      title: value.title ?? "",
      description: value.description ?? null,
      subDescription: value.subDescription ?? null,
      allergenInfo: value.allergenInfo ?? null,
    };
  });

  return record;
}

function toAddonTranslationRecord(
  translations: AdminEditProductForm["addons"][number]["translations"],
): AddonTranslationUpsertRecord {
  const record: AddonTranslationUpsertRecord = {};

  (Object.keys(translations) as Locale[]).forEach((locale) => {
    const value = translations[locale];
    if (!value) return;

    record[locale] = { name: value.name ?? "" };
  });

  return record;
}

export async function createProductAction(data: AdminCreateProductForm) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/products");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    const { translations, ...rest } = data;

    const isExisSlug = await isExistingSlug(rest.slug);

    if (isExisSlug) {
      return {
        success: false,
        error: "Đường dẫn đã tồn tại",
        code: "DUPLICATE_SLUG",
      };
    }

    // `title`/`description`/... are derived from `translations[defaultLocale]`
    // inside `createProduct` (TASK-07) — không duplicate ở đây.
    const newProduct = await createProduct(
      rest as NewProductDB,
      toProductTranslationRecord(translations),
    );

    // Revalidate cache
    revalidateProductCreate(newProduct.categoryId);

    return {
      success: true,
      data: { newProduct },
    };
  } catch (error) {
    console.log("Error creating product:", error);
    return {
      success: false,
      error: "Không thể tạo sản phẩm",
    };
  }
}

export async function deleteProductImagesAction(
  ids: number[],
  productId: number,
) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/products");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    // Lấy thông tin product để revalidate
    const product = await getAdminProductById(productId);
    if (!product) {
      return {
        success: false,
        error: "Sản phẩm không tồn tại",
        code: "PRODUCT_NOT_FOUND",
      };
    }

    await deleteProductImages(ids);

    // Revalidate cache (xóa image cũng làm thay đổi product)
    revalidateImageChange({
      slug: product.slug,
      productId: productId,
      categoryId: product.categoryId,
    });

    return {
      success: true,
      data: { deletedIds: ids },
    };
  } catch (error) {
    console.log("Error deleting product images:", error);
    return {
      success: false,
      error: "Không thể xóa hình ảnh sản phẩm",
    };
  }
}

export async function updateProductAction({
  data: { images, addons, relatedProducts, translations, ...rest },
  id,
}: {
  data: AdminEditProductForm;
  id: number;
}) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/products");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    // Lấy thông tin product cũ để revalidate
    const oldProduct = await getAdminProductById(id);

    // altText dùng title bản mặc định (en) — cột gốc `title` khớp translations[en]
    const defaultLocaleTitle =
      translations[routing.defaultLocale as Locale]?.title ?? "";

    const imagesWithOrder = images.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
      altText: defaultLocaleTitle,
    }));

    const addonsWithOrder = addons.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
      // `name` cột gốc addon lấy từ bản mặc định (en) — addProductAddons
      // không tự derive từ translations (không như product/category).
      name: item.translations[routing.defaultLocale as Locale]?.name ?? "",
    }));

    await updateProductById({
      id,
      productData: {
        ...rest,
        relatedProductIds: relatedProducts.map((item) => item.id),
      },
      translations: toProductTranslationRecord(translations),
      newAddons: addonsWithOrder
        .filter((item) => !item.id)
        .map(({ translations: addonTranslations, ...item }) => ({
          ...item,
          productId: id,
          translations: toAddonTranslationRecord(addonTranslations),
        })),
      oldAddons: addonsWithOrder
        .filter((item) => item.id)
        .map(({ translations: addonTranslations, ...item }) => ({
          ...item,
          id: item.id!,
          productId: id,
          translations: toAddonTranslationRecord(addonTranslations),
        })),
      newImages: imagesWithOrder
        .filter((item) => !item.id)
        .map((item) => ({
          ...item,
          productId: id,
        })),
      oldImages: imagesWithOrder
        .filter((item) => item.id)
        .map((item) => ({
          ...item,
          id: item.id!,
          productId: id,
        })),
    });

    revalidatePath(adminRoutes.product(id));

    // Revalidate cache
    revalidateProductUpdate({
      slug: rest.slug,
      productId: id,
      categoryId: rest.categoryId,
      oldCategoryId: oldProduct?.categoryId,
    });

    return {
      success: true,
      data: { id, message: "Cập nhật sản phẩm thành công" },
    };
  } catch (error) {
    console.log("Error updating product:", error);
    return {
      success: false,
      error: "Không thể cập nhật sản phẩm",
    };
  }
}

export async function updateProductStatusAction(id: number, isActive: boolean) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/products");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    // Lấy thông tin product trước khi update
    const product = await getAdminProductById(id);
    if (!product) {
      return {
        success: false,
        error: "Sản phẩm không tồn tại",
        code: "PRODUCT_NOT_FOUND",
      };
    }

    // Update product status
    const updatedProduct = await updateProductStatus(id, isActive);

    // Revalidate cache (status change cũng là update product)
    revalidateProductUpdate({
      slug: product.slug,
      productId: id,
      categoryId: product.categoryId,
    });

    return {
      success: true,
      data: {
        product: updatedProduct,
        message: isActive
          ? "Kích hoạt sản phẩm thành công"
          : "Vô hiệu hóa sản phẩm thành công",
      },
    };
  } catch (error) {
    console.log("Error updating product status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái sản phẩm",
    };
  }
}
