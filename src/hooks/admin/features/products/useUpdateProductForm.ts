import { AdminEditProductForm } from "@/types/products";
import { updateProductSchema } from "@/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createEmptyProductTranslations } from "@/lib/mappings/products";

// Re-export cho các consumer hiện có (giữ nguyên vị trí import cũ). Logic thật nằm ở
// `@/lib/mappings/products` (pure, KHÔNG import react-hook-form) để Server Component (page.tsx)
// dùng được mà không kéo `react-hook-form` vào bundle RSC.
export {
  mapProductTranslationsToForm,
  mapAddonTranslationsToForm,
} from "@/lib/mappings/products";

const useUpdateProductForm = () => {
  return useForm<AdminEditProductForm>({
    mode: "onSubmit",
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      slug: "",
      categoryId: 0,
      translations: createEmptyProductTranslations(),
      isActive: false,
      price: 0,
      addons: [],
      images: [],
      relatedProducts: [],
      priority: 0,
    },
  });
};

export default useUpdateProductForm;
