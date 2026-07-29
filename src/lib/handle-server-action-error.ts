import { toast } from "sonner";

/**
 * Hàm xử lý lỗi chung cho server action
 * - Nếu code là UNAUTHORIZED: refresh trang để middleware tự redirect
 * - Nếu có error khác: toast error
 *
 * @param code - mã lỗi trả về từ server action
 * @param error - thông báo lỗi trả về từ server action
 */
export function handleServerActionError(code?: string, error?: string) {
  if (code === "UNAUTHORIZED") {
    toast.error("Phiên đăng nhập đã hết hạn. Đang tải lại trang...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    return;
  }

  if (error) {
    toast.error(error || "Có lỗi xảy ra");
  }
}
