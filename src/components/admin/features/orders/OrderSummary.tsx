import { formatCurrency } from "@/lib/utils";
import { AdminOrderDetails } from "@/types/orders";
import moment from "moment";
import React, { FC } from "react";

const OrderSummary: FC<{
  data: Pick<
    AdminOrderDetails,
    "createdAt" | "paymentMethod" | "totalPrice" | "shippingFee"
  >;
}> = ({ data }) => {
  return (
    <div className="card p-5 bg-white">
      <h2 className="card-title">Order Summary</h2>
      <div className="mt-4 flex flex-col gap-3">
        <div>
          <h3 className="font-medium text-gray-500 text-sm">Created at</h3>
          <p className="text-gray-700 font-semibold">{data.createdAt}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-500 text-sm">Payment</h3>
          <p className="text-gray-700 font-semibold">Only Cash</p>
        </div>
        <hr className="border-gray-200" />
        <div className="flex flex-row justify-between">
          <span className="text-gray-700 font-semibold">Subtotal</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(data.totalPrice - data.shippingFee)}
          </span>
        </div>
        <div className="flex flex-row justify-between">
          <span className="text-gray-700 font-semibold">Delivery Fee</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(data.shippingFee)}
          </span>
        </div>
        <hr className="border-gray-200" />
        <div className="flex flex-row justify-between">
          <span className="text-gray-700 font-semibold">Total</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(data.totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
