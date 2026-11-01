// Helper thuần (không DB, không Next) cho báo cáo: tham số xuất Excel, sắp xếp/tổng hợp.
import { normalizePaymentLabel } from "@/constants/reports";
import type { ProductSalesRow, RevenueOrderRow } from "@/types/reports";

export const REPORT_EXPORT_MODES = ["daily", "orders"] as const;
export type ReportExportMode = (typeof REPORT_EXPORT_MODES)[number];

/** Không truyền → "daily" (hành vi cũ); giá trị lạ → null (API trả 400). */
export function parseReportExportMode(
  raw: string | null | undefined,
): ReportExportMode | null {
  if (raw === null || raw === undefined || raw === "") return "daily";
  return (REPORT_EXPORT_MODES as readonly string[]).includes(raw)
    ? (raw as ReportExportMode)
    : null;
}

/**
 * category_id: không truyền/rỗng → không lọc (value null);
 * không phải số nguyên dương → invalid (API trả 400).
 */
export function parseCategoryIdParam(
  raw: string | null | undefined,
): { ok: true; value: number | null } | { ok: false } {
  if (raw === null || raw === undefined || raw === "") {
    return { ok: true, value: null };
  }
  if (!/^[1-9]\d{0,9}$/.test(raw)) return { ok: false };
  const value = Number(raw);
  return value <= 2147483647 ? { ok: true, value } : { ok: false };
}

/** Số phần giảm dần → doanh thu giảm dần → tên A→Z. Món 0 lượt tự rơi xuống cuối. */
export function sortProductSales(rows: ProductSalesRow[]): ProductSalesRow[] {
  return [...rows].sort(
    (a, b) =>
      b.quantity - a.quantity ||
      b.revenue - a.revenue ||
      a.name.localeCompare(b.name, "vi") ||
      a.productId - b.productId,
  );
}

export function summarizeProductSales(rows: ProductSalesRow[]) {
  return rows.reduce(
    (acc, row) => ({
      quantity: acc.quantity + row.quantity,
      revenue: acc.revenue + row.revenue,
    }),
    { quantity: 0, revenue: 0 },
  );
}

export function summarizeRevenueOrders(rows: RevenueOrderRow[]) {
  return rows.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue,
      orderCount: acc.orderCount + 1,
      shippingFee: acc.shippingFee + row.shippingFee,
    }),
    { revenue: 0, orderCount: 0, shippingFee: 0 },
  );
}

// Dòng thô từ SQL (getRevenueOrders). is_enabled chỉ được SELECT khi includeDisabled.
export type RawRevenueOrderRow = {
  created_at_vn: string;
  code: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  order_type_label: string | null;
  payment_method: string | null;
  ship: string | number;
  revenue: string | number;
  internal_note: string | null;
  is_enabled?: boolean | null;
};

/**
 * Map dòng SQL → RevenueOrderRow. Tài khoản thường (includeDisabled=false):
 * không bao giờ có field isDisabled, kể cả khi dòng thô lỡ có is_enabled.
 */
export function mapRevenueOrderRow(
  row: RawRevenueOrderRow,
  includeDisabled: boolean,
): RevenueOrderRow {
  const mapped: RevenueOrderRow = {
    createdAt: row.created_at_vn,
    code: row.code,
    customerName: [row.first_name, row.last_name]
      .map((part) => (part ?? "").trim())
      .filter(Boolean)
      .join(" "),
    phone: row.phone ?? "",
    orderTypeLabel: row.order_type_label ?? "",
    paymentLabel: normalizePaymentLabel(row.payment_method),
    shippingFee: Number(row.ship),
    revenue: Number(row.revenue),
    internalNote: row.internal_note ?? "",
  };
  if (includeDisabled) mapped.isDisabled = row.is_enabled === false;
  return mapped;
}
