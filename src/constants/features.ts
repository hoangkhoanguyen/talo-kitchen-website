/**
 * Cờ bật/tắt tính năng (hard-code). Đổi giá trị rồi deploy lại là xong.
 *
 * PRICE_PROGRAMS — Giá theo khung giờ (Happy Hour).
 *   false: ẩn hoàn toàn khỏi admin (menu, trang → 404, action bị chặn) và web
 *          (không áp giá khung giờ, không gạch giá); giá luôn = products.price.
 *   Lưu ý: vẫn cần chạy deploy/add-price-programs.sql vì order_items có 2 cột mới.
 */
export const FEATURES = {
  PRICE_PROGRAMS: false,
} as const;
