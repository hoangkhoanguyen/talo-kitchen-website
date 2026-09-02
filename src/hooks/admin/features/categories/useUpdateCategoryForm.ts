import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AdminCreateProductCategoryForm,
  CategoryTranslationForm,
  ProductCategoryTranslationDB,
} from "@/types/products";
import { productCategorySchema } from "@/validations/product";
import { routing } from "@/i18n/routing";
import { createEmptyCategoryTranslations } from "./useCreateCategoryForm";

/**
 * Map mảng translation category (mọi locale, từ admin fetch RULE-13, vd `getCategoryWithProducts`)
 * → record `{en,vi}` (RULE-19/EC-05). Locale mặc định thiếu row → seed từ cột gốc
 * (`category.name`/`category.description`) làm safety net; locale khác thiếu row → rỗng, KHÔNG crash.
 */
export const mapCategoryTranslationsToForm = (
  base: { name: string; description?: string | null },
  translations: Pick<
    ProductCategoryTranslationDB,
    "locale" | "name" | "description"
  >[] = [],
): CategoryTranslationForm => {
  return routing.locales.reduce((acc, locale) => {
    const row = translations.find((t) => t.locale === locale);
    const isDefaultLocale = locale === routing.defaultLocale;

    acc[locale] = {
      name: row?.name ?? (isDefaultLocale ? base.name : "") ?? "",
      description:
        row?.description ?? (isDefaultLocale ? base.description : "") ?? "",
    };
    return acc;
  }, {} as CategoryTranslationForm);
};

const useUpdateCategoryForm = (
  defaultValues?: AdminCreateProductCategoryForm,
) => {
  return useForm<AdminCreateProductCategoryForm>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: defaultValues || {
      slug: "",
      isActive: true,
      translations: createEmptyCategoryTranslations(),
    },
  });
};

export default useUpdateCategoryForm;
