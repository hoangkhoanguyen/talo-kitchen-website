import "server-only";
import {
  createRevenueOrdersWorkbook,
  createRevenueWorkbook,
} from "@/lib/report-workbook";
import type {
  ProductSalesReport,
  RevenueOrdersReport,
  RevenueReport,
} from "@/types/reports";

/** File "Theo ngày" từ cùng số liệu với màn hình (RULE-18) + sheet theo món. */
export async function buildRevenueWorkbook(
  report: RevenueReport,
  productSales: ProductSalesReport,
  exportedAt: Date = new Date(),
) {
  return createRevenueWorkbook(report, productSales, exportedAt).xlsx.writeBuffer();
}

/** File "Theo đơn" (mỗi dòng 1 đơn, có ghi chú nội bộ) + sheet theo món. */
export async function buildRevenueOrdersWorkbook(
  report: RevenueOrdersReport,
  productSales: ProductSalesReport,
  options: { showDisabledColumn: boolean },
  exportedAt: Date = new Date(),
) {
  return createRevenueOrdersWorkbook(
    report,
    productSales,
    options,
    exportedAt,
  ).xlsx.writeBuffer();
}
