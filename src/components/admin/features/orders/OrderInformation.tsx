import { AdminOrderDetails } from "@/types/orders";
import React, { FC } from "react";

const OrderInformation: FC<{
  data: Pick<
    AdminOrderDetails,
    "customerName" | "customerPhone" | "code" | "orderTypeLabel" | "note"
  >;
}> = ({ data }) => {
  return (
    <div className="card p-5 bg-white">
      <h2 className="card-title">Order Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <h3 className="font-medium text-gray-500 text-sm">Customer Name</h3>
          <p className="text-gray-700 font-semibold">{data.customerName}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-500 text-sm">Customer Phone</h3>
          <p className="text-gray-700 font-semibold">{data.customerPhone}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-500 text-sm">Order Code</h3>
          <p className="text-gray-700 font-semibold">{data.code}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-500 text-sm">Shipping Method</h3>
          <p className="text-gray-700 font-semibold">{data.orderTypeLabel}</p>
        </div>
        {/* <div className="col-span-1 md:col-span-2">
          <h3 className="font-medium text-gray-500 text-sm">Order Note</h3>
          <p className="text-sm text-gray-700 font-semibold bg-gray-200 p-2 rounded">
            {data.note || "--/--"}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default OrderInformation;
