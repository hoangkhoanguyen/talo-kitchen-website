import { toggleOrderItemEnabledAction } from "@/actions/admin/order";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useToggleOrderItemEnabled = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleOrderItemEnabledAction,
    onSuccess(data, variables) {
      if (data.success) {
        toast.success(
          variables.isEnabled ? "Đã bật sản phẩm" : "Đã tắt sản phẩm",
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

export default useToggleOrderItemEnabled;
