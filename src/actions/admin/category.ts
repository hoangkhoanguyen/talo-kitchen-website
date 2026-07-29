"use server";
import {
  addProductCategory,
  updateProductCategory,
  isExistingCategorySlug,
  isExistingCategoryName,
} from "@/services/products";
import { verifyAdminAuthSimple } from "@/services/auth";
import { NewProductCategoryDB } from "@/types/products";
import { revalidateCategoryUpdate } from "@/lib/revalidate";

export async function addProductCategoryAction(data: NewProductCategoryDB) {
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

    // Kiểm tra slug trùng lặp
    const isSlugExists = await isExistingCategorySlug(data.slug);
    if (isSlugExists) {
      return {
        success: false,
        error: "Đường dẫn đã tồn tại",
        code: "DUPLICATE_SLUG",
      };
    }

    // Kiểm tra name trùng lặp
    const isNameExists = await isExistingCategoryName(data.name);
    if (isNameExists) {
      return {
        success: false,
        error: "Tên danh mục đã tồn tại",
        code: "DUPLICATE_NAME",
      };
    }

    const newCategory = await addProductCategory(data);

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
  data: Partial<NewProductCategoryDB>,
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

    // Kiểm tra slug trùng lặp (nếu có update slug)
    if (data.slug) {
      const isSlugExists = await isExistingCategorySlug(data.slug, id);
      if (isSlugExists) {
        return {
          success: false,
          error: "Đường dẫn đã tồn tại",
          code: "DUPLICATE_SLUG",
        };
      }
    }

    // Kiểm tra name trùng lặp (nếu có update name)
    if (data.name) {
      const isNameExists = await isExistingCategoryName(data.name, id);
      if (isNameExists) {
        return {
          success: false,
          error: "Tên danh mục đã tồn tại",
          code: "DUPLICATE_NAME",
        };
      }
    }

    const updatedCategory = await updateProductCategory(id, data);

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
