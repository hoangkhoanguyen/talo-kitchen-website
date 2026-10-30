// Bảng nhãn phương thức thanh toán cho báo cáo (khóa thô phân biệt hoa/thường).
// Không dùng enum PaymentMethod vì dữ liệu cũ có thể chứa giá trị khác.
export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Tiền mặt",
  cash_on_delivery: "Tiền mặt",
};

export const PAYMENT_UNKNOWN_LABEL = "Chưa xác định";

export type PaymentGroupRow = {
  label: string;
  orderCount: number;
  shippingFee: number;
  revenue: number;
};

/** Chuẩn hóa giá trị payment_method thô thành nhãn hiển thị. */
export function normalizePaymentLabel(raw: string | null | undefined) {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return PAYMENT_UNKNOWN_LABEL;
  return Object.prototype.hasOwnProperty.call(PAYMENT_METHOD_LABEL, trimmed)
    ? PAYMENT_METHOD_LABEL[trimmed]
    : trimmed;
}

/**
 * Gộp các dòng thô (theo payment_method) thành nhóm theo nhãn.
 * Sắp doanh thu giảm dần, "Chưa xác định" luôn ở cuối.
 */
export function groupPayments(
  rows: {
    paymentMethod: string | null | undefined;
    orderCount: number;
    shippingFee: number;
    revenue: number;
  }[],
): PaymentGroupRow[] {
  const map = new Map<string, PaymentGroupRow>();
  for (const row of rows) {
    const label = normalizePaymentLabel(row.paymentMethod);
    const current = map.get(label) ?? {
      label,
      orderCount: 0,
      shippingFee: 0,
      revenue: 0,
    };
    current.orderCount += row.orderCount;
    current.shippingFee += row.shippingFee;
    current.revenue += row.revenue;
    map.set(label, current);
  }

  return Array.from(map.values()).sort((a, b) => {
    const aUnknown = a.label === PAYMENT_UNKNOWN_LABEL;
    const bUnknown = b.label === PAYMENT_UNKNOWN_LABEL;
    if (aUnknown !== bUnknown) return aUnknown ? 1 : -1;
    return b.revenue - a.revenue;
  });
}
