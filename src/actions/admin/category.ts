"use server";
import {
  addProductCategory,
  updateProductCategory,
  isExistingCategorySlug,
  isExistingCategoryName,
} from "@/services/products";
import type { CategoryTranslationUpsertRecord } from "@/services/products/translations";
import { verifyAdminAuthSimple } from "@/services/auth";
import {
  AdminCreateProductCategoryForm,
  NewProductCategoryDB,
} from "@/types/products";
import type { Locale } from "@/types/configs";
import { routing } from "@/i18n/routing";
import { revalidateCategoryUpdate } from "@/lib/revalidate";

/**
 * Convert the zod-validated `translations` branch (en required, vi optional
 * fields per RULE-19) into the `Partial<Record<Locale, {...}>>` shape the
 * upsert service expects (TASK-07 / TASK-19).
 */
function toCategoryTranslationRecord(
  translations: AdminCreateProductCategoryForm["translations"],
): CategoryTranslationUpsertRecord {
  const record: CategoryTranslationUpsertRecord = {};

  (Object.keys(translations) as Locale[]).forEach((locale) => {
    const value = translations[locale];
    if (!value) return;

    record[locale] = {
      name: value.name ?? "",
      description: value.description ?? null,
    };
  });

  return record;
}

export async function addProductCategoryAction(
  data: AdminCreateProductCategoryForm,
) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/categories");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    const { translations, ...rest } = data;
    const defaultLocaleName =
      translations[routing.defaultLocale as Locale]?.name ?? "";

    // Kiểm tra slug trùng lặp
    const isSlugExists = await isExistingCategorySlug(rest.slug);
    if (isSlugExists) {
      return {
        success: false,
        error: "Đường dẫn đã tồn tại",
        code: "DUPLICATE_SLUG",
      };
    }

    // Kiểm tra name trùng lặp
    const isNameExists = await isExistingCategoryName(defaultLocaleName);
    if (isNameExists) {
      return {
        success: false,
        error: "Tên danh mục đã tồn tại",
        code: "DUPLICATE_NAME",
      };
    }

    // `name`/`description` cột gốc được `addProductCategory` (TASK-07) tự
    // derive từ `translations[defaultLocale]` — không duplicate ở đây.
    const newCategory = await addProductCategory(
      rest as NewProductCategoryDB,
      toCategoryTranslationRecord(translations),
    );

    return {
      success: true,
      data: { newCategory },
    };
  } catch (error) {
    console.log("Error creating category:", error);
    return {
      success: false,
      error: "Không thể tạo danh mục",
    };
  }
}

export async function updateProductCategoryAction(
  id: number,
  data: Partial<NewProductCategoryDB> & {
    translations?: CategoryTranslationUpsertRecord;
  },
) {
  try {
    // Xác thực token trước khi thực hiện action
    const authResult = await verifyAdminAuthSimple("/admin/categories");
    if (!authResult.isValid) {
      return {
        success: false,
        error: "Không có quyền truy cập",
        code: "UNAUTHORIZED",
      };
    }

    const { translations, ...rest } = data;

    // Kiểm tra slug trùng lặp (nếu có update slug)
    if (rest.slug) {
      const isSlugExists = await isExistingCategorySlug(rest.slug, id);
      if (isSlugExists) {
        return {
          success: false,
          error: "Đường dẫn đã tồn tại",
          code: "DUPLICATE_SLUG",
        };
      }
    }

    const defaultLocaleName = translations?.[routing.defaultLocale as Locale]
      ?.name;

    // Kiểm tra name trùng lặp (nếu có update name)
    if (defaultLocaleName) {
      const isNameExists = await isExistingCategoryName(
        defaultLocaleName,
        id,
      );
      if (isNameExists) {
        return {
          success: false,
          error: "Tên danh mục đã tồn tại",
          code: "DUPLICATE_NAME",
        };
      }
    }

    const updatedCategory = await updateProductCategory(
      id,
      rest,
      translations ?? {},
    );

    // Revalidate cache
    revalidateCategoryUpdate(id);

    return {
      success: true,
      data: { updatedCategory },
    };
  } catch (error) {
    console.log("Error updating category:", error);
    return {
      success: false,
      error: "Không thể cập nhật danh mục",
    };
  }
}
