import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/admin/auth";
import type { LoginFormData } from "@/validations/auth";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: LoginFormData) => loginAction(formData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Đăng nhập thành công!", {
          description: `Chào mừng ${
            data.user?.firstName || data.user?.username || "bạn"
          }!`,
        });

        // Reload trang hiện tại để cập nhật authentication state
        router.refresh();
      } else {
        // Handle business logic errors from action
        toast.error(data.error || "Đăng nhập thất bại", {
          description: "Vui lòng kiểm tra lại thông tin đăng nhập",
        });
      }
    },
    onError: (error: any) => {
      // Handle unexpected errors (network, server, etc.)
      console.error("Login error:", error);
      toast.error("Có lỗi xảy ra", {
        description: error?.message || "Không thể kết nối đến server",
      });
    },
  });
}
