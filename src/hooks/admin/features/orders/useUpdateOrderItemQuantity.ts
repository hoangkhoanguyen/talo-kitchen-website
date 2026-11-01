import { updateOrderItemQuantityAction } from "@/actions/admin/order";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateOrderItemQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderItemQuantityAction,
    onSuccess(data) {
      if (data.success) {
        toast.success("Đã cập nhật số lượng sản phẩm");
        queryClient.invalidateQueries({ queryKey: ["admin", "order"] });
      } else {
        handleServerActionError(data.code, data.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    },
  });
};

export default useUpdateOrderItemQuantity;
