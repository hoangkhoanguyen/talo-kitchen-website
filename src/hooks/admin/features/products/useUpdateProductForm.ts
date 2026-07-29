import { AdminEditProductForm } from "@/types/products";
import { updateProductSchema } from "@/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const useUpdateProductForm = () => {
  return useForm<AdminEditProductForm>({
    mode: "onSubmit",
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      title: "",
      slug: "",
      allergenInfo: "",
      subDescription: "",
      description: "",
      isActive: false,
      price: 0,
      categoryId: 0,
      addons: [],
      images: [],
      relatedProducts: [],
    },
  });
};

export default useUpdateProductForm;
