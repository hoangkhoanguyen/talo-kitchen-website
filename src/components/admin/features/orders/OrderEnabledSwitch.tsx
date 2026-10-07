"use client";
import React, { FC } from "react";
import useToggleOrderEnabled from "@/hooks/admin/features/orders/useToggleOrderEnabled";

const OrderEnabledSwitch: FC<{ orderId: number; isEnabled: boolean }> = ({
  orderId,
  isEnabled,
}) => {
  const { mutate, isPending } = useToggleOrderEnabled();

  return (
    <label className="card p-5 bg-white flex flex-row items-center justify-between cursor-pointer">
      <div>
        <h2 className="card-title">Hiển thị đơn hàng</h2>
        <p className="text-sm text-gray-500 mt-1">
          Khi tắt, các tài khoản khác sẽ không thấy đơn này.
        </p>
      </div>
      <input
        type="checkbox"
        className="toggle toggle-primary"
        checked={isEnabled}
        disabled={isPending}
        onChange={(e) => mutate({ orderId, isEnabled: e.target.checked })}
      />
    </label>
  );
};

export default OrderEnabledSwitch;
