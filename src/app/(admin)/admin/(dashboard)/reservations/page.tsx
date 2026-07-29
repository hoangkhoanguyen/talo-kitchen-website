"use client";
import Header from "@/components/admin/shared/header/Header";
import SearchInput from "@/components/admin/shared/SearchInput";
import Pagination from "@/components/admin/ui/table/Pagination";
import useOrdersParams from "@/hooks/admin/features/orders/useOrdersParams";
import React, { useMemo } from "react";
import useFetchReservation from "@/hooks/admin/features/reservations/useFetchReservation";
import {
  AdminReservationTable,
  EReservationStatus,
} from "@/types/reservations";
import ReservationTable from "@/components/admin/features/reservations/ReservationTable";
import ReservationFilter from "@/components/admin/features/reservations/ReservationFilter";
import moment from "moment";

const ProductPage = () => {
  const { query, setQuery } = useOrdersParams();
  const { data, refetch, isPending, isRefetching } = useFetchReservation(query);

  const convertedData = useMemo(
    (): AdminReservationTable[] =>
      data?.reservations.map((item) => ({
        id: item.id,
        code: item.code,
        customerName: item.customerFullName,
        customerPhone: item.customerPhone,
        arrivalTime: moment(item.arrivalTime, "HH:mm:ss").format("hh:mm A"),
        arrivalDate: moment(item.arrivalDate, "YYYY-MM-DD").format(
          "DD/MM/YYYY",
        ),
        status: item.status as EReservationStatus,
        createdAt: moment(item.createdAt).format("YYYY-MM-DD hh:mm A"),
        note: item.note,
      })) || [],
    [data],
  );

  return (
    <div className="container px-5 pb-5 mx-auto flex flex-col gap-4 min-h-screen">
      <Header
        title="Reservation List"
        center={
          <div className="flex-1 px-7">
            <SearchInput
              className="input-sm"
              onSubmit={(search) => {
                setQuery({
                  search,
                });
              }}
            />
          </div>
        }
        actions={
          <div className="flex gap-2">
            <ReservationFilter query={query} setQuery={setQuery} />
          </div>
        }
      />
      <div className="flex gap-2 flex-wrap">
        {/* {query.isActive !== null && (
          <FilterTag
            onRemove={() =>
              setQuery({
                isActive: null,
              })
            }
            label="Trạng thái"
            value={query.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
          />
        )} */}
      </div>

      <ReservationTable
        data={convertedData}
        onReloadData={() => {
          refetch();
        }}
        loading={isPending || isRefetching}
      />

      <Pagination
        className="self-center"
        currentPage={query.page}
        totalPages={data ? Math.ceil(data.total / query.limit) : 0}
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
