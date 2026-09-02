import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductCategoryAction } from "@/actions/admin/category";
import { AdminCreateProductCategoryForm, NewProductCategoryDB } from "@/types/products";
import type { CategoryTranslationUpsertRecord } from "@/services/products/translations";
import type { Locale } from "@/types/configs";
import { toast } from "sonner";
import { handleServerActionError } from "@/lib/handle-server-action-error";

interface UpdateCategoryParams {
  id: number;
  data: Partial<NewProductCategoryDB> & {
    translations?: AdminCreateProductCategoryForm["translations"];
  };
}

/**
 * Reshape the RHF form's `translations: {en,vi}` record (RULE-19 shape,
 * TASK-14/16) into `CategoryTranslationUpsertRecord` expected by
 * `updateProductCategoryAction` (TASK-19) — dropping empty locale entries,
 * coercing optional `name` to `""` per the upsert record's required field.
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

const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCategoryParams) => {
      const { translations, ...rest } = data;

      return updateProductCategoryAction(id, {
        ...rest,
        translations: translations
          ? toCategoryTranslationRecord(translations)
          : undefined,
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Cập nhật danh mục thành công!");
        // Invalidate categories list and detail
        queryClient.invalidateQueries({
          queryKey: ["admin", "categories"],
        });
      } else {
        handleServerActionError(result.code, result.error);
      }
    },
    onError: (error) => {
      console.error("Update category error:", error);
      toast.error("Có lỗi xảy ra khi cập nhật danh mục");
    },
  });
};

export default useUpdateCategory;
