import { AdminReservationTable } from "@/types/reservations";
import React, { FC } from "react";

const ReservationInformation: FC<{
  data: Pick<
    AdminReservationTable,
    "code" | "customerName" | "customerPhone" | "createdAt"
  >;
}> = ({ data }) => {
  return (
    <>
      <div className="card p-5 bg-white @container h-full">
        <p className="card-title">Reservation Information</p>
        <div className="mt-4 grid grid-cols-1 @sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Customer Name</p>
            <p className="text-base text-gray-700 font-semibold">
              {data.customerName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Customer Phone</p>
            <p className="text-base text-gray-700 font-semibold">
              {data.customerPhone}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Reservation Code</p>
            <p className="text-base text-gray-700 font-semibold">{data.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="text-base text-gray-700 font-semibold">
              {data.createdAt}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationInformation;
