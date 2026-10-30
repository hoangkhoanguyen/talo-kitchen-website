// Lỗi tham số khoảng ngày báo cáo → API trả 400 với message tiếng Việt.
export class ReportRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportRangeError";
  }
}

export const REPORT_PRESETS = [
  "today",
  "yesterday",
  "last7",
  "this_month",
  "last_month",
  "custom",
] as const;

export type ReportPreset = (typeof REPORT_PRESETS)[number];

// Giới hạn số ngày của một báo cáo (OQ-02)
export const REPORT_MAX_DAYS = 366;

export type ReportRange = {
  start: string; // YYYY-MM-DD (ngày lịch VN)
  end: string; // YYYY-MM-DD (ngày lịch VN)
  days: number;
};
