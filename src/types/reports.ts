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

// Xuất Excel "Theo đơn": mỗi dòng 1 đơn completed (cùng tập đơn với RevenueReport).
export type RevenueOrderRow = {
  createdAt: string; // "YYYY-MM-DD HH:mm" giờ VN (đã quy đổi trong SQL)
  code: string;
  customerName: string;
  phone: string;
  orderTypeLabel: string;
  paymentLabel: string;
  shippingFee: number;
  revenue: number;
  internalNote: string;
  // Chỉ có khi includeDisabled (talo_kitchen); tài khoản thường không bao giờ có field này
  isDisabled?: boolean;
};

export type RevenueOrdersReport = {
  range: { start: string; end: string; days: number };
  summary: { revenue: number; orderCount: number; shippingFee: number };
  orders: RevenueOrderRow[];
};

// Thống kê theo món (đã tổng hợp). Không chứa isEnabled.
export type ProductSalesRow = {
  productId: number;
  name: string;
  categoryName: string | null; // null: món đã bị xoá khỏi bảng products
  quantity: number;
  orderCount: number;
  revenue: number; // gồm topping (order_items.total_price)
};

export type ProductSalesReport = {
  range: { start: string; end: string; days: number };
  category: { id: number; name: string | null } | null; // null: không lọc
  summary: { quantity: number; revenue: number };
  items: ProductSalesRow[];
};
