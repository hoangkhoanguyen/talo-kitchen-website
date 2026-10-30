import { NextRequest, NextResponse } from "next/server";
import { resolveReportRange } from "@/lib/date";
import { ReportRangeError, type ReportRange } from "@/lib/report-range";

/**
 * Parse query dùng chung cho API báo cáo và Excel.
 * Chỉ đọc preset/start_date/end_date; mọi tham số khác (kể cả include_disabled)
 * bị bỏ qua — quyền includeDisabled chỉ do token quyết định.
 */
export function parseReportRange(
  req: NextRequest,
): { range: ReportRange } | { error: NextResponse } {
  const params = req.nextUrl.searchParams;
  try {
    const range = resolveReportRange({
      preset: params.get("preset"),
      start_date: params.get("start_date"),
      end_date: params.get("end_date"),
    });
    return { range };
  } catch (err) {
    if (err instanceof ReportRangeError) {
      return {
        error: NextResponse.json(
          { code: -1, message: err.message },
          { status: 400 },
        ),
      };
    }
    throw err;
  }
}
