"use client";
import React, { ComponentProps, FC, useMemo } from "react";
import { Button } from "../../ui/button";
import StatusItem from "../../shared/StatusItem";
import { EReservationStatus } from "@/types/reservations";
import { STATUS_RENDER } from "@/constants/reservation";
import useUpdateReservationStatus from "@/hooks/admin/features/reservations/useUpdateReservationStatus";
import { useSetLoading } from "@/hooks/admin/loading";

const ReservationStatuses: FC<{
  historyStatus: EReservationStatus[];
  status: EReservationStatus;
  reservationId: number;
}> = ({ historyStatus, status, reservationId }) => {
  const { mutate, isPending } = useUpdateReservationStatus();

  const handleStatusChange = (newStatus: EReservationStatus) => {
    mutate({ reservationId, status: newStatus });
  };

  const statuses = useMemo((): ComponentProps<typeof StatusItem>[] => {
    const result: ComponentProps<typeof StatusItem>[] = [];

    historyStatus.forEach((status) => {
      result.push({
        active: true,
        icon: STATUS_RENDER[status].icon,
        label: STATUS_RENDER[status].label,
        color:
          status === EReservationStatus.cancelled ||
          status === EReservationStatus.no_show
            ? "error"
            : "primary",
      });
    });

    result.push({
      active: true,
      icon: STATUS_RENDER[status].icon,
      label: STATUS_RENDER[status].label,
      color:
        status === EReservationStatus.cancelled ||
        status === EReservationStatus.no_show
          ? "error"
          : "primary",
    });

    STATUS_RENDER[status].restStatus.forEach((status) => {
      result.push({
        active: false,
        icon: STATUS_RENDER[status].icon,
        label: STATUS_RENDER[status].label,
        color:
          status === EReservationStatus.cancelled ||
          status === EReservationStatus.no_show
            ? "error"
            : "primary",
      });
    });

    return result;
  }, [status, historyStatus]);

  useSetLoading(isPending);

  return (
    <div className="card bg-white p-5">
      <p className="card-title">Reservation Status</p>
      <div className="flex justify-between relative mt-4 pb-5">
        {statuses.map((status, idx) => (
          <StatusItem key={idx} first={idx === 0} {...status} />
        ))}
      </div>
      {STATUS_RENDER[status].buttons.length > 0 && (
        <div className="card-actions justify-center pt-4">
          {STATUS_RENDER[status].buttons.map((button) => (
            <Button
              key={button.nextStatus}
              color={button.color}
              disabled={isPending}
              onClick={() => {
                handleStatusChange(button.nextStatus);
              }}
            >
              {button.children}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationStatuses;
