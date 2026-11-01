/**
 * Test bù phương thức giao hàng (src/lib/shipping-methods.ts).
 * Chạy: npx tsx --test tests/unit/shipping-methods.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mergeShippingMethods,
  withDefaultShippingMethods,
} from "@/lib/shipping-methods";

const defaults = [
  { method: "door2door", label: "Door", isDefault: true },
  { method: "pickup", label: "Pickup", isDefault: false },
  { method: "dineIn", label: "Dine-in", isDefault: true },
];

test("bù phương thức còn thiếu, giữ nguyên cái đã lưu, cái bù luôn isDefault=false", () => {
  const stored = [
    { method: "pickup", label: "Lấy tại quán (admin sửa)", isDefault: true },
    { method: "door2door", label: "Giao tận nơi", isDefault: false },
  ];
  const result = mergeShippingMethods(stored, defaults);
  assert.deepEqual(result.slice(0, 2), stored);
  assert.equal(result.length, 3);
  assert.equal(result[2].method, "dineIn");
  assert.equal(result[2].isDefault, false);
});

test("không nhân bản khi DB đã có đủ", () => {
  const stored = defaults.map((m) => ({ ...m }));
  assert.equal(mergeShippingMethods(stored, defaults).length, 3);
});

test("stored rỗng/null → dùng defaults", () => {
  assert.equal(mergeShippingMethods(null, defaults).length, 3);
});

test("withDefaultShippingMethods dùng defaults thật trong code (có dineIn), không đụng rules", () => {
  const value = {
    shipping: {
      methods: [{ method: "door2door", label: "D", isDefault: true }],
      rules: [{ minOrderValue: 0, shippingFee: 30000 }],
    },
  };
  const result = withDefaultShippingMethods(value);
  const methods = result.shipping.methods.map(
    (m: { method: string }) => m.method,
  );
  assert.ok(methods.includes("dineIn"));
  assert.ok(methods.includes("pickup"));
  assert.deepEqual(result.shipping.rules, value.shipping.rules);
  assert.equal(value.shipping.methods.length, 1); // không mutate input
});
