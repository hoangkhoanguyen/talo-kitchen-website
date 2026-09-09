import React from "react";
import { BasicTable } from "../../ui/table";
import { createColumnHelper } from "@tanstack/react-table";
import { IconButton } from "../../ui/button";
import Icon from "@/components/common/Icon";
import Link from "next/link";
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
  const columns = [
    columnHelper.accessor("id", {
      header: () => <IconButton onClick={onReloadData} icon="mdi:reload" />,
      cell(props) {
        return (
          <Link
            href={adminRoutes.reservation(props.getValue())}
            className="btn rounded-xl btn-square btn-sm p-1"
            aria-label="Xem chi tiết đặt bàn"
          >
            <Icon icon="ph:eye" />
          </Link>
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
