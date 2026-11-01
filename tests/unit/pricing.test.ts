/**
 * Test giá theo khung giờ (src/lib/pricing.ts).
 * Chạy: npx tsx --test tests/unit/pricing.test.ts
 * Nên chạy thêm với TZ khác: TZ=America/New_York npx tsx --test tests/unit/pricing.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  earliestEndsAt,
  getEffectivePrice,
  hhmmToMinute,
  minuteToHHmm,
  toVNClock,
  withEffectivePrice,
  type PriceProgramRule,
} from "@/lib/pricing";

// Giờ VN → Date (UTC = VN - 7h). 2026-11-02 là Thứ 2.
const vn = (ymd: string, hm: string) => new Date(`${ymd}T${hm}:00+07:00`);
const MON = "2026-11-02";
const THU = "2026-11-05";
const FRI = "2026-11-06";
const SUN = "2026-11-08";

const happyHour: PriceProgramRule = {
  id: 1,
  productIds: [10, 11],
  slots: [{ daysOfWeek: [1, 2, 3, 4], startMinute: 960, endMinute: 1260, price: 150000 }],
};
const price = (now: Date, productId = 10, base = 180000, programs = [happyHour]) =>
  getEffectivePrice(productId, base, programs, now).price;

test("toVNClock không phụ thuộc TZ máy", () => {
  assert.deepEqual(toVNClock(new Date("2026-11-05T09:30:00Z")), { day: 4, minute: 990 });
  assert.deepEqual(toVNClock(new Date("2026-11-08T23:30:00Z")), { day: 1, minute: 390 });
});

test("mốc giờ T2–T5 16:00–21:00", () => {
  assert.equal(price(vn(MON, "15:59")), 180000);
  assert.equal(price(vn(MON, "16:00")), 150000);
  assert.equal(price(vn(THU, "20:59")), 150000);
  assert.equal(price(vn(THU, "21:00")), 180000);
  assert.equal(price(vn(FRI, "17:00")), 180000);
  assert.equal(price(vn(SUN, "17:00")), 180000);
});

test("theo UTC: 09:30Z thứ 5 = 16:30 VN; 23:30Z CN = 06:30 T2 VN", () => {
  assert.equal(price(new Date("2026-11-05T09:30:00Z")), 150000);
  assert.equal(price(new Date("2026-11-08T23:30:00Z")), 180000);
});

test("món không thuộc chương trình → giá gốc", () => {
  const r = getEffectivePrice(99, 180000, [happyHour], vn(MON, "17:00"));
  assert.deepEqual(r, { price: 180000, originalPrice: 180000, programId: null, endsAt: null });
});

test("nhiều khung trong 1 chương trình", () => {
  const p: PriceProgramRule = {
    id: 2,
    productIds: [10],
    slots: [
      { daysOfWeek: [6], startMinute: 600, endMinute: 720, price: 120000 },
      { daysOfWeek: [6], startMinute: 1200, endMinute: 1440, price: 130000 },
    ],
  };
  const SAT = "2026-11-07";
  assert.equal(price(vn(SAT, "10:30"), 10, 180000, [p]), 120000);
  assert.equal(price(vn(SAT, "15:00"), 10, 180000, [p]), 180000);
  assert.equal(price(vn(SAT, "23:59"), 10, 180000, [p]), 130000);
});

test("chồng chương trình → giá thấp nhất; giá ≥ gốc bị bỏ qua", () => {
  const cheaper: PriceProgramRule = {
    id: 3,
    productIds: [10],
    slots: [{ daysOfWeek: [1], startMinute: 1020, endMinute: 1080, price: 140000 }],
  };
  const higher: PriceProgramRule = {
    id: 4,
    productIds: [10],
    slots: [{ daysOfWeek: [1], startMinute: 0, endMinute: 1440, price: 200000 }],
  };
  const r = getEffectivePrice(10, 180000, [happyHour, cheaper, higher], vn(MON, "17:30"));
  assert.equal(r.price, 140000);
  assert.equal(r.programId, 3);
  assert.equal(price(vn(MON, "12:00"), 10, 180000, [higher]), 180000);
});

test("endsAt = mốc kết thúc khung đang áp", () => {
  const r = getEffectivePrice(10, 180000, [happyHour], new Date(`${MON}T20:15:42+07:00`));
  assert.equal(r.endsAt?.toISOString(), vn(MON, "21:00").toISOString());
});

test("withEffectivePrice + earliestEndsAt", () => {
  const now = vn(MON, "17:00");
  const a = withEffectivePrice({ id: 10, price: 180000 }, [happyHour], now);
  const b = withEffectivePrice({ id: 99, price: 50000 }, [happyHour], now);
  assert.equal(a.price, 150000);
  assert.equal(a.originalPrice, 180000);
  assert.equal(b.originalPrice, null);
  assert.equal(earliestEndsAt([a, b]), vn(MON, "21:00").toISOString());
});

test("HH:mm ↔ phút", () => {
  assert.equal(hhmmToMinute("16:00"), 960);
  assert.equal(hhmmToMinute("24:00"), 1440);
  assert.equal(hhmmToMinute("24:01"), null);
  assert.equal(hhmmToMinute("9:5"), null);
  assert.equal(minuteToHHmm(1260), "21:00");
});
