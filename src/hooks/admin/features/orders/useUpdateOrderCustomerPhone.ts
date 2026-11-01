import { updateOrderCustomerPhoneAction } from "@/actions/admin/order";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateOrderCustomerPhone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderCustomerPhoneAction,
    onSuccess(data) {
      if (data.success) {
        toast.success("Đã cập nhật số điện thoại");
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

export default useUpdateOrderCustomerPhone;
