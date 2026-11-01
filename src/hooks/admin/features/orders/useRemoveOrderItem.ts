import { removeOrderItemAction } from "@/actions/admin/order";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useRemoveOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeOrderItemAction,
    onSuccess(data) {
      if (data.success) {
        toast.success("Đã xoá sản phẩm khỏi đơn hàng");
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

export default useRemoveOrderItem;
