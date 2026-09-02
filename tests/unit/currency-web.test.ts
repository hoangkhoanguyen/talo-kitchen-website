/**
 * Unit tests for locale-aware currency formatting (sprint-4-i18n-polish, TASK
 * covering formatCurrencyWebsite / formatCurrency in src/lib/utils.ts).
 * Run with: npx tsx --test tests/unit/currency-web.test.ts
 *
 * Covers: AC-05.1, AC-05.2, AC-05.3, AC-05.4, EC-07, RULE-07, RULE-10, ASM-02,
 * ASM-09 (value must not change, only display grouping/suffix).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCurrency, formatCurrencyWebsite } from "@/lib/utils";

test("AC-05.1: formatCurrencyWebsite vi -> dot grouping + VND suffix", () => {
  assert.equal(formatCurrencyWebsite(1_000_000, "vi"), "1.000.000 VND");
});

test("AC-05.2: formatCurrencyWebsite en -> comma grouping + VND suffix", () => {
  assert.equal(formatCurrencyWebsite(1_000_000, "en"), "1,000,000 VND");
});

test("AC-05.3/ASM-09: same amount round-trips to the same numeric value regardless of locale (only separators differ)", () => {
  const amount = 1_234_567;
  const vi = formatCurrencyWebsite(amount, "vi");
  const en = formatCurrencyWebsite(amount, "en");

  const parseBack = (s: string) =>
    Number(s.replace(" VND", "").replace(/[.,]/g, ""));

  assert.equal(parseBack(vi), amount);
  assert.equal(parseBack(en), amount);
  assert.notEqual(vi, en); // different grouping char proves locale actually applied
});

test("EC-07: amount = 0 -> '0 VND' for both locales", () => {
  assert.equal(formatCurrencyWebsite(0, "en"), "0 VND");
  assert.equal(formatCurrencyWebsite(0, "vi"), "0 VND");
});

test("EC-07: negative amount does not crash, still formats", () => {
  assert.doesNotThrow(() => formatCurrencyWebsite(-500, "en"));
  assert.equal(formatCurrencyWebsite(-500, "en"), "-500 VND");
});

test("RULE-10: no locale argument -> safe default (vi-VN grouping), does not throw", () => {
  assert.doesNotThrow(() => formatCurrencyWebsite(1_000_000));
  assert.equal(formatCurrencyWebsite(1_000_000), "1.000.000 VND");
});

test("AC-05.4/RULE-15: admin formatCurrency (Intl currency style) unaffected by web change, default vi-VN", () => {
  const result = formatCurrency(1_000_000);
  // Admin formatter keeps Intl currency-style output (symbol/code from Intl), not the "VND" suffix string.
  assert.match(result, /1\.000\.000/);
});

test("AC-05.4: formatCurrency still accepts explicit locale/currency args (signature unchanged)", () => {
  assert.doesNotThrow(() => formatCurrency(1_000_000, "en-US", "VND"));
});
