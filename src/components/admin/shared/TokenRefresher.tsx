"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import adminApi from "@/lib/api/axios";
import { adminRoutes } from "@/constants/route";

/** thử lại khi refresh lỗi tạm thời (mạng/server chậm) */
const RETRY_DELAYS = [2_000, 4_000, 8_000];

/**
 * Access token đã hết hạn lúc server render (layout chỉ đọc cookie, không ghi
 * được). Gọi refresh ở client rồi render lại trang với token mới.
 * - Refresh bị từ chối → interceptor của adminApi logout và về trang login.
 * - Lỗi tạm thời → thử lại vài lần; vẫn lỗi thì tải lại trang thay vì để trang
 *   trắng/treo mãi.
 */
export default function TokenRefresher() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const attempt = (i: number) => {
      adminApi
        .post(adminRoutes.refreshTokenApi())
        .then(() => {
          if (!cancelled) router.refresh();
        })
        .catch(() => {
          if (cancelled) return;
          if (i < RETRY_DELAYS.length) {
            timer = setTimeout(() => attempt(i + 1), RETRY_DELAYS[i]);
          } else {
            window.location.reload();
          }
        });
    };
    attempt(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [router]);

  return null;
}
