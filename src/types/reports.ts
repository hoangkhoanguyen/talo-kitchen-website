// Số liệu báo cáo doanh thu (đã tổng hợp, VND nguyên). Không chứa isEnabled.
export type RevenueReportDaily = {
  date: string; // YYYY-MM-DD (ngày VN)
  orderCount: number;
  shippingFee: number;
  revenue: number;
};

export type RevenueReportPayment = {
  label: string;
  orderCount: number;
  shippingFee: number;
  revenue: number;
};

export type RevenueReport = {
  range: { start: string; end: string; days: number };
  summary: { revenue: number; orderCount: number; shippingFee: number };
  daily: RevenueReportDaily[];
  byPayment: RevenueReportPayment[];
};
