/**
 * Test nhãn thanh toán và doanh thu đơn của báo cáo.
 * Chạy: npx tsx --test tests/unit/payment-label.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupPayments,
  normalizePaymentLabel,
  PAYMENT_UNKNOWN_LABEL,
} from "@/constants/reports";

const row = (paymentMethod: string, orderCount: number, revenue: number) => ({
  paymentMethod,
  orderCount,
  shippingFee: 1000 * orderCount,
  revenue,
});

test("cash và cash_on_delivery gộp thành Tiền mặt", () => {
  const groups = groupPayments([
    row("cash", 2, 100),
    row("cash_on_delivery", 3, 200),
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0], {
    label: "Tiền mặt",
    orderCount: 5,
    shippingFee: 5000,
    revenue: 300,
  });
});

test("rỗng/khoảng trắng -> Chưa xác định", () => {
  assert.equal(normalizePaymentLabel(""), PAYMENT_UNKNOWN_LABEL);
  assert.equal(normalizePaymentLabel("   "), PAYMENT_UNKNOWN_LABEL);
  assert.equal(normalizePaymentLabel(null), PAYMENT_UNKNOWN_LABEL);
});

test("giá trị lạ giữ nguyên (đã trim), phân biệt hoa/thường", () => {
  assert.equal(normalizePaymentLabel(" bank_transfer "), "bank_transfer");
  assert.equal(normalizePaymentLabel("CASH"), "CASH");
  assert.equal(normalizePaymentLabel("=SUM(A1)"), "=SUM(A1)");
  // không dính thuộc tính prototype
  assert.equal(normalizePaymentLabel("constructor"), "constructor");
});

test("sắp theo doanh thu giảm dần, Chưa xác định luôn cuối", () => {
  const groups = groupPayments([
    row("", 1, 9999),
    row("momo", 1, 50),
    row("cash", 1, 500),
    row("CASH", 1, 70),
  ]);
  assert.deepEqual(
    groups.map((g) => g.label),
    ["Tiền mặt", "CASH", "momo", PAYMENT_UNKNOWN_LABEL],
  );
});

test("không có dòng -> mảng rỗng", () => {
  assert.deepEqual(groupPayments([]), []);
});
