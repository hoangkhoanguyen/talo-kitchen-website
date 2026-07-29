import ReservationInformation from "@/components/admin/features/reservations/ReservationInformation";
import ReservationInternalNote from "@/components/admin/features/reservations/ReservationInternalNote";
import ReservationNote from "@/components/admin/features/reservations/ReservationNote";
import ReservationStatuses from "@/components/admin/features/reservations/ReservationStatuses";
import Header from "@/components/admin/shared/header/Header";
import Icon from "@/components/common/Icon";
import { getAdminReservationById } from "@/services/reservations";
import { EReservationStatus } from "@/types/reservations";
import moment from "moment";
import React from "react";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const reservation = await getAdminReservationById(Number(id));

  if (!reservation) {
    return <div>Reservation not found</div>;
  }

  const historyStatus = reservation.statusHistory.map(
    (item) => item.previousStatus as EReservationStatus,
  );

  return (
    <>
      <Header title="Reservation Details" />
      <div className="container py-5">
        <div className="grid gap-5">
          <ReservationStatuses
            historyStatus={historyStatus}
            reservationId={reservation.id}
            status={reservation.status as EReservationStatus}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="card p-5 bg-blue-100 flex flex-col items-center gap-0 justify-center">
              <Icon
                icon="flat-color-icons:calendar"
                className="text-5xl mb-3"
              />
              <p className="text-sm leading-none text-blue-500">Date</p>
              <p className="text-lg text-blue-600 font-semibold">
                {moment(reservation.arrivalDate, "YYYY-MM-DD").format(
                  "DD/MM/YYYY",
                )}
              </p>
            </div>
            <div className="card p-5 bg-green-100 flex flex-col items-center gap-0 justify-center">
              <Icon icon="noto:alarm-clock" className="text-5xl mb-3" />
              <p className="text-sm leading-none text-green-500">Time</p>
              <p className="text-lg text-green-600 font-semibold">
                {moment(reservation.arrivalTime, "HH:mm:ss").format("hh:mm A")}
              </p>
            </div>
            <div className="card p-5 bg-orange-100 flex flex-col items-center gap-0 justify-center">
              <Icon
                icon="fluent-color:people-interwoven-28"
                className="text-5xl mb-3"
              />
              <p className="text-sm leading-none text-orange-500">People</p>
              <p className="text-lg text-orange-600 font-semibold">
                {reservation.numberOfPeople}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="col-span-1 md:col-span-2">
              <ReservationInformation
                data={{
                  code: reservation.code,
                  customerName: reservation.customerFullName,
                  customerPhone: reservation.customerPhone,
                  createdAt: moment(reservation.createdAt).format(
                    "YYYY-MM-DD hh:mm A",
                  ),
                }}
              />
            </div>
            <div className="col-span-1">
              <div className="grid gap-5">
                <ReservationNote data={{ note: reservation.note }} />
                <ReservationInternalNote
                  data={{
                    id: reservation.id,
                    internalNote: reservation.internalNote,
                    status: reservation.status as EReservationStatus,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
