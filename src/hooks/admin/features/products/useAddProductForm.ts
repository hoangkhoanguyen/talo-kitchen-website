import { AdminCreateProductForm } from "@/types/products";
import { createProductSchema } from "@/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const useAddProductForm = () => {
  return useForm<AdminCreateProductForm>({
    resolver: zodResolver(createProductSchema),
  });
};

export default useAddProductForm;
