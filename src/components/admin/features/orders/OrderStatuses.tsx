"use client";
import { OrderStatus } from "@/types/orders";
import React, { ComponentProps, FC, useMemo } from "react";
import { Button } from "../../ui/button";
import useUpdateOrderStatus from "@/hooks/admin/features/orders/useUpdateOrderStatus";
import StatusItem from "../../shared/StatusItem";
import { useSetLoading } from "@/hooks/admin/loading";

const STATUS_RENDER: Record<
  OrderStatus,
  {
    label: string;
    icon: string;
    restStatus: OrderStatus[];
    buttons: (ComponentProps<typeof Button> & {
      action: "confirm" | "complete" | "cancel";
    })[];
  }
> = {
  [OrderStatus.pending]: {
    label: "Pending",
    icon: "streamline-pixel:interface-essential-waiting-hourglass-loading",
    restStatus: [OrderStatus.processing, OrderStatus.completed],
    buttons: [
      {
        color: "primary",
        children: "Confirm",
        action: "confirm",
      },
      {
        color: "error",
        children: "Cancel",
        action: "cancel",
      },
    ],
  },
  [OrderStatus.processing]: {
    label: "In Progress",
    icon: "icon-park-outline:loading-one",
    restStatus: [OrderStatus.completed],
    buttons: [
      {
        color: "primary",
        children: "Complete",
        action: "complete",
      },
      {
        color: "error",
        children: "Cancel",
        action: "cancel",
      },
    ],
  },
  [OrderStatus.completed]: {
    label: "Completed",
    icon: "iconamoon:check-bold",
    restStatus: [],
    buttons: [],
  },
  [OrderStatus.cancelled]: {
    label: "Cancelled",
    icon: "iconoir:cancel",
    restStatus: [],
    buttons: [],
  },
};

const OrderStatuses: FC<{
  historyStatus: OrderStatus[];
  status: OrderStatus;
  orderId: number;
}> = ({ historyStatus, status, orderId }) => {
  const { mutate, isPending } = useUpdateOrderStatus();

  const handleStatusChange = (action: "confirm" | "complete" | "cancel") => {
    let newStatus: OrderStatus;
    switch (action) {
      case "confirm":
        newStatus = OrderStatus.processing;
        break;
      case "complete":
        newStatus = OrderStatus.completed;
        break;
      case "cancel":
        newStatus = OrderStatus.cancelled;
        break;
      default:
        return;
    }
    mutate({ orderId, status: newStatus });
  };

  const statuses = useMemo((): ComponentProps<typeof StatusItem>[] => {
    const result: ComponentProps<typeof StatusItem>[] = [];

    historyStatus.forEach((status) => {
      result.push({
        active: true,
        icon: STATUS_RENDER[status].icon,
        label: STATUS_RENDER[status].label,
        color: status === OrderStatus.cancelled ? "error" : "primary",
      });
    });

    result.push({
      active: true,
      icon: STATUS_RENDER[status].icon,
      label: STATUS_RENDER[status].label,
      color: status === OrderStatus.cancelled ? "error" : "primary",
    });

    STATUS_RENDER[status].restStatus.forEach((status) => {
      result.push({
        active: false,
        icon: STATUS_RENDER[status].icon,
        label: STATUS_RENDER[status].label,
        color: status === OrderStatus.cancelled ? "error" : "primary",
      });
    });

    return result;
  }, [status, historyStatus]);

  useSetLoading(isPending);

  return (
    <div className="card bg-white p-5">
      <p className="card-title">Order Status</p>
      <div className="flex justify-between relative mt-4 pb-5">
        {statuses.map((status, idx) => (
          <StatusItem key={idx} first={idx === 0} {...status} />
        ))}
      </div>
      {STATUS_RENDER[status].buttons.length > 0 && (
        <div className="card-actions justify-center pt-4">
          {STATUS_RENDER[status].buttons.map((button) => (
            <Button
              key={button.action}
              color={button.color}
              disabled={isPending}
              onClick={() => {
                handleStatusChange(button.action);
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

export default OrderStatuses;
