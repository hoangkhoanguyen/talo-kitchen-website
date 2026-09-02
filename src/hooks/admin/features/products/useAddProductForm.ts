import { AdminCreateProductForm } from "@/types/products";
import { createProductSchema } from "@/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createEmptyProductTranslations } from "@/lib/mappings/products";

// Re-export cho các consumer hiện có (giữ nguyên vị trí import cũ). Logic thật nằm ở
// `@/lib/mappings/products` (pure, KHÔNG import react-hook-form).
export { createEmptyProductTranslations };

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
