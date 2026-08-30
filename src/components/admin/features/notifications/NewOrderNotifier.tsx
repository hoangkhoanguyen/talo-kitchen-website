"use client";
import { useEffect } from "react";
import { useNewOrdersNotifier } from "@/hooks/admin/features/orders/useNewOrdersNotifier";
import { useNotificationSettings } from "@/store/notification-settings";
import NewOrderPopup from "./NewOrderPopup";

/**
 * Component thông báo đơn mới, mount 1 lần ở admin dashboard layout.
 * Chạy vòng poll (5s) + phát âm báo, và hiển thị popup gom các đơn chưa xem.
 */
const NewOrderNotifier = () => {
  const hydrate = useNotificationSettings((s) => s.hydrate);

  // nạp âm lượng/tắt tiếng đã lưu (localStorage) sau khi mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useNewOrdersNotifier();

  return <NewOrderPopup />;
};

export default NewOrderNotifier;
