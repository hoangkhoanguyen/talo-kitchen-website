"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// setTimeout tối đa ~24.8 ngày; khung giờ luôn ngắn hơn nhiều
const MAX_DELAY = 24 * 60 * 60 * 1000;

/**
 * Khi giá khung giờ hết hiệu lực (endsAt do SERVER tính), tải lại dữ liệu trang
 * để hiện giá mới. Không dùng đồng hồ client để quyết định giá.
 */
const PriceRefresher = ({ endsAt }: { endsAt?: string | null }) => {
  const router = useRouter();
  useEffect(() => {
    if (!endsAt) return;
    const delay = new Date(endsAt).getTime() - Date.now() + 1000;
    if (delay > MAX_DELAY) return;
    const timer = setTimeout(() => router.refresh(), Math.max(delay, 0));
    return () => clearTimeout(timer);
  }, [endsAt, router]);
  return null;
};

export default PriceRefresher;
