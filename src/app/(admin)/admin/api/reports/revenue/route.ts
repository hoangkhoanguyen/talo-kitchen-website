import { NextRequest, NextResponse } from "next/server";
import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { AccessTokenPayload } from "@/lib/auth";
import { isTaloKitchen } from "@/lib/order-visibility";
import { parseReportRange } from "@/lib/report-query";
import { getRevenueReport } from "@/services/reports";

async function getRevenueReportApi(
  payload: AccessTokenPayload,
  req: NextRequest,
) {
  const parsed = parseReportRange(req);
  if ("error" in parsed) return parsed.error;

  const report = await getRevenueReport({
    start: parsed.range.start,
    end: parsed.range.end,
    // Chỉ lấy từ token, không tin tham số client
    includeDisabled: isTaloKitchen(payload.username),
  });

  return NextResponse.json(report, {
    headers: { "Cache-Control": "no-store" },
  });
}

export const GET = withError(withAuth(getRevenueReportApi));
