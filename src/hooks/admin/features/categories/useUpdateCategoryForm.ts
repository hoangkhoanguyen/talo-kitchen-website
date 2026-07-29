import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdminCreateProductCategoryForm } from "@/types/products";
import { productCategorySchema } from "@/validations/product";

const useUpdateCategoryForm = (
  defaultValues?: AdminCreateProductCategoryForm,
) => {
  return useForm<AdminCreateProductCategoryForm>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: defaultValues || {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });
};

export default useUpdateCategoryForm;
