import { Button } from "@/components/admin/ui/button";
import { EReservationStatus } from "@/types/reservations";
import { ComponentProps } from "react";

export const STATUS_RENDER: Record<
  EReservationStatus,
  {
    label: string;
    icon: string;
    restStatus: EReservationStatus[];
    buttons: (ComponentProps<typeof Button> & {
      nextStatus: EReservationStatus;
    })[];
    color: string;
  }
> = {
  [EReservationStatus.scheduled]: {
    label: "Scheduled",
    icon: "streamline-pixel:interface-essential-waiting-hourglass-loading",
    restStatus: [
      EReservationStatus.confirmed,
      EReservationStatus.seated,
      EReservationStatus.completed,
    ],
    buttons: [
      {
        color: "primary",
        children: "Confirm",
        nextStatus: EReservationStatus.confirmed,
      },
      {
        color: "error",
        children: "Cancel",
        nextStatus: EReservationStatus.cancelled,
      },
    ],
    color: "badge-warning",
  },
  [EReservationStatus.confirmed]: {
    label: "Confirmed",
    icon: "icon-park-outline:loading-one",
    restStatus: [EReservationStatus.seated, EReservationStatus.completed],
    buttons: [
      {
        color: "primary",
        children: "Check In",
        nextStatus: EReservationStatus.seated,
      },
      {
        color: "error",
        children: "No Show",
        nextStatus: EReservationStatus.no_show,
      },
      {
        color: "error",
        children: "Cancel",
        nextStatus: EReservationStatus.cancelled,
      },
    ],
    color: "badge-info",
  },
  [EReservationStatus.seated]: {
    label: "Seated",
    icon: "ph:seat",
    restStatus: [EReservationStatus.completed],
    buttons: [
      {
        color: "primary",
        children: "Complete",
        nextStatus: EReservationStatus.completed,
      },
    ],
    color: "badge-success",
  },
  [EReservationStatus.completed]: {
    label: "Completed",
    icon: "iconamoon:check-bold",
    restStatus: [],
    buttons: [],
    color: "badge-success",
  },
  [EReservationStatus.cancelled]: {
    label: "Cancelled",
    icon: "iconoir:cancel",
    restStatus: [],
    buttons: [],
    color: "badge-danger",
  },
  [EReservationStatus.no_show]: {
    label: "No Show",
    icon: "iconoir:cancel",
    restStatus: [],
    buttons: [],
    color: "badge-dark",
  },
};
