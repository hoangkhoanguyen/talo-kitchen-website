import { addOrderItemAction } from "@/actions/admin/order";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useAddOrderItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addOrderItemAction,
    onSuccess(data) {
      if (data.success) {
        toast.success("Đã thêm sản phẩm vào đơn hàng");
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

export default useAddOrderItem;
