import { adminRoutes } from "@/constants/route";
import adminApi from "@/lib/api/axios";
import { AdminOrderTableApi } from "@/types/orders";
import { useQuery } from "@tanstack/react-query";

const useFetchOrders = (query: any) => {
  return useQuery({
    queryKey: ["admin", "order", query],
    queryFn: (): Promise<{ orders: AdminOrderTableApi[]; total: number }> =>
      adminApi.get(adminRoutes.ordersApi(query)),
  });
};

export default useFetchOrders;
