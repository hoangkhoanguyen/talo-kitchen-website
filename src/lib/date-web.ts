import type { Locale } from "@/types/configs";

/**
 * Web-user-only date/time formatting helpers (Intl-based).
 *
 * KHÔNG import/sửa `lib/date.ts formatDateVN` — file đó dành cho ADMIN
 * (format timestamp thực theo giờ VN, +7). Helper này dùng cho reservation
 * `arrivalDate`/`arrivalTime` — dữ liệu "wall-clock" (khách chọn ngày/giờ
 * không kèm timezone), KHÔNG được cộng/trừ offset nào.
 *
 * TIMEZONE-SAFE (bắt buộc): build `Date` từ các thành phần UTC
 * (`Date.UTC(y, m-1, d)` cho date / `Date.UTC(1970,0,1,h,mi,0)` cho time)
 * rồi format với `Intl.DateTimeFormat` truyền `timeZone: "UTC"` — đảm bảo
 * ngày/giờ hiển thị luôn bằng đúng giá trị nguồn, bất kể server chạy ở TZ
 * nào (CI/prod có thể chạy ở TZ bất kỳ).
 */

// Locale ("en"/"vi") -> BCP47 tag, pin output format (locale-agnostic map,
// không hardcode logic theo locale ở nơi khác).
const INTL_LOCALE_MAP: Record<Locale, string> = {
  en: "en-US",
  vi: "vi-VN",
};

function toIntlLocale(locale: Locale): string {
  return INTL_LOCALE_MAP[locale] ?? "en-US";
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{2}):(\d{2}):(\d{2})$/;

/**
 * Format a reservation date (`YYYY-MM-DD`, wall-clock) per locale.
 * - vi → `31/08/2026` (DD/MM/YYYY)
 * - en → `08/31/2026` (MM/DD/YYYY)
 * null / undefined / malformed input → `""` (never throws).
 */
export function formatReservationDate(
  date: string | null | undefined,
  locale: Locale,
): string {
  if (!date) return "";

  const match = DATE_RE.exec(date);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return "";

  const utcDate = new Date(Date.UTC(year, month - 1, day));
  // Guard against overflow producing a rolled-over date (e.g. 2026-02-30).
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(toIntlLocale(locale), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(utcDate);
  } catch {
    return "";
  }
}

/**
 * Format a reservation time (`HH:mm:ss`, wall-clock) per locale.
 * - vi → 24h `19:30`
 * - en → 12h `7:30 PM`
 * null / undefined / malformed input → `""` (never throws).
 */
export function formatReservationTime(
  time: string | null | undefined,
  locale: Locale,
): string {
  if (!time) return "";

  const match = TIME_RE.exec(time);
  if (!match) return "";

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3]);

  if (hour > 23 || minute > 59 || second > 59) return "";

  const utcTime = new Date(Date.UTC(1970, 0, 1, hour, minute, second));

  const isVi = locale === "vi";

  try {
    return new Intl.DateTimeFormat(toIntlLocale(locale), {
      hour: isVi ? "2-digit" : "numeric",
      minute: "2-digit",
      hour12: !isVi,
      timeZone: "UTC",
    }).format(utcTime);
  } catch {
    return "";
  }
}
