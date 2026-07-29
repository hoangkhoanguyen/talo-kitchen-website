"use client";
import React, { FC } from "react";
import InternalNote from "../../shared/InternalNote";
import { ReservationDB } from "@/db/schemas";
import useUpdateReservationInternalNote from "@/hooks/admin/features/reservations/useUpdateReservationInternalNote";
import { useSetLoading } from "@/hooks/admin/loading";

const ReservationInternalNote: FC<{
  data: Pick<ReservationDB, "internalNote" | "id" | "status">;
}> = ({ data }) => {
  const { mutate, isPending } = useUpdateReservationInternalNote();

  useSetLoading(isPending);
  return (
    <>
      <InternalNote
        initNote={data.internalNote || ""}
        onSubmit={(note) =>
          mutate({ reservationId: data.id, internalNote: note })
        }
        isPending={isPending}
        canEdit={data.status !== "completed" && data.status !== "cancelled"}
      />
    </>
  );
};

export default ReservationInternalNote;
