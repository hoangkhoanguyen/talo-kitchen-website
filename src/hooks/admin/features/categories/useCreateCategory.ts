import { useMutation } from "@tanstack/react-query";
import { addProductCategoryAction } from "@/actions/admin/category";
import { NewProductCategoryDB } from "@/types/products";
import { toast } from "sonner";
import { handleServerActionError } from "@/lib/handle-server-action-error";

const useCreateCategory = () => {
  return useMutation({
    mutationFn: (data: NewProductCategoryDB) => addProductCategoryAction(data),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Tạo danh mục thành công!");
      } else {
        handleServerActionError(result.code, result.error);
      }
    },
    onError: (error) => {
      console.error("Create category error:", error);
      toast.error("Có lỗi xảy ra khi tạo danh mục");
    },
  });
};

export default useCreateCategory;
