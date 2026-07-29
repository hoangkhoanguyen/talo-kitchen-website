"use client";
import React, { FC } from "react";
import { AdminOrderDetails } from "@/types/orders";
import useUpdateOrderInternalNote from "@/hooks/admin/features/orders/useUpdateOrderInternalNote";
import InternalNote from "../../shared/InternalNote";
import { useSetLoading } from "@/hooks/admin/loading";

const OrderInternalNote: FC<{
  data: Pick<AdminOrderDetails, "internalNote" | "id" | "status">;
}> = ({ data }) => {
  const { mutate, isPending } = useUpdateOrderInternalNote();

  useSetLoading(isPending);

  return (
    <>
      <InternalNote
        initNote={data.internalNote || ""}
        onSubmit={(note) => mutate({ orderId: data.id, internalNote: note })}
        isPending={isPending}
        canEdit={data.status !== "completed" && data.status !== "cancelled"}
      />
    </>
  );
};

export default OrderInternalNote;
