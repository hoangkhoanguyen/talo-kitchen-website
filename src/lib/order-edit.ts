/**
 * Logic thuần (không DB) cho việc sửa đơn hàng ở admin và tổng tiền trên bill.
 * Tách riêng để unit test được.
 *
 * Lưu ý cờ `is_enabled` (xem CLAUDE.md):
 * - `orders.total_price` trong DB luôn là tổng ĐẦY ĐỦ (cả item tắt) + phí ship.
 * - Tài khoản thường chỉ thấy item bật; tổng hiển thị = totalPrice - Σ item tắt.
 */

export const EDITABLE_ORDER_STATUSES = ["pending", "processing"] as const;

export const MAX_ITEM_QUANTITY = 99;
export const MAX_ADDON_QUANTITY = 99;
export const MAX_ITEM_NOTE_LENGTH = 300;

/** Chỉ đơn pending/processing mới sửa được (completed/cancelled → chỉ đọc). */
export function canEditOrder(order: { status: string }) {
  return (EDITABLE_ORDER_STATUSES as readonly string[]).includes(order.status);
}

/** totalPrice của một item = price * quantity + Σ(addon price * addon quantity). */
export function computeItemTotal(
  price: number,
  quantity: number,
  addons: { price: number; quantity: number }[] = [],
) {
  return (
    price * quantity +
    addons.reduce((acc, addon) => acc + addon.price * addon.quantity, 0)
  );
}

/**
 * Tổng tiền lưu trong DB: Σ totalPrice của TẤT CẢ item (kể cả item tắt) + phí ship.
 * Phí ship không bị ảnh hưởng bởi cờ item.
 */
export function computeOrderTotal(
  items: { totalPrice: number }[],
  shippingFee: number,
) {
  return items.reduce((acc, item) => acc + item.totalPrice, 0) + shippingFee;
}

/** Item mà tài khoản được thấy: talo_kitchen thấy hết, tài khoản thường chỉ thấy item bật. */
export function filterVisibleItems<T extends object>(
  items: T[],
  includeDisabled: boolean,
) {
  return includeDisabled
    ? items
    : items.filter((i) => (i as { isEnabled?: boolean }).isEnabled !== false);
}

/**
 * Số liệu trên bill: subtotal = Σ totalPrice các item truyền vào (đã lọc theo tài khoản),
 * total = subtotal + phí ship. Phí ship luôn hiển thị (0 nếu không có).
 */
export function computeBillTotals(
  items: { totalPrice: number }[],
  shippingFee: number,
) {
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const fee = shippingFee || 0;
  return { subtotal, shippingFee: fee, total: subtotal + fee };
}
