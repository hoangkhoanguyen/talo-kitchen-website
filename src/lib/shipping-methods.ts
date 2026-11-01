import { shippingInitValue } from "@/constants/settings/app/order/shipping";

type ShippingMethodConfig = { method: string; isDefault?: boolean } & Record<
  string,
  unknown
>;

/**
 * Bù các phương thức giao hàng có trong code (shippingInitValue) nhưng chưa có
 * trong config "order" đã lưu ở DB (vd: dineIn thêm sau khi config đã khởi tạo).
 * - Giữ nguyên thứ tự + nội dung các phương thức đã lưu (admin đã chỉnh label/mô tả).
 * - Phương thức bù thêm luôn isDefault = false để không tranh mặc định với cái đã lưu.
 * Áp dụng SAU khi đọc cache → deploy là có, không cần migrate data hay xoá cache.
 */
export function mergeShippingMethods(
  stored: ShippingMethodConfig[] | null | undefined,
  defaults: ShippingMethodConfig[] = shippingInitValue.methods as ShippingMethodConfig[],
): ShippingMethodConfig[] {
  const current = Array.isArray(stored) ? stored : [];
  const existing = new Set(current.map((m) => m.method));
  const missing = defaults
    .filter((m) => !existing.has(m.method))
    .map((m) => ({ ...m, isDefault: false }));
  return [...current, ...missing];
}

/** Trả về bản sao value của config "order" với danh sách shipping.methods đã được bù. */
export function withDefaultShippingMethods<T>(orderValue: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = orderValue as Record<string, any> | null | undefined;
  if (!value?.shipping) return orderValue;
  return {
    ...value,
    shipping: {
      ...value.shipping,
      methods: mergeShippingMethods(value.shipping.methods),
    },
  } as T;
}
