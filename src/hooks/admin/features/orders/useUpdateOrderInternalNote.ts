import { updateOrderInternalNoteAction } from "@/actions/admin/order";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateOrderInternalNote = () => {
  return useMutation({
    mutationFn: updateOrderInternalNoteAction,
    onSuccess(data) {
      if (data.success) {
        toast.success("Cập nhật ghi chú đơn hàng thành công!");
      } else {
        handleServerActionError(data.code, data.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    },
  });
};

export default useUpdateOrderInternalNote;
