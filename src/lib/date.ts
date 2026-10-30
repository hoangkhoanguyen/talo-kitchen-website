import moment from "moment";
import {
  REPORT_MAX_DAYS,
  REPORT_PRESETS,
  ReportRangeError,
  type ReportPreset,
  type ReportRange,
} from "@/lib/report-range";

// Việt Nam là UTC+7 cố định (không có DST) → offset không đổi quanh năm.
const VN_UTC_OFFSET_MINUTES = 7 * 60;

/**
 * Format một MỐC THỜI GIAN THỰC (timestamp: createdAt/updatedAt...) theo
 * múi giờ Việt Nam (UTC+7), bất kể đang chạy ở server (Vercel=UTC) hay
 * client (trình duyệt tz bất kỳ) → luôn ra cùng một giờ VN.
 *
 * KHÔNG dùng cho arrivalDate/arrivalTime của đặt bàn — đó là giờ "wall-clock"
 * khách chọn (kiểu date/time không kèm tz), cộng thêm +7 sẽ bị sai.
 */
export function formatDateVN(
  value: moment.MomentInput,
  format = "YYYY-MM-DD HH:mm:ss",
) {
  return moment(value).utcOffset(VN_UTC_OFFSET_MINUTES).format(format);
}

/* ------------------------------------------------------------------ */
/* Helper ngày lịch VN cho báo cáo. Chuỗi ngày dạng "YYYY-MM-DD".       */
/* Chỉ tính toán bằng Date.UTC → không phụ thuộc timezone của server.   */
/* ------------------------------------------------------------------ */

const YMD_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function ymdToUtcMs(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function utcMsToYmd(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Ngày lịch hiện tại theo giờ VN. */
export function todayVN(now: Date = new Date()) {
  return utcMsToYmd(now.getTime() + VN_UTC_OFFSET_MINUTES * 60 * 1000);
}

/** Cộng/trừ n ngày vào một ngày lịch. */
export function addDays(ymd: string, n: number) {
  return utcMsToYmd(ymdToUtcMs(ymd) + n * MS_PER_DAY);
}

/** Đúng định dạng YYYY-MM-DD và là ngày lịch có thật (loại 2026-02-30). */
export function isValidYmd(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = YMD_REGEX.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  if (year < 1) return false;
  return utcMsToYmd(ymdToUtcMs(value)) === value;
}

/** Số ngày của khoảng đóng-đóng [start, end]. */
export function daysBetweenInclusive(start: string, end: string) {
  return Math.round((ymdToUtcMs(end) - ymdToUtcMs(start)) / MS_PER_DAY) + 1;
}

/**
 * Quy đổi preset/tham số client thành khoảng ngày VN (RULE-04..07).
 * - Không gửi gì → mặc định "Tháng này".
 * - Gửi sai (preset lạ, ngày sai, đảo, quá dài) → ném ReportRangeError.
 */
export function resolveReportRange({
  preset,
  start_date,
  end_date,
  now = new Date(),
}: {
  preset?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  now?: Date;
}): ReportRange {
  const hasPreset = preset !== undefined && preset !== null;
  const hasStart = start_date !== undefined && start_date !== null;
  const hasEnd = end_date !== undefined && end_date !== null;

  // Có ngày nhưng không có preset → coi như tự chọn
  const effective = hasPreset ? preset : hasStart || hasEnd ? "custom" : "this_month";

  if (!(REPORT_PRESETS as readonly string[]).includes(effective)) {
    throw new ReportRangeError("Kiểu lọc ngày không hợp lệ");
  }

  const today = todayVN(now);
  let start: string;
  let end: string;

  switch (effective as ReportPreset) {
    case "today":
      start = end = today;
      break;
    case "yesterday":
      start = end = addDays(today, -1);
      break;
    case "last7":
      start = addDays(today, -6);
      end = today;
      break;
    case "this_month":
      start = `${today.slice(0, 7)}-01`;
      end = today;
      break;
    case "last_month": {
      const firstOfThisMonth = `${today.slice(0, 7)}-01`;
      end = addDays(firstOfThisMonth, -1);
      start = `${end.slice(0, 7)}-01`;
      break;
    }
    case "custom": {
      if (!hasStart || !hasEnd || !start_date || !end_date) {
        throw new ReportRangeError(
          "Vui lòng chọn cả ngày bắt đầu và ngày kết thúc",
        );
      }
      if (!isValidYmd(start_date) || !isValidYmd(end_date)) {
        throw new ReportRangeError("Ngày không hợp lệ (định dạng YYYY-MM-DD)");
      }
      start = start_date;
      end = end_date;
      break;
    }
  }

  if (start > end) {
    throw new ReportRangeError(
      "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc",
    );
  }

  const days = daysBetweenInclusive(start, end);
  if (days > REPORT_MAX_DAYS) {
    throw new ReportRangeError(
      `Khoảng ngày tối đa ${REPORT_MAX_DAYS} ngày`,
    );
  }

  return { start, end, days };
}
