"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { registerAction } from "@/actions/admin/auth";
import type { RegisterFormData } from "@/validations/auth";

export function useRegister() {
  return useMutation({
    mutationFn: (formData: RegisterFormData) => registerAction(formData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Tạo tài khoản thành công!", {
          description: `Tài khoản ${data.user?.username} đã được tạo`,
        });
      } else {
        // Handle business logic errors from action
        toast.error(data.error || "Tạo tài khoản thất bại", {
          description: "Vui lòng kiểm tra lại thông tin",
        });
      }
    },
    onError: (error: any) => {
      // Handle unexpected errors (network, server, etc.)
      console.error("Register error:", error);
      toast.error("Có lỗi xảy ra", {
        description: "Vui lòng thử lại sau",
      });
    },
  });
}
