"use client";
import OrderFilter from "@/components/admin/features/orders/OrderFilter";
import OrderTable from "@/components/admin/features/orders/OrderTable";
import Header from "@/components/admin/shared/header/Header";
import SearchInput from "@/components/admin/shared/SearchInput";
import Pagination from "@/components/admin/ui/table/Pagination";
import useFetchOrders from "@/hooks/admin/features/orders/useFetchOrders";
import useOrdersParams from "@/hooks/admin/features/orders/useOrdersParams";
import React, { useEffect, useMemo } from "react";
import { AdminOrderTable, OrderStatus } from "@/types/orders";
import { EShippingMethod } from "@/types/app-configs";
import { formatDateVN } from "@/lib/date";

const ProductPage = () => {
  const { query, setQuery } = useOrdersParams();
  const { data, refetch, isPending, isRefetching } = useFetchOrders(query);

  const totalPages = data ? Math.ceil(data.total / query.limit) : 0;

  // Self-correcting guard: if the current page is out of range (e.g. a
  // stale/tampered `?page=` in the URL, or a filter/search shrank the
  // result set), snap back to the last valid page instead of showing an
  // empty table with a still-clickable pagination.
  useEffect(() => {
    if (data && data.total > 0 && query.page > totalPages) {
      setQuery({ page: totalPages });
    }
  }, [data, query.page, totalPages, setQuery]);

  const convertedData: AdminOrderTable[] = useMemo(
    (): AdminOrderTable[] =>
      data?.orders.map((item) => ({
        id: item.id,
        customerName: `${item.firstName} ${item.lastName}`,
        customerPhone: item.customerPhone,
        totalPrice: item.totalPrice,
        orderType: item.orderType as EShippingMethod,
        orderTypeLabel: item.orderTypeLabel || "",
        paymentMethod: item.paymentMethod,
        status: item.status as OrderStatus,
        createdAt: formatDateVN(item.createdAt, "YYYY-MM-DD hh:mm A"),
        code: item.code,
        note: item.note,
        deliveryAddress: item.deliveryAddress,
        internalNote: item.internalNote,
      })) || [],
    [data],
  );

  return (
    <div className="container px-5 pb-5 mx-auto flex flex-col gap-4 min-h-screen">
      <Header
        title="Order List"
        center={
          <div className="flex-1 px-7">
            <SearchInput
              className="input-sm"
              onSubmit={(search) => {
                setQuery({
                  search,
                  page: 1,
                });
              }}
            />
          </div>
        }
        actions={
          <div className="flex gap-2">
            <OrderFilter query={query} setQuery={setQuery} />
          </div>
        }
      />

      <OrderTable
        data={convertedData}
        onReloadData={() => {
          refetch();
        }}
        loading={isPending || isRefetching}
      />

      <Pagination
        className="self-center"
        currentPage={query.page}
        totalPages={totalPages}
        onPageChange={(page) => {
          setQuery({
            page,
          });
        }}
      />
    </div>
  );
};

export default ProductPage;
