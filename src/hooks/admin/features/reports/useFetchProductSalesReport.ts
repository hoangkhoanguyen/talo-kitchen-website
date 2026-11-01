import { adminRoutes } from "@/constants/route";
import adminApi from "@/lib/api/axios";
import { ProductSalesReport } from "@/types/reports";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const useFetchProductSalesReport = (
  query: {
    preset: string;
    start_date?: string;
    end_date?: string;
    category_id?: string;
  },
  enabled = true,
) => {
  return useQuery<ProductSalesReport, AxiosError<{ message?: string }>>({
    queryKey: ["admin", "report", "products", query],
    queryFn: (): Promise<ProductSalesReport> =>
      adminApi.get(adminRoutes.productSalesReportApi(query)),
    enabled,
    staleTime: 30 * 1000,
    // 400 là lỗi tham số, thử lại cũng không khác
    retry: (failureCount, error) =>
      error?.response?.status === 400 ? false : failureCount < 1,
  });
};

export default useFetchProductSalesReport;
