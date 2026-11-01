import { getOrderProductOptionsAction } from "@/actions/admin/order";
import { useQuery } from "@tanstack/react-query";

/** Sản phẩm đang bán (kèm addon) để chọn khi thêm món vào đơn. */
const useFetchOrderProductOptions = (enabled = true) => {
  return useQuery({
    queryKey: ["admin", "edit-order-products"],
    queryFn: async () => {
      const res = await getOrderProductOptionsAction();
      if (!res.success || !res.data) {
        throw new Error(res.error || "Không thể tải danh sách sản phẩm");
      }
      return res.data;
    },
    enabled,
    staleTime: 5 * 60000,
  });
};

export default useFetchOrderProductOptions;
