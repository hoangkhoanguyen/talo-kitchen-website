/**
 * Test khoảng ngày báo cáo (src/lib/date.ts).
 * Chạy: npx tsx --test tests/unit/report-range.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  daysBetweenInclusive,
  isValidYmd,
  resolveReportRange,
  todayVN,
} from "@/lib/date";
import { ReportRangeError } from "@/lib/report-range";

const at = (iso: string) => new Date(iso);

test("todayVN: 23:59:59 giờ VN vẫn là ngày D", () => {
  // 2026-10-30 23:59:59 +07:00 = 16:59:59 UTC
  assert.equal(todayVN(at("2026-10-30T16:59:59Z")), "2026-10-30");
});

test("todayVN: 17:00 UTC thuộc ngày VN kế tiếp", () => {
  assert.equal(todayVN(at("2026-10-30T17:00:00Z")), "2026-10-31");
});

test("addDays qua ranh giới tháng/năm/năm nhuận", () => {
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(addDays("2028-03-01", -1), "2028-02-29");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  assert.equal(addDays("2025-12-31", 1), "2026-01-01");
});

test("isValidYmd", () => {
  assert.equal(isValidYmd("2026-10-01"), true);
  assert.equal(isValidYmd("2028-02-29"), true);
  assert.equal(isValidYmd("2026-02-30"), false);
  assert.equal(isValidYmd("2026-13-40"), false);
  assert.equal(isValidYmd("2026/10/01"), false);
  assert.equal(isValidYmd("abc"), false);
  assert.equal(isValidYmd(""), false);
});

test("daysBetweenInclusive", () => {
  assert.equal(daysBetweenInclusive("2026-10-01", "2026-10-01"), 1);
  assert.equal(daysBetweenInclusive("2026-10-01", "2026-10-31"), 31);
});

test("mặc định (không gửi gì) = this_month", () => {
  const r = resolveReportRange({ now: at("2026-10-30T05:00:00Z") });
  assert.deepEqual(r, { start: "2026-10-01", end: "2026-10-30", days: 30 });
});

test("this_month lúc 00:30 mùng 1 giờ VN là tháng mới", () => {
  // 2026-11-01 00:30 +07:00 = 2026-10-31 17:30 UTC
  const now = at("2026-10-31T17:30:00Z");
  assert.deepEqual(resolveReportRange({ preset: "this_month", now }), {
    start: "2026-11-01",
    end: "2026-11-01",
    days: 1,
  });
  assert.deepEqual(resolveReportRange({ preset: "last_month", now }), {
    start: "2026-10-01",
    end: "2026-10-31",
    days: 31,
  });
});

test("last_month của tháng 1 là tháng 12 năm trước", () => {
  const r = resolveReportRange({
    preset: "last_month",
    now: at("2026-01-15T05:00:00Z"),
  });
  assert.deepEqual(r, { start: "2025-12-01", end: "2025-12-31", days: 31 });
});

test("last_month năm nhuận 29 ngày", () => {
  const r = resolveReportRange({
    preset: "last_month",
    now: at("2028-03-10T05:00:00Z"),
  });
  assert.deepEqual(r, { start: "2028-02-01", end: "2028-02-29", days: 29 });
});

test("last7 ngày 03/01 qua năm", () => {
  const r = resolveReportRange({
    preset: "last7",
    now: at("2026-01-03T05:00:00Z"),
  });
  assert.deepEqual(r, { start: "2025-12-28", end: "2026-01-03", days: 7 });
});

test("today / yesterday", () => {
  const now = at("2026-10-30T05:00:00Z");
  assert.deepEqual(resolveReportRange({ preset: "today", now }), {
    start: "2026-10-30",
    end: "2026-10-30",
    days: 1,
  });
  assert.deepEqual(resolveReportRange({ preset: "yesterday", now }), {
    start: "2026-10-29",
    end: "2026-10-29",
    days: 1,
  });
});

test("custom hợp lệ, start = end", () => {
  const r = resolveReportRange({
    preset: "custom",
    start_date: "2026-10-05",
    end_date: "2026-10-05",
  });
  assert.deepEqual(r, { start: "2026-10-05", end: "2026-10-05", days: 1 });
});

test("custom đúng 366 ngày OK, 367 ngày lỗi", () => {
  const ok = resolveReportRange({
    preset: "custom",
    start_date: "2027-01-01",
    end_date: "2027-12-31",
  });
  assert.equal(ok.days, 365);
  const edge = resolveReportRange({
    preset: "custom",
    start_date: "2028-01-01",
    end_date: "2028-12-31",
  });
  assert.equal(edge.days, 366);
  assert.throws(
    () =>
      resolveReportRange({
        preset: "custom",
        start_date: "2028-01-01",
        end_date: "2029-01-01",
      }),
    ReportRangeError,
  );
});

test("lỗi: định dạng, ngày không có thật, đảo, thiếu, preset lạ", () => {
  const bad = (p: Parameters<typeof resolveReportRange>[0]) =>
    assert.throws(() => resolveReportRange(p), ReportRangeError);

  bad({ preset: "custom", start_date: "2026/10/01", end_date: "2026-10-02" });
  bad({ preset: "custom", start_date: "2026-02-30", end_date: "2026-03-02" });
  bad({ preset: "custom", start_date: "0001-01-01", end_date: "9999-12-31" });
  bad({ preset: "custom", start_date: "2026-10-05", end_date: "2026-10-04" });
  bad({ preset: "custom", start_date: "2026-10-05" });
  bad({ preset: "custom", end_date: "2026-10-05" });
  bad({ preset: "custom" });
  bad({ preset: "custom", start_date: "", end_date: "" });
  bad({ preset: "forever" });
  bad({ preset: "" });
  // gửi ngày sai không có preset: không rơi về mặc định
  bad({ start_date: "abc", end_date: "2026-10-05" });
});

test("preset không phải custom bỏ qua start/end", () => {
  const r = resolveReportRange({
    preset: "today",
    start_date: "abc",
    end_date: "xyz",
    now: at("2026-10-30T05:00:00Z"),
  });
  assert.equal(r.start, "2026-10-30");
});
