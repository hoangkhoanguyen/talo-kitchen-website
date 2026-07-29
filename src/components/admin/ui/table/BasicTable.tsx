"use client";
import React from "react";
import {
  ColumnDef,
  RowData,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "center" | "right";
  }
}

export function BasicTable<T extends object>({
  data,
  columns,
  className = "",
  loading,
}: {
  data: T[];
  columns: ColumnDef<T, any>[];
  className?: string;
  loading?: boolean;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const columnLength = table.getAllColumns().length;

  const renderSkeleton = () => (
    <tr>
      {Array(columnLength)
        .fill(0)
        .map((_, index) => (
          <td key={index}>
            <div className="skeleton h-4 w-full"></div>
          </td>
        ))}
    </tr>
  );

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="table table-pin-rows">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-2"
                  align={header.column.columnDef.meta?.align}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            <>
              {renderSkeleton()}
              {renderSkeleton()}
              {renderSkeleton()}
              {renderSkeleton()}
              {renderSkeleton()}
            </>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-base-200 duration-200">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-2"
                    align={cell.column.columnDef.meta?.align}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
