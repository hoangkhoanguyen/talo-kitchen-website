import moment from "moment";

// Việt Nam là UTC+7 cố định (không có DST) → offset không đổi quanh năm.
const VN_UTC_OFFSET_MINUTES = 7 * 60;

/**
 * Format một MỐC THỜI GIAN THỰC (timestamp: createdAt/updatedAt...) theo
 * múi giờ Việt Nam (UTC+7), bất kể đang chạy ở server (Vercel=UTC) hay
 * client (trình duyệt tz bất kỳ) → luôn ra cùng một giờ VN.
 *
 * KHÔNG dùng cho arrivalDate/arrivalTime của đặt bàn — đó là giờ "wall-clock"
 * khách chọn (kiểu date/time không kèm tz), cộng thêm +7 sẽ bị sai.
 */
export function formatDateVN(
  value: moment.MomentInput,
  format = "YYYY-MM-DD HH:mm:ss",
) {
  return moment(value).utcOffset(VN_UTC_OFFSET_MINUTES).format(format);
}
