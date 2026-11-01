/**
 * Giá theo khung giờ (Happy Hour) — logic thuần, không đụng DB.
 *
 * - Server Vercel chạy UTC → mọi quyết định theo giờ quy về giờ VN (UTC+7, không DST).
 * - Khung giờ là [startMinute, endMinute) trong ngày VN.
 * - Nhiều khung/chương trình cùng khớp → lấy giá THẤP NHẤT.
 * - Giá khung ≥ giá gốc → bỏ qua (không bao giờ làm tăng giá).
 * - Chỉ áp cho giá món chính; addon giữ giá.
 */

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;
export const MINUTES_PER_DAY = 24 * 60;

export type PriceSlot = {
  daysOfWeek: number[]; // 0 = CN … 6 = T7
  startMinute: number;
  endMinute: number;
  price: number;
};

export type PriceProgramRule = {
  id: number;
  productIds: number[];
  slots: PriceSlot[];
};

export type EffectivePrice = {
  price: number;
  originalPrice: number;
  programId: number | null;
  /** Thời điểm (tuyệt đối) giá hiện tại hết hiệu lực; null = không áp giá khung. */
  endsAt: Date | null;
};

/** Thứ (0 = CN) và phút trong ngày theo giờ VN. */
export function toVNClock(now: Date) {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  return {
    day: vn.getUTCDay(),
    minute: vn.getUTCHours() * 60 + vn.getUTCMinutes(),
  };
}

/** "HH:mm" ↔ phút trong ngày (24:00 = 1440 dùng cho giờ kết thúc). */
export function minuteToHHmm(minute: number) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMinute(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (m > 59 || h > 24 || (h === 24 && m !== 0)) return null;
  return h * 60 + m;
}

export function getEffectivePrice(
  productId: number,
  basePrice: number,
  programs: PriceProgramRule[],
  now: Date = new Date(),
): EffectivePrice {
  const { day, minute } = toVNClock(now);
  let best: { price: number; programId: number; endMinute: number } | null =
    null;

  for (const program of programs) {
    if (!program.productIds.includes(productId)) continue;
    for (const slot of program.slots) {
      if (!slot.daysOfWeek.includes(day)) continue;
      if (minute < slot.startMinute || minute >= slot.endMinute) continue;
      if (!(slot.price > 0) || slot.price >= basePrice) continue;
      if (!best || slot.price < best.price) {
        best = { price: slot.price, programId: program.id, endMinute: slot.endMinute };
      }
    }
  }

  if (!best) {
    return { price: basePrice, originalPrice: basePrice, programId: null, endsAt: null };
  }

  // Mốc kết thúc = đầu phút hiện tại + (endMinute - minute) phút
  const startOfMinute = Math.floor(now.getTime() / MS_PER_MINUTE) * MS_PER_MINUTE;
  const endsAt = new Date(startOfMinute + (best.endMinute - minute) * MS_PER_MINUTE);

  return {
    price: best.price,
    originalPrice: basePrice,
    programId: best.programId,
    endsAt,
  };
}

export type PricedFields = {
  price: number;
  originalPrice: number | null;
  priceEndsAt: string | null;
};

/** Gắn giá hiệu lực vào sản phẩm (dùng cho dữ liệu trả về web/admin). */
export function withEffectivePrice<T extends { id: number; price: number }>(
  product: T,
  programs: PriceProgramRule[],
  now: Date = new Date(),
): T & PricedFields {
  const eff = getEffectivePrice(product.id, product.price, programs, now);
  return {
    ...product,
    price: eff.price,
    originalPrice: eff.programId ? eff.originalPrice : null,
    priceEndsAt: eff.endsAt ? eff.endsAt.toISOString() : null,
  };
}

/** Giá sớm nhất hết hiệu lực trong danh sách (để client hẹn giờ refresh). */
export function earliestEndsAt(items: { priceEndsAt?: string | null }[]) {
  let min: string | null = null;
  for (const item of items) {
    if (item.priceEndsAt && (!min || item.priceEndsAt < min)) min = item.priceEndsAt;
  }
  return min;
}
