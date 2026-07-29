import { createOrderAction } from "@/actions/web/order";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const useCheckout = () => {
  return useMutation({
    mutationFn: createOrderAction,
    onSuccess(data) {
      if (data.success) {
        toast.success("Order placed successfully!");
      } else {
        toast.error(data.error || "Failed to place order");
        if (data.code === "INVALID_ORDER_DATA") window.location.reload();
      }
    },
    onError() {
      toast.error("An error occurred while placing the order");
    },
  });
};

export default useCheckout;
