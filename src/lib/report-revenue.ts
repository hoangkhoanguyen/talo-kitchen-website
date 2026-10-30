/**
 * Doanh thu của một đơn (RULE-08/10): tài khoản thường trừ tổng item đã tắt,
 * talo_kitchen giữ nguyên totalPrice. Làm tròn về đồng nguyên.
 */
export function computeOrderRevenue(
  totalPrice: number,
  disabledItemsTotal: number,
  includeDisabled: boolean,
) {
  return Math.round(totalPrice - (includeDisabled ? 0 : disabledItemsTotal));
}
