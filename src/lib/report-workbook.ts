// Dựng workbook báo cáo (exceljs) — thuần, không DB, để test được.
// Server dùng qua src/services/reports-excel.ts.
import ExcelJS from "exceljs";
import { formatDateVN } from "@/lib/date";
import type {
  ProductSalesReport,
  RevenueOrdersReport,
  RevenueReport,
} from "@/types/reports";

const MONEY_FORMAT = "#,##0";
const TEXT_FORMAT = "@";
const bold = { bold: true };

// YYYY-MM-DD → DD/MM/YYYY (chuỗi, không qua Date để khỏi lệch múi giờ)
function toDmy(ymd: string) {
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

// "YYYY-MM-DD HH:mm" (giờ VN) → "DD/MM/YYYY HH:mm"
function toDmyHm(value: string) {
  const [ymd, hm = ""] = value.split(" ");
  return `${toDmy(ymd)} ${hm}`.trim();
}

// Chặn Excel diễn giải nhãn như công thức (EC-15)
export function safeText(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function formatMoney(row: ExcelJS.Row, cols: number[]) {
  cols.forEach((c) => (row.getCell(c).numFmt = MONEY_FORMAT));
}

type Summary = { revenue: number; orderCount: number; shippingFee: number };

function addSummaryHeader(
  sheet: ExcelJS.Worksheet,
  range: { start: string; end: string },
  summary: Summary,
  exportedAt: Date,
) {
  sheet.addRow(["Khoảng ngày", `${toDmy(range.start)} - ${toDmy(range.end)}`]);
  sheet.addRow([
    "Xuất lúc",
    `${formatDateVN(exportedAt, "DD/MM/YYYY HH:mm:ss")} giờ VN`,
  ]);
  formatMoney(sheet.addRow(["Tổng doanh thu", summary.revenue]), [2]);
  formatMoney(sheet.addRow(["Số đơn", summary.orderCount]), [2]);
  formatMoney(sheet.addRow(["Tổng phí ship", summary.shippingFee]), [2]);
  [1, 2, 3, 4, 5].forEach((i) => (sheet.getRow(i).getCell(1).font = bold));
}

function addDailySheet(
  workbook: ExcelJS.Workbook,
  report: RevenueReport,
  exportedAt: Date,
) {
  const sheet = workbook.addWorksheet("Doanh thu theo ngày");
  sheet.columns = [{ width: 18 }, { width: 14 }, { width: 18 }, { width: 20 }];
  addSummaryHeader(sheet, report.range, report.summary, exportedAt);

  sheet.addRow([]);
  sheet.addRow(["Ngày", "Số đơn", "Phí ship", "Doanh thu"]).font = bold;
  for (const day of report.daily) {
    const row = sheet.addRow([
      toDmy(day.date),
      day.orderCount,
      day.shippingFee,
      day.revenue,
    ]);
    formatMoney(row, [2, 3, 4]);
  }

  sheet.addRow([]);
  sheet.addRow(["Theo phương thức thanh toán"]).font = bold;
  sheet.addRow(["Phương thức", "Số đơn", "Phí ship", "Doanh thu"]).font = bold;
  for (const pay of report.byPayment) {
    const row = sheet.addRow([
      safeText(pay.label),
      pay.orderCount,
      pay.shippingFee,
      pay.revenue,
    ]);
    formatMoney(row, [2, 3, 4]);
  }
}

function addOrdersSheet(
  workbook: ExcelJS.Workbook,
  report: RevenueOrdersReport,
  showDisabledColumn: boolean,
  exportedAt: Date,
) {
  const sheet = workbook.addWorksheet("Doanh thu theo đơn");
  sheet.columns = [
    { width: 18 },
    { width: 14 },
    { width: 24 },
    { width: 14 },
    { width: 16 },
    { width: 16 },
    { width: 14 },
    { width: 16 },
    { width: 40 },
    ...(showDisabledColumn ? [{ width: 10 }] : []),
  ];
  addSummaryHeader(sheet, report.range, report.summary, exportedAt);

  sheet.addRow([]);
  sheet.addRow([
    "Ngày giờ",
    "Mã đơn",
    "Khách hàng",
    "SĐT",
    "Loại đơn",
    "Thanh toán",
    "Phí ship",
    "Doanh thu",
    "Ghi chú nội bộ",
    // Cột này chỉ có trong file của talo_kitchen
    ...(showDisabledColumn ? ["Đang tắt"] : []),
  ]).font = bold;

  for (const order of report.orders) {
    const row = sheet.addRow([
      toDmyHm(order.createdAt),
      safeText(order.code),
      safeText(order.customerName),
      safeText(order.phone),
      safeText(order.orderTypeLabel),
      safeText(order.paymentLabel),
      order.shippingFee,
      order.revenue,
      safeText(order.internalNote),
      ...(showDisabledColumn ? [order.isDisabled ? "Có" : ""] : []),
    ]);
    // SĐT là text để giữ số 0 đầu
    row.getCell(4).numFmt = TEXT_FORMAT;
    formatMoney(row, [7, 8]);
    row.getCell(9).alignment = { wrapText: true, vertical: "top" };
  }

  const totalRow = sheet.addRow([
    "Tổng",
    "",
    "",
    "",
    "",
    "",
    report.summary.shippingFee,
    report.summary.revenue,
  ]);
  totalRow.font = bold;
  formatMoney(totalRow, [7, 8]);
}

function categoryFilterLabel(category: ProductSalesReport["category"]) {
  if (!category) return "Tất cả";
  return category.name ?? `Không tồn tại (#${category.id})`;
}

function addProductSalesSheet(
  workbook: ExcelJS.Workbook,
  report: ProductSalesReport,
  exportedAt: Date,
) {
  const sheet = workbook.addWorksheet("Thống kê theo món");
  sheet.columns = [
    { width: 6 },
    { width: 32 },
    { width: 20 },
    { width: 14 },
    { width: 12 },
    { width: 18 },
  ];
  sheet.addRow(["Khoảng ngày", `${toDmy(report.range.start)} - ${toDmy(report.range.end)}`]);
  sheet.addRow(["Danh mục", safeText(categoryFilterLabel(report.category))]);
  sheet.addRow([
    "Xuất lúc",
    `${formatDateVN(exportedAt, "DD/MM/YYYY HH:mm:ss")} giờ VN`,
  ]);
  [1, 2, 3].forEach((i) => (sheet.getRow(i).getCell(1).font = bold));

  sheet.addRow([]);
  sheet.addRow([
    "#",
    "Món",
    "Danh mục",
    "Số phần bán",
    "Số đơn",
    "Doanh thu",
  ]).font = bold;
  report.items.forEach((item, index) => {
    const row = sheet.addRow([
      index + 1,
      safeText(item.name),
      safeText(item.categoryName ?? "—"),
      item.quantity,
      item.orderCount,
      item.revenue,
    ]);
    formatMoney(row, [4, 5, 6]);
  });

  const totalRow = sheet.addRow([
    "",
    "Tổng",
    "",
    report.summary.quantity,
    "",
    report.summary.revenue,
  ]);
  totalRow.font = bold;
  formatMoney(totalRow, [4, 6]);
}

/** Workbook "Theo ngày": sheet doanh thu theo ngày + sheet thống kê theo món. */
export function createRevenueWorkbook(
  report: RevenueReport,
  productSales: ProductSalesReport,
  exportedAt: Date = new Date(),
) {
  const workbook = new ExcelJS.Workbook();
  addDailySheet(workbook, report, exportedAt);
  addProductSalesSheet(workbook, productSales, exportedAt);
  return workbook;
}

/**
 * Workbook "Theo đơn": mỗi dòng 1 đơn + sheet thống kê theo món.
 * showDisabledColumn = includeDisabled (talo_kitchen) → thêm cột "Đang tắt".
 */
export function createRevenueOrdersWorkbook(
  report: RevenueOrdersReport,
  productSales: ProductSalesReport,
  { showDisabledColumn }: { showDisabledColumn: boolean },
  exportedAt: Date = new Date(),
) {
  const workbook = new ExcelJS.Workbook();
  addOrdersSheet(workbook, report, showDisabledColumn, exportedAt);
  addProductSalesSheet(workbook, productSales, exportedAt);
  return workbook;
}
