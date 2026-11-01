import { NextRequest, NextResponse } from "next/server";
import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { AccessTokenPayload } from "@/lib/auth";
import { isTaloKitchen } from "@/lib/order-visibility";
import { parseReportCategoryId, parseReportRange } from "@/lib/report-query";
import { getProductSalesReport } from "@/services/reports";

export const dynamic = "force-dynamic";

async function getProductSalesReportApi(
  payload: AccessTokenPayload,
  req: NextRequest,
) {
  const parsed = parseReportRange(req);
  if ("error" in parsed) return parsed.error;
  const categoryParsed = parseReportCategoryId(req);
  if ("error" in categoryParsed) return categoryParsed.error;

  const report = await getProductSalesReport({
    start: parsed.range.start,
    end: parsed.range.end,
    categoryId: categoryParsed.categoryId,
    // Chỉ lấy từ token, không tin tham số client
    includeDisabled: isTaloKitchen(payload.username),
  });

  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}

export const GET = withError(withAuth(getProductSalesReportApi));
