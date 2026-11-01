/**
 * Test addDineInMethod (scripts/add-dine-in-method.ts) — idempotent, no DB.
 * Chạy: npx tsx --test tests/unit/add-dine-in-method.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { addDineInMethod } from "../../scripts/add-dine-in-method";
import type { Config } from "@/types/configs";

const base = (methods: unknown[]) =>
  ({ shipping: { methods, rules: [{ minOrderValue: 0, shippingFee: 1 }] } }) as unknown as Config;

test("thêm dineIn dạng chuỗi khi config chưa localize", () => {
  const out = addDineInMethod(
    base([{ method: "door2door", label: "A", description: "B", isDefault: true }]),
  ) as any;
  assert.equal(out.shipping.methods.length, 2);
  assert.equal(out.shipping.methods[1].method, "dineIn");
  assert.equal(out.shipping.methods[1].label, "Dine-in");
  assert.equal(out.shipping.methods[1].isDefault, false);
  assert.equal(out.shipping.rules.length, 1);
});

test("thêm dineIn dạng { en, vi } khi config đã localize", () => {
  const out = addDineInMethod(
    base([{ method: "pickup", label: { en: "A", vi: "B" }, description: { en: "", vi: "" } }]),
  ) as any;
  assert.deepEqual(out.shipping.methods[1].label, { en: "Dine-in", vi: "Ăn tại quán" });
});

test("idempotent: đã có dineIn thì trả null", () => {
  assert.equal(addDineInMethod(base([{ method: "dineIn" }])), null);
  const once = addDineInMethod(base([])) as Config;
  assert.equal(addDineInMethod(once), null);
});
