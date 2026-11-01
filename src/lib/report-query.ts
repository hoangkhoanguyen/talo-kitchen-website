import { NextRequest, NextResponse } from "next/server";
import { resolveReportRange } from "@/lib/date";
import { ReportRangeError, type ReportRange } from "@/lib/report-range";
import {
  parseCategoryIdParam,
  parseReportExportMode,
  type ReportExportMode,
} from "@/lib/report-helpers";

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

function badRequest(message: string) {
  return NextResponse.json({ code: -1, message }, { status: 400 });
}

/** category_id cho báo cáo theo món: rỗng → không lọc; sai định dạng → 400. */
export function parseReportCategoryId(
  req: NextRequest,
): { categoryId: number | null } | { error: NextResponse } {
  const parsed = parseCategoryIdParam(req.nextUrl.searchParams.get("category_id"));
  return parsed.ok
    ? { categoryId: parsed.value }
    : { error: badRequest("Danh mục không hợp lệ") };
}

/** mode xuất Excel: daily (mặc định) | orders; giá trị lạ → 400. */
export function parseReportExportModeParam(
  req: NextRequest,
): { mode: ReportExportMode } | { error: NextResponse } {
  const mode = parseReportExportMode(req.nextUrl.searchParams.get("mode"));
  return mode ? { mode } : { error: badRequest("Kiểu xuất không hợp lệ") };
}
