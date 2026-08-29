"use client";
import { useNewOrdersNotifier } from "@/hooks/admin/features/orders/useNewOrdersNotifier";
import NewOrderPopup from "./NewOrderPopup";

/**
 * Component thông báo đơn mới, mount 1 lần ở admin dashboard layout.
 * Chạy vòng poll (10s) + phát beep, và hiển thị popup gom các đơn chưa xem.
 */
const NewOrderNotifier = () => {
  useNewOrdersNotifier();
  return <NewOrderPopup />;
};

export default NewOrderNotifier;
