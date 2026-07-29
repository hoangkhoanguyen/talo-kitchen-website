import { updateProductAction } from "@/actions/admin/product";
import { handleServerActionError } from "@/lib/handle-server-action-error";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useUpdateProduct() {
  return useMutation({
    mutationFn: updateProductAction,
    onSuccess(data) {
      if (data.success) {
        toast.success(data.data?.message || "Cập nhật sản phẩm thành công!");
      } else {
        handleServerActionError(data.code, data.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    },
  });
}
