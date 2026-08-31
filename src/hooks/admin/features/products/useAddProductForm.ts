import { routing } from "@/i18n/routing";
import { AdminCreateProductForm, ProductTranslationForm } from "@/types/products";
import { createProductSchema } from "@/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Entity MỚI (chưa tồn tại) → mọi locale rỗng, không cần seed cột gốc (EC-05 chỉ áp dụng khi load
// entity cũ, xem useUpdateProductForm.ts).
export const createEmptyProductTranslations = (): ProductTranslationForm =>
  routing.locales.reduce((acc, locale) => {
    acc[locale] = {
      title: "",
      description: "",
      subDescription: "",
      allergenInfo: "",
    };
    return acc;
  }, {} as ProductTranslationForm);

const useAddProductForm = () => {
  return useForm<AdminCreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      slug: "",
      categoryId: 0,
      translations: createEmptyProductTranslations(),
    },
  });
};

export default useAddProductForm;
