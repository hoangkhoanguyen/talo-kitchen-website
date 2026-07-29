import React from "react";
import { BasicTable } from "../../ui/table";
import { createColumnHelper } from "@tanstack/react-table";
import { IconButton } from "../../ui/button";
import { AdminProductCategory } from "@/types/products";

const columnHelper = createColumnHelper<AdminProductCategory>();

interface CategoryTableProps {
  data: AdminProductCategory[];
  onReloadData: () => void;
  onEdit?: (category: AdminProductCategory) => void;
  onViewProducts?: (category: AdminProductCategory) => void;
  loading?: boolean;
}

export default function CategoryTable({
  data,
  onReloadData,
  onEdit,
  onViewProducts,
  loading,
}: CategoryTableProps) {
  const columns = [
    columnHelper.accessor("id", {
      header: () => <IconButton onClick={onReloadData} icon="mdi:reload" />,
      cell: (props) => {
        const category = props.row.original;
        return (
          <div className="flex items-center gap-1">
            <IconButton
              icon="material-symbols:edit-outline"
              variant="soft"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
              onClick={() => onEdit?.(category)}
            />
            <IconButton
              icon="material-symbols:list"
              variant="soft"
              size="sm"
              className="text-green-600 hover:text-green-800"
              onClick={() => onViewProducts?.(category)}
            />
          </div>
        );
      },
      meta: {
        align: "center",
      },
    }),
    columnHelper.accessor("name", {
      header: "Category Name",
      cell: (props) => {
        const name = props.getValue();
        return <span className="font-medium text-gray-900">{name}</span>;
      },
      meta: {
        align: "left",
      },
    }),
    columnHelper.accessor("slug", {
      header: "Slug",
      cell: (props) => {
        const slug = props.getValue();
        return (
          <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {slug}
          </span>
        );
      },
      meta: {
        align: "left",
      },
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (props) => {
        const description = props.getValue();
        return (
          <span className="text-gray-600 max-w-xs truncate block">
            {description || "-"}
          </span>
        );
      },
      meta: {
        align: "left",
      },
    }),
    // Tạm thời ẩn cột status
    // columnHelper.accessor("isActive", {
    //   header: "Status",
    //   cell: (props) => {
    //     const isActive = props.getValue();
    //     return (
    //       <span
    //         className={`badge ${
    //           isActive
    //             ? "badge-success text-green-800"
    //             : "badge-error text-red-800"
    //         }`}
    //       >
    //         {isActive ? "Active" : "Inactive"}
    //       </span>
    //     );
    //   },
    //   meta: {
    //     align: "center",
    //   },
    // }),
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
