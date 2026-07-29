import { createOrderAction } from "@/actions/web/order";
// import { createOrderAction } from "@/actions/admin/product";
import { useMutation } from "@tanstack/react-query";

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrderAction,
  });
};
