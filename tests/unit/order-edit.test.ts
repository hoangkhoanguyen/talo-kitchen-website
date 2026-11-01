/**
 * Test logic sửa đơn + tổng tiền bill (src/lib/order-edit.ts).
 * Chạy: npx tsx --test tests/unit/order-edit.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canEditOrder,
  computeBillTotals,
  computeItemTotal,
  computeOrderTotal,
  filterVisibleItems,
} from "@/lib/order-edit";

// Đơn mẫu: 2 item bật + 1 item tắt, ship 30.000
const items = [
  { totalPrice: 100000, isEnabled: true },
  { totalPrice: 50000, isEnabled: true },
  { totalPrice: 40000, isEnabled: false },
];
const shipping = 30000;

test("canEditOrder: chỉ pending/processing", () => {
  assert.equal(canEditOrder({ status: "pending" }), true);
  assert.equal(canEditOrder({ status: "processing" }), true);
  assert.equal(canEditOrder({ status: "completed" }), false);
  assert.equal(canEditOrder({ status: "cancelled" }), false);
});

test("computeItemTotal: price*qty + addon", () => {
  assert.equal(computeItemTotal(45000, 2), 90000);
  assert.equal(
    computeItemTotal(45000, 2, [
      { price: 5000, quantity: 1 },
      { price: 10000, quantity: 3 },
    ]),
    90000 + 5000 + 30000,
  );
});

test("computeOrderTotal: gồm cả item tắt + ship (giá trị lưu DB)", () => {
  assert.equal(computeOrderTotal(items, shipping), 220000);
  assert.equal(computeOrderTotal([], shipping), 30000);
});

test("filterVisibleItems: talo_kitchen thấy hết, tài khoản thường bỏ item tắt", () => {
  assert.equal(filterVisibleItems(items, true).length, 3);
  assert.equal(filterVisibleItems(items, false).length, 2);
  // field isEnabled bị omit (undefined) → coi là bật
  const omitted = [{ totalPrice: 1 }];
  assert.equal(filterVisibleItems(omitted, false).length, 1);
});

test("bill talo_kitchen: subtotal gồm item tắt, total = subtotal + ship", () => {
  const b = computeBillTotals(filterVisibleItems(items, true), shipping);
  assert.deepEqual(b, { subtotal: 190000, shippingFee: 30000, total: 220000 });
});

test("bill tài khoản thường: loại item tắt, ship vẫn tính", () => {
  const b = computeBillTotals(filterVisibleItems(items, false), shipping);
  assert.deepEqual(b, { subtotal: 150000, shippingFee: 30000, total: 180000 });
});

test("bill không có ship: hiển thị 0", () => {
  const b = computeBillTotals(filterVisibleItems(items, false), 0);
  assert.deepEqual(b, { subtotal: 150000, shippingFee: 0, total: 150000 });
});

test("sau khi sửa: tổng DB tính lại từ TẤT CẢ item, tài khoản thường trừ item tắt", () => {
  // đổi item 2 từ 50.000 -> 100.000
  const edited = [items[0], { ...items[1], totalPrice: 100000 }, items[2]];
  const dbTotal = computeOrderTotal(edited, shipping);
  assert.equal(dbTotal, 270000);
  const disabled = edited
    .filter((i) => !i.isEnabled)
    .reduce((a, i) => a + i.totalPrice, 0);
  assert.equal(dbTotal - disabled, 230000); // hiển thị cho tài khoản thường
});
