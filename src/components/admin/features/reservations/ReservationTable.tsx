import React from "react";
import { BasicTable } from "../../ui/table";
import { createColumnHelper } from "@tanstack/react-table";
import { IconButton } from "../../ui/button";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/constants/route";
import { AdminReservationTable } from "@/types/reservations";
import { STATUS_RENDER } from "@/constants/reservation";
const columnHelper = createColumnHelper<AdminReservationTable>();

export default function ReservationTable({
  data,
  onReloadData,
  loading,
}: {
  data: AdminReservationTable[];
  onReloadData(): void;
  loading?: boolean;
}) {
  const route = useRouter();

  const columns = [
    columnHelper.accessor("id", {
      header: () => <IconButton onClick={onReloadData} icon="mdi:reload" />,
      cell(props) {
        return (
          <IconButton
            icon="ph:eye"
            onClick={() =>
              route.push(adminRoutes.reservation(props.getValue()))
            }
          />
        );
      },
      meta: {
        align: "center",
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell(props) {
        const value = props.getValue();
        return (
          <span className={`badge badge-soft ${STATUS_RENDER[value].color}`}>
            {STATUS_RENDER[value].label}
          </span>
        );
      },
      meta: { align: "center" },
    }),
    columnHelper.accessor("code", {
      header: "Reservation Code",
      meta: {
        align: "center",
      },
    }),
    columnHelper.accessor("customerName", {
      header: "Customer Name",
    }),
    columnHelper.accessor("customerPhone", {
      header: "Customer Phone",
    }),
    columnHelper.accessor("arrivalTime", {
      header: "Arrival Time",
    }),
    columnHelper.accessor("arrivalDate", {
      header: "Arrival Date",
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
    }),
  ];
  return (
    <BasicTable
      columns={columns}
      data={data}
      className="flex-1 bg-white rounded-xl"
      loading={loading}
    />
  );
}
