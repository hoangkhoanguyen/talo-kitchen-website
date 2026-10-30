import "server-only";
import ExcelJS from "exceljs";
import { formatDateVN } from "@/lib/date";
import type { RevenueReport } from "@/types/reports";

const MONEY_FORMAT = "#,##0";

// YYYY-MM-DD → DD/MM/YYYY (chuỗi, không qua Date để khỏi lệch múi giờ)
function toDmy(ymd: string) {
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

// Chặn Excel diễn giải nhãn như công thức (EC-15)
function safeText(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

/** Tạo workbook báo cáo doanh thu từ cùng số liệu với màn hình (RULE-18). */
export async function buildRevenueWorkbook(
  report: RevenueReport,
  exportedAt: Date = new Date(),
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Doanh thu theo ngày");
  sheet.columns = [
    { width: 18 },
    { width: 14 },
    { width: 18 },
    { width: 20 },
  ];

  const bold = { bold: true };

  sheet.addRow([
    "Khoảng ngày",
    `${toDmy(report.range.start)} - ${toDmy(report.range.end)}`,
  ]);
  sheet.addRow([
    "Xuất lúc",
    `${formatDateVN(exportedAt, "DD/MM/YYYY HH:mm:ss")} giờ VN`,
  ]);
  const totalRow = sheet.addRow(["Tổng doanh thu", report.summary.revenue]);
  totalRow.getCell(2).numFmt = MONEY_FORMAT;
  const countRow = sheet.addRow(["Số đơn", report.summary.orderCount]);
  countRow.getCell(2).numFmt = MONEY_FORMAT;
  const shipRow = sheet.addRow(["Tổng phí ship", report.summary.shippingFee]);
  shipRow.getCell(2).numFmt = MONEY_FORMAT;
  [1, 2, 3, 4, 5].forEach((i) => (sheet.getRow(i).getCell(1).font = bold));

  sheet.addRow([]);
  const dailyHeader = sheet.addRow(["Ngày", "Số đơn", "Phí ship", "Doanh thu"]);
  dailyHeader.font = bold;
  for (const day of report.daily) {
    const row = sheet.addRow([
      toDmy(day.date),
      day.orderCount,
      day.shippingFee,
      day.revenue,
    ]);
    row.getCell(2).numFmt = MONEY_FORMAT;
    row.getCell(3).numFmt = MONEY_FORMAT;
    row.getCell(4).numFmt = MONEY_FORMAT;
  }

  sheet.addRow([]);
  const paymentTitle = sheet.addRow(["Theo phương thức thanh toán"]);
  paymentTitle.font = bold;
  const paymentHeader = sheet.addRow([
    "Phương thức",
    "Số đơn",
    "Phí ship",
    "Doanh thu",
  ]);
  paymentHeader.font = bold;
  for (const pay of report.byPayment) {
    const row = sheet.addRow([
      safeText(pay.label),
      pay.orderCount,
      pay.shippingFee,
      pay.revenue,
    ]);
    row.getCell(2).numFmt = MONEY_FORMAT;
    row.getCell(3).numFmt = MONEY_FORMAT;
    row.getCell(4).numFmt = MONEY_FORMAT;
  }

  return workbook.xlsx.writeBuffer();
}
