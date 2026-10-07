"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import adminApi from "@/lib/api/axios";
import { adminRoutes } from "@/constants/route";

/**
 * Access token đã hết hạn lúc server render (layout chỉ đọc cookie, không ghi
 * được). Gọi refresh ở client rồi render lại trang với token mới. Nếu refresh
 * thất bại, interceptor của adminApi sẽ logout và về trang login.
 */
export default function TokenRefresher() {
  const router = useRouter();

  useEffect(() => {
    adminApi
      .post(adminRoutes.refreshTokenApi())
      .then(() => router.refresh())
      .catch(() => {});
  }, [router]);

  return null;
}
