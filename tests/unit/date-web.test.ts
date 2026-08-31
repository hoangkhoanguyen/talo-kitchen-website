/**
 * Throwaway self-verification tests for src/lib/date-web.ts (TASK-03,
 * sprint-4-i18n-polish). Run with: npx tsx --test tests/unit/date-web.test.ts
 *
 * Covers: AC-06.1, AC-06.2, AC-06.3, EC-08 (null/malformed -> ""),
 * EC-09 / RULE-09 (no timezone shift, wall-clock only).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatReservationDate,
  formatReservationTime,
} from "@/lib/date-web";

test("formatReservationDate: vi -> DD/MM/YYYY", () => {
  assert.equal(formatReservationDate("2026-08-31", "vi"), "31/08/2026");
});

test("formatReservationDate: en -> MM/DD/YYYY", () => {
  assert.equal(formatReservationDate("2026-08-31", "en"), "08/31/2026");
});

test("formatReservationDate: null/undefined/empty/malformed -> \"\"", () => {
  assert.equal(formatReservationDate(null, "vi"), "");
  assert.equal(formatReservationDate(undefined, "vi"), "");
  assert.equal(formatReservationDate("", "vi"), "");
  assert.equal(formatReservationDate("not-a-date", "vi"), "");
  assert.equal(formatReservationDate("2026-13-01", "vi"), "");
  assert.equal(formatReservationDate("2026-02-30", "vi"), "");
});

test("formatReservationTime: vi -> 24h HH:mm", () => {
  assert.equal(formatReservationTime("19:30:00", "vi"), "19:30");
});

test("formatReservationTime: en -> 12h h:mm A", () => {
  assert.equal(formatReservationTime("19:30:00", "en"), "7:30 PM");
});

test("formatReservationTime: null/undefined/empty/malformed -> \"\"", () => {
  assert.equal(formatReservationTime(null, "vi"), "");
  assert.equal(formatReservationTime(undefined, "vi"), "");
  assert.equal(formatReservationTime("", "vi"), "");
  assert.equal(formatReservationTime("25:00:00", "vi"), "");
  assert.equal(formatReservationTime("garbage", "vi"), "");
});

// ---------- TZ-safety: source value must never shift by ±1 day ----------
test("formatReservationDate: TZ-independent, no off-by-one-day shift", () => {
  // Explicitly assert against the exact source date, in whatever TZ this
  // process happens to run in (process.env.TZ / OS default). If the helper
  // built a local-time Date from a date-only string, this would risk
  // shifting to 30/08 or 01/09 depending on server TZ.
  assert.equal(formatReservationDate("2026-08-31", "vi"), "31/08/2026");
  assert.equal(formatReservationDate("2026-08-31", "en"), "08/31/2026");
  // boundary cases: first/last day of month/year
  assert.equal(formatReservationDate("2026-01-01", "vi"), "01/01/2026");
  assert.equal(formatReservationDate("2026-12-31", "vi"), "31/12/2026");
});
