import { adminRoutes } from "@/constants/route";
import adminApi from "@/lib/api/axios";
import { RevenueReport } from "@/types/reports";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

const useFetchRevenueReport = (
  query: { preset: string; start_date?: string; end_date?: string },
  enabled = true,
) => {
  return useQuery<RevenueReport, AxiosError<{ message?: string }>>({
    queryKey: ["admin", "report", "revenue", query],
    queryFn: (): Promise<RevenueReport> =>
      adminApi.get(adminRoutes.revenueReportApi(query)),
    enabled,
    staleTime: 30 * 1000,
    // 400 là lỗi tham số, thử lại cũng không khác
    retry: (failureCount, error) =>
      error?.response?.status === 400 ? false : failureCount < 1,
  });
};

export default useFetchRevenueReport;
