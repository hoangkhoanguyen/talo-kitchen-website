import { withEffectivePrice, type PricedFields } from "@/lib/pricing";
import { FEATURES } from "@/constants/features";
import { getActivePriceRulesCached } from "@/services/price-programs";

type Priceable = { id: number; price: number };

/** Áp giá theo khung giờ (giờ VN, lúc request) cho danh sách sản phẩm. */
export async function applyPricing<T extends Priceable>(
  items: T[],
  now: Date = new Date(),
): Promise<(T & PricedFields)[]> {
  if (!items.length) return items as (T & PricedFields)[];
  const rules = FEATURES.PRICE_PROGRAMS ? await getActivePriceRulesCached() : [];
  return items.map((item) => withEffectivePrice(item, rules, now));
}

export async function applyPricingOne<T extends Priceable>(
  item: T | null | undefined,
  now: Date = new Date(),
): Promise<(T & PricedFields) | null | undefined> {
  if (!item) return item;
  const [priced] = await applyPricing([item], now);
  return priced;
}
