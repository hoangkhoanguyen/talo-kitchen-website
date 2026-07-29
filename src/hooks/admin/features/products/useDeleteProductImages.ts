import { deleteProductImagesAction } from "@/actions/admin/product";
import { handleServerActionError } from "@/lib/handle-server-action-error";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useDeleteProductImages() {
  return useMutation({
    mutationFn: ({ ids, productId }: { ids: number[]; productId: number }) =>
      deleteProductImagesAction(ids, productId),
    onSuccess(data) {
      if (data.success) {
        toast.success("Xóa hình ảnh sản phẩm thành công!");
      } else {
        handleServerActionError(data.code, data.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    },
  });
}
