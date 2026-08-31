import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminCreateProductCategoryForm, CategoryTranslationForm } from "@/types/products";
import { productCategorySchema } from "@/validations/product";
import { routing } from "@/i18n/routing";

// Entity MỚI (chưa tồn tại) → mọi locale rỗng.
export const createEmptyCategoryTranslations = (): CategoryTranslationForm =>
  routing.locales.reduce((acc, locale) => {
    acc[locale] = {
      name: "",
      description: "",
    };
    return acc;
  }, {} as CategoryTranslationForm);

const useCreateCategoryForm = () => {
  return useForm<AdminCreateProductCategoryForm>({
    mode: "onSubmit",
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      slug: "",
      isActive: true, // Mặc định active khi tạo mới
      translations: createEmptyCategoryTranslations(),
    },
  });
};

export default useCreateCategoryForm;
