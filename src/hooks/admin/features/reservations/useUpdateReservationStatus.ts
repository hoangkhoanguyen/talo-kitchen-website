import { updateReservationStatusAction } from "@/actions/admin/reservation";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useUpdateReservationStatus = () => {
  return useMutation({
    mutationFn: updateReservationStatusAction,
    onSuccess(data) {
      if (data.success) {
        toast.success("Cập nhật trạng thái đặt bàn thành công!");
      } else {
        handleServerActionError(data.code, data.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    },
  });
};

export default useUpdateReservationStatus;
