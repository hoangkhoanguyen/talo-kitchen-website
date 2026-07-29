import { AdminOrderDetails } from "@/types/orders";
import React, { FC } from "react";

const DeliveryInformation: FC<{
  data: Pick<AdminOrderDetails, "deliveryAddress" | "addressNote">;
}> = ({ data }) => {
  return (
    <div className="card p-5 bg-white">
      <h2 className="card-title">Delivery Information</h2>
      <div className="grid grid-cols-1 gap-4 mt-4">
        <div>
          <h3 className="font-medium text-gray-500 text-sm">
            Delivery Address
          </h3>
          <p className="text-gray-700 font-semibold">{data.deliveryAddress}</p>
        </div>
        <div>
          <h3 className="font-medium text-gray-500 text-sm">Delivery Note</h3>
          <p className="text-sm text-gray-700 font-semibold bg-gray-200 p-2 rounded">
            {data.addressNote || "--/--"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInformation;
