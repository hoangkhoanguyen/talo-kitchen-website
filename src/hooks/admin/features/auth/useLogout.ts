import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/admin/auth";

export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: () => logoutAction(),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Đăng xuất thành công!", {
          description: "Hẹn gặp lại bạn",
        });

        // Reload trang hiện tại để clear authentication state
        router.refresh();
      } else {
        toast.error("Có lỗi khi đăng xuất", {
          description: "Vui lòng thử lại",
        });
      }
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      toast.error("Có lỗi xảy ra", {
        description: error?.message || "Không thể đăng xuất",
      });
    },
  });
}
