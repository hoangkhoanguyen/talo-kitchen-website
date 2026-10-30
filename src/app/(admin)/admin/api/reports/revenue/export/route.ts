import { NextRequest, NextResponse } from "next/server";
import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { AccessTokenPayload } from "@/lib/auth";
import { isTaloKitchen } from "@/lib/order-visibility";
import { parseReportRange } from "@/lib/report-query";
import { getRevenueReport } from "@/services/reports";
import { buildRevenueWorkbook } from "@/services/reports-excel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function exportRevenueReportApi(
  payload: AccessTokenPayload,
  req: NextRequest,
) {
  const parsed = parseReportRange(req);
  if ("error" in parsed) return parsed.error;

  const report = await getRevenueReport({
    start: parsed.range.start,
    end: parsed.range.end,
    includeDisabled: isTaloKitchen(payload.username),
  });

  const buffer = await buildRevenueWorkbook(report);
  const filename = `bao-cao-doanh-thu_${report.range.start}_${report.range.end}.xlsx`;

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
