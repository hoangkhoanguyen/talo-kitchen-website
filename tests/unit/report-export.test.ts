/**
 * Test xuất Excel báo cáo (theo ngày/theo đơn + sheet theo món) và helper thuần.
 * Chạy: npx tsx --test tests/unit/report-export.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import {
  mapRevenueOrderRow,
  parseCategoryIdParam,
  parseReportExportMode,
  sortProductSales,
  summarizeProductSales,
  summarizeRevenueOrders,
  type RawRevenueOrderRow,
} from "@/lib/report-helpers";
import {
  createRevenueOrdersWorkbook,
  createRevenueWorkbook,
} from "@/lib/report-workbook";
import type {
  ProductSalesReport,
  ProductSalesRow,
  RevenueOrdersReport,
  RevenueReport,
} from "@/types/reports";

const range = { start: "2026-10-01", end: "2026-10-31", days: 31 };
const exportedAt = new Date("2026-10-31T16:30:00Z"); // 23:30 giờ VN

// Đơn thô: đơn 2 bị tắt (chỉ talo_kitchen thấy)
const rawOrders: RawRevenueOrderRow[] = [
  {
    created_at_vn: "2026-10-05 23:30",
    code: "TK001",
    first_name: "Nguyễn",
    last_name: "An",
    phone: "0901234567",
    order_type_label: "Giao hàng",
    payment_method: "cash_on_delivery",
    ship: "15000",
    revenue: "115000",
    internal_note: "=HYPERLINK(\"x\")\nDòng 2",
    is_enabled: true,
  },
  {
    created_at_vn: "2026-10-06 08:05",
    code: "TK002",
    first_name: "Trần",
    last_name: "Bình",
    phone: "0987654321",
    order_type_label: "Tại quán",
    payment_method: " cash ",
    ship: 0,
    revenue: 50000,
    internal_note: "",
    is_enabled: false,
  },
];

function ordersReport(includeDisabled: boolean): RevenueOrdersReport {
  const rows = rawOrders
    // Tài khoản thường: SQL đã loại đơn tắt
    .filter((r) => includeDisabled || r.is_enabled !== false)
    .map((r) => mapRevenueOrderRow(r, includeDisabled));
  return { range, summary: summarizeRevenueOrders(rows), orders: rows };
}

const productRows: ProductSalesRow[] = [
  { productId: 3, name: "Trà sữa", categoryName: "Đồ uống", quantity: 0, orderCount: 0, revenue: 0 },
  { productId: 1, name: "=Cơm gà", categoryName: "Món chính", quantity: 3, orderCount: 1, revenue: 90000 },
  { productId: 2, name: "Phở", categoryName: null, quantity: 3, orderCount: 2, revenue: 120000 },
  { productId: 4, name: "Bánh", categoryName: "Món chính", quantity: 5, orderCount: 1, revenue: 10000 },
];

function productReport(
  category: ProductSalesReport["category"] = null,
): ProductSalesReport {
  const items = sortProductSales(productRows);
  return { range, category, summary: summarizeProductSales(items), items };
}

function sheetRows(sheet: ExcelJS.Worksheet) {
  const rows: unknown[][] = [];
  sheet.eachRow({ includeEmpty: true }, (row) => {
    rows.push((row.values as unknown[]).slice(1));
  });
  return rows;
}

function findRow(sheet: ExcelJS.Worksheet, first: string | number) {
  let found: ExcelJS.Row | undefined;
  sheet.eachRow((row) => {
    if (!found && row.getCell(1).value === first) found = row;
  });
  assert.ok(found, `không thấy dòng "${first}"`);
  return found;
}

/* ---------------- tham số ---------------- */

test("mode: mặc định daily, giá trị lạ → null", () => {
  assert.equal(parseReportExportMode(null), "daily");
  assert.equal(parseReportExportMode(""), "daily");
  assert.equal(parseReportExportMode("daily"), "daily");
  assert.equal(parseReportExportMode("orders"), "orders");
  assert.equal(parseReportExportMode("ORDERS"), null);
  assert.equal(parseReportExportMode("abc"), null);
});

test("category_id: rỗng → không lọc; chỉ nhận số nguyên dương", () => {
  assert.deepEqual(parseCategoryIdParam(null), { ok: true, value: null });
  assert.deepEqual(parseCategoryIdParam(""), { ok: true, value: null });
  assert.deepEqual(parseCategoryIdParam("12"), { ok: true, value: 12 });
  for (const bad of ["0", "-1", "1.5", "abc", "01", "99999999999"]) {
    assert.deepEqual(parseCategoryIdParam(bad), { ok: false }, bad);
  }
});

/* ---------------- map dòng đơn theo vai trò ---------------- */

test("tài khoản thường: dòng đơn không có field isDisabled", () => {
  const row = mapRevenueOrderRow(rawOrders[1], false);
  assert.equal("isDisabled" in row, false);
  assert.equal(row.paymentLabel, "Tiền mặt");
  assert.equal(row.customerName, "Trần Bình");
});

test("talo_kitchen: isDisabled theo is_enabled", () => {
  assert.equal(mapRevenueOrderRow(rawOrders[0], true).isDisabled, false);
  assert.equal(mapRevenueOrderRow(rawOrders[1], true).isDisabled, true);
});

/* ---------------- workbook theo đơn ---------------- */

test("theo đơn, tài khoản thường: không có cột/giá trị lộ cơ chế bật/tắt", () => {
  const wb = createRevenueOrdersWorkbook(
    ordersReport(false),
    productReport(),
    { showDisabledColumn: false },
    exportedAt,
  );
  const sheet = wb.getWorksheet("Doanh thu theo đơn")!;
  const header = findRow(sheet, "Ngày giờ");
  assert.deepEqual((header.values as unknown[]).slice(1), [
    "Ngày giờ",
    "Mã đơn",
    "Khách hàng",
    "SĐT",
    "Loại đơn",
    "Thanh toán",
    "Phí ship",
    "Doanh thu",
    "Ghi chú nội bộ",
  ]);
  const flat = JSON.stringify(sheetRows(sheet));
  assert.equal(flat.includes("Đang tắt"), false);
  assert.equal(flat.includes("TK002"), false);
});

test("theo đơn, talo_kitchen: có cột Đang tắt, có đơn tắt", () => {
  const wb = createRevenueOrdersWorkbook(
    ordersReport(true),
    productReport(),
    { showDisabledColumn: true },
    exportedAt,
  );
  const sheet = wb.getWorksheet("Doanh thu theo đơn")!;
  assert.equal(findRow(sheet, "Ngày giờ").getCell(10).value, "Đang tắt");
  assert.equal(findRow(sheet, "06/10/2026 08:05").getCell(10).value, "Có");
  assert.equal(findRow(sheet, "05/10/2026 23:30").getCell(10).value, "");
});

test("theo đơn: ghi chú bị escape công thức, giữ xuống dòng, wrap text; SĐT là text", async () => {
  const wb = createRevenueOrdersWorkbook(
    ordersReport(false),
    productReport(),
    { showDisabledColumn: false },
    exportedAt,
  );
  // Đọc lại từ file để chắc giá trị thực sự ghi ra
  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load((await wb.xlsx.writeBuffer()) as ArrayBuffer);
  const sheet = loaded.getWorksheet("Doanh thu theo đơn")!;
  // 23:30 giờ VN nằm đúng ngày 05/10
  const row = findRow(sheet, "05/10/2026 23:30");
  const note = row.getCell(9);
  assert.equal(note.value, "'=HYPERLINK(\"x\")\nDòng 2");
  assert.equal(note.type, ExcelJS.ValueType.String);
  assert.equal(note.alignment?.wrapText, true);
  const phone = row.getCell(4);
  assert.equal(phone.value, "0901234567");
  assert.equal(phone.type, ExcelJS.ValueType.String);
  assert.equal(phone.numFmt, "@");
  assert.equal(row.getCell(6).value, "Tiền mặt");
});

test("theo đơn: dòng Tổng khớp phần đầu, cả 2 vai trò", () => {
  for (const includeDisabled of [false, true]) {
    const report = ordersReport(includeDisabled);
    const wb = createRevenueOrdersWorkbook(
      report,
      productReport(),
      { showDisabledColumn: includeDisabled },
      exportedAt,
    );
    const sheet = wb.getWorksheet("Doanh thu theo đơn")!;
    const total = findRow(sheet, "Tổng");
    assert.equal(total.getCell(7).value, findRow(sheet, "Tổng phí ship").getCell(2).value);
    assert.equal(total.getCell(8).value, findRow(sheet, "Tổng doanh thu").getCell(2).value);
    assert.equal(findRow(sheet, "Số đơn").getCell(2).value, report.orders.length);
    assert.equal(report.summary.revenue, includeDisabled ? 165000 : 115000);
  }
});

test("tổng theo đơn = tổng theo ngày khi cùng tập đơn", () => {
  const byOrder = ordersReport(false);
  const daily: RevenueReport = {
    range,
    summary: { revenue: 115000, orderCount: 1, shippingFee: 15000 },
    daily: [{ date: "2026-10-05", orderCount: 1, shippingFee: 15000, revenue: 115000 }],
    byPayment: [{ label: "Tiền mặt", orderCount: 1, shippingFee: 15000, revenue: 115000 }],
  };
  assert.deepEqual(byOrder.summary, daily.summary);
});

/* ---------------- thống kê theo món ---------------- */

test("sắp xếp món: số phần giảm dần → doanh thu → tên; món 0 lượt cuối", () => {
  assert.deepEqual(
    sortProductSales(productRows).map((r) => r.productId),
    [4, 2, 1, 3],
  );
  assert.deepEqual(summarizeProductSales(productRows), { quantity: 11, revenue: 220000 });
});

test("Σ doanh thu món + Σ ship = tổng doanh thu", () => {
  // Đơn 115.000 (ship 15.000) gồm 100.000 tiền món
  const items: ProductSalesRow[] = [
    { productId: 1, name: "A", categoryName: "X", quantity: 2, orderCount: 1, revenue: 60000 },
    { productId: 2, name: "B", categoryName: "X", quantity: 1, orderCount: 1, revenue: 40000 },
  ];
  const orders = ordersReport(false);
  assert.equal(
    summarizeProductSales(items).revenue + orders.summary.shippingFee,
    orders.summary.revenue,
  );
});

test("sheet Thống kê theo món có ở cả 2 kiểu xuất, số là number, tên bị escape", () => {
  const daily: RevenueReport = {
    range,
    summary: { revenue: 0, orderCount: 0, shippingFee: 0 },
    daily: [],
    byPayment: [],
  };
  const books = [
    createRevenueWorkbook(daily, productReport({ id: 7, name: "Món chính" }), exportedAt),
    createRevenueOrdersWorkbook(
      ordersReport(false),
      productReport({ id: 7, name: "Món chính" }),
      { showDisabledColumn: false },
      exportedAt,
    ),
  ];
  for (const wb of books) {
    const sheet = wb.getWorksheet("Thống kê theo món")!;
    assert.ok(sheet);
    assert.equal(findRow(sheet, "Danh mục").getCell(2).value, "Món chính");
    assert.equal(findRow(sheet, "Xuất lúc").getCell(2).value, "31/10/2026 23:30:00 giờ VN");
    const first = findRow(sheet, 1);
    assert.deepEqual((first.values as unknown[]).slice(1), [1, "Bánh", "Món chính", 5, 1, 10000]);
    assert.equal(first.getCell(6).numFmt, "#,##0");
    assert.equal(findRow(sheet, 3).getCell(2).value, "'=Cơm gà");
    assert.equal(findRow(sheet, 2).getCell(3).value, "—");
  }
  const sheet = books[0].getWorksheet("Thống kê theo món")!;
  let totalRow: ExcelJS.Row | undefined;
  sheet.eachRow((row) => {
    if (row.getCell(2).value === "Tổng") totalRow = row;
  });
  assert.equal(totalRow?.getCell(4).value, 11);
  assert.equal(totalRow?.getCell(6).value, 220000);
});

test("sheet theo món: nhãn danh mục khi không lọc / danh mục không tồn tại", () => {
  const daily: RevenueReport = {
    range,
    summary: { revenue: 0, orderCount: 0, shippingFee: 0 },
    daily: [],
    byPayment: [],
  };
  const all = createRevenueWorkbook(daily, productReport(null), exportedAt);
  assert.equal(findRow(all.getWorksheet("Thống kê theo món")!, "Danh mục").getCell(2).value, "Tất cả");
  const missing = createRevenueWorkbook(
    daily,
    { ...productReport({ id: 99, name: null }), items: [], summary: { quantity: 0, revenue: 0 } },
    exportedAt,
  );
  assert.equal(
    findRow(missing.getWorksheet("Thống kê theo món")!, "Danh mục").getCell(2).value,
    "Không tồn tại (#99)",
  );
});
