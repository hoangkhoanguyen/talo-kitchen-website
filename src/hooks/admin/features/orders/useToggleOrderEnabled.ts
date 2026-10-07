import { toggleOrderEnabledAction } from "@/actions/admin/order";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useToggleOrderEnabled = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleOrderEnabledAction,
    onSuccess(data, variables) {
      if (data.success) {
        toast.success(
          variables.isEnabled ? "Đã bật đơn hàng" : "Đã tắt đơn hàng",
        );
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

export default useToggleOrderEnabled;
