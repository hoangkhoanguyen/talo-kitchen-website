import React from "react";
import { BasicTable } from "../../ui/table";
import { createColumnHelper } from "@tanstack/react-table";
import { IconButton } from "../../ui/button";
import Icon from "@/components/common/Icon";
import Link from "next/link";
import { adminRoutes } from "@/constants/route";
import { AdminOrderTable } from "@/types/orders";
import moment from "moment";
import { ORDER_STATUS, ORDER_TYPE } from "@/constants/orders";
const columnHelper = createColumnHelper<AdminOrderTable>();

export default function OrderTable({
  data,
  onReloadData,
  loading,
}: {
  data: AdminOrderTable[];
  onReloadData(): void;
  loading?: boolean;
}) {
  const columns = [
    columnHelper.accessor("id", {
      header: () => <IconButton onClick={onReloadData} icon="mdi:reload" />,
      cell(props) {
        return (
          <Link
            href={adminRoutes.order(props.getValue())}
            className="btn rounded-xl btn-square btn-sm p-1"
            aria-label="Xem chi tiết đơn"
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
          <span className={`badge badge-soft ${ORDER_STATUS[value]?.color}`}>
            {ORDER_STATUS[value].label}
          </span>
        );
      },
      meta: { align: "center" },
    }),
    columnHelper.accessor("code", {
      header: "Order Code",
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
    columnHelper.accessor("orderType", {
      header: "Shipping Method",
      cell(props) {
        const value = props.getValue();
        const label = props.row.original.orderTypeLabel;
        return (
          <span className={`badge badge-soft ${ORDER_TYPE[value].color}`}>
            {label}
          </span>
        );
      },
    }),

    columnHelper.accessor("totalPrice", {
      header: "Total Price (VNĐ)",
      cell(props) {
        return props.getValue()?.toLocaleString();
      },
      meta: {
        align: "right",
      },
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
