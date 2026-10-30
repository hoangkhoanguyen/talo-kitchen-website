/**
 * Test computeOrderRevenue (src/lib/report-revenue.ts).
 * Chạy: npx tsx --test tests/unit/order-revenue.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeOrderRevenue } from "@/lib/report-revenue";

test("talo_kitchen không trừ item tắt", () => {
  assert.equal(computeOrderRevenue(100000, 30000, true), 100000);
});

test("tài khoản thường trừ item tắt", () => {
  assert.equal(computeOrderRevenue(100000, 30000, false), 70000);
});

test("toàn bộ item tắt: còn lại phí ship", () => {
  assert.equal(computeOrderRevenue(115000, 100000, false), 15000);
});

test("làm tròn về đồng, giá trị lớn hơn 2^24", () => {
  assert.equal(computeOrderRevenue(25000.4, 0, false), 25000);
  assert.equal(computeOrderRevenue(16777216, 0.4, false), 16777216);
});
