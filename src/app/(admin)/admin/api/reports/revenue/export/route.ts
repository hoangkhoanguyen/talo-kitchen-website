import { NextRequest, NextResponse } from "next/server";
import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { AccessTokenPayload } from "@/lib/auth";
import { isTaloKitchen } from "@/lib/order-visibility";
import {
  parseReportCategoryId,
  parseReportExportModeParam,
  parseReportRange,
} from "@/lib/report-query";
import {
  getProductSalesReport,
  getRevenueOrders,
  getRevenueReport,
} from "@/services/reports";
import {
  buildRevenueOrdersWorkbook,
  buildRevenueWorkbook,
} from "@/services/reports-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function exportRevenueReportApi(
  payload: AccessTokenPayload,
  req: NextRequest,
) {
  const parsed = parseReportRange(req);
  if ("error" in parsed) return parsed.error;
  const modeParsed = parseReportExportModeParam(req);
  if ("error" in modeParsed) return modeParsed.error;
  const categoryParsed = parseReportCategoryId(req);
  if ("error" in categoryParsed) return categoryParsed.error;

  const { start, end } = parsed.range;
  // Chỉ lấy từ token, không tin tham số client
  const includeDisabled = isTaloKitchen(payload.username);

  const productSales = await getProductSalesReport({
    start,
    end,
    categoryId: categoryParsed.categoryId,
    includeDisabled,
  });

  let buffer: ArrayBuffer | Buffer;
  let filename: string;
  if (modeParsed.mode === "orders") {
    const report = await getRevenueOrders({ start, end, includeDisabled });
    buffer = await buildRevenueOrdersWorkbook(report, productSales, {
      showDisabledColumn: includeDisabled,
    });
    filename = `bao-cao-doanh-thu-theo-don_${start}_${end}.xlsx`;
  } else {
    const report = await getRevenueReport({ start, end, includeDisabled });
    buffer = await buildRevenueWorkbook(report, productSales);
    filename = `bao-cao-doanh-thu_${start}_${end}.xlsx`;
  }

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export const GET = withError(withAuth(exportRevenueReportApi));
