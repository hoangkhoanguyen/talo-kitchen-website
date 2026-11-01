"use client";
import React, { useEffect, useState } from "react";
import { adminRoutes } from "@/constants/route";
import { formatCurrency, cn } from "@/lib/utils";
import useReportParams from "@/hooks/admin/features/reports/useReportParams";
import useFetchRevenueReport from "@/hooks/admin/features/reports/useFetchRevenueReport";
import ProductSalesReport from "./ProductSalesReport";

const PRESETS = [
  { value: "today", label: "Hôm nay" },
  { value: "yesterday", label: "Hôm qua" },
  { value: "last7", label: "7 ngày qua" },
  { value: "this_month", label: "Tháng này" },
  { value: "last_month", label: "Tháng trước" },
  { value: "custom", label: "Tự chọn" },
];

const EXPORT_MODES = [
  { value: "daily", label: "Xuất theo ngày" },
  { value: "orders", label: "Xuất theo đơn" },
];

// YYYY-MM-DD → DD/MM/YYYY
const toDmy = (ymd: string) => ymd.split("-").reverse().join("/");

const RevenueReport = () => {
  const { query, setQuery } = useReportParams();
  const isCustom = query.preset === "custom";

  // Ngày đang nhập ở chế độ Tự chọn (chỉ áp vào URL khi bấm "Áp dụng")
  const [draftStart, setDraftStart] = useState(query.start_date);
  const [draftEnd, setDraftEnd] = useState(query.end_date);
  useEffect(() => {
    setDraftStart(query.start_date);
    setDraftEnd(query.end_date);
  }, [query.start_date, query.end_date]);

  const draftInvalid = !!draftStart && !!draftEnd && draftStart > draftEnd;
  const appliedInvalid =
    !!query.start_date && !!query.end_date && query.start_date > query.end_date;
  const customReady = !!query.start_date && !!query.end_date && !appliedInvalid;
  const canFetch = !isCustom || customReady;

  const params = isCustom
    ? {
        preset: query.preset,
        start_date: query.start_date,
        end_date: query.end_date,
      }
    : { preset: query.preset };

  const { data, isPending, isFetching, error, refetch } =
    useFetchRevenueReport(params, canFetch);

  const onApplyCustom = () => {
    if (!draftStart || !draftEnd || draftInvalid) return;
    setQuery({ preset: "custom", start_date: draftStart, end_date: draftEnd });
  };

  const errorMessage = isCustom && appliedInvalid
    ? "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc"
    : canFetch && error
      ? error.response?.data?.message || "Không tải được báo cáo, vui lòng thử lại"
      : null;

  const loading = canFetch && (isPending || isFetching);
  const report = canFetch && !error ? data : undefined;
  const isEmpty = !!report && report.summary.orderCount === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Bộ lọc */}
      <div className="flex flex-wrap items-end gap-2">
        {PRESETS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              "btn btn-sm",
              query.preset === item.value ? "btn-primary" : "btn-outline",
            )}
            onClick={() =>
              setQuery({
                preset: item.value,
                start_date: item.value === "custom" ? query.start_date : null,
                end_date: item.value === "custom" ? query.end_date : null,
              })
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {isCustom && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col text-sm gap-1">
            Từ ngày
            <input
              type="date"
              className="input input-sm input-bordered"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
            />
          </label>
          <label className="flex flex-col text-sm gap-1">
            Đến ngày
            <input
              type="date"
              className="input input-sm input-bordered"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            disabled={!draftStart || !draftEnd || draftInvalid}
            onClick={onApplyCustom}
          >
            Áp dụng
          </button>
          {draftInvalid && (
            <p className="text-error text-sm">
              Ngày bắt đầu phải trước hoặc bằng ngày kết thúc
            </p>
          )}
          {!draftInvalid && !customReady && (
            <p className="text-sm text-gray-500">
              Chọn ngày bắt đầu và ngày kết thúc rồi bấm Áp dụng
            </p>
          )}
        </div>
      )}

      {/* Khoảng ngày + xuất Excel */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          {report
            ? `Khoảng ngày: ${toDmy(report.range.start)} - ${toDmy(report.range.end)}`
            : " "}
        </p>
        {canFetch && !errorMessage ? (
          <details className="dropdown dropdown-end">
            <summary className="btn btn-sm btn-outline">Xuất Excel</summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-10 w-44 p-2 shadow">
              {EXPORT_MODES.map((item) => (
                <li key={item.value}>
                  <a
                    href={adminRoutes.revenueReportExportApi({
                      ...params,
                      mode: item.value,
                      category_id: query.category_id,
                    })}
                    download
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        ) : (
          <button type="button" className="btn btn-sm btn-outline" disabled>
            Xuất Excel
          </button>
        )}
      </div>

      {errorMessage && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{errorMessage}</span>
          {!appliedInvalid && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => refetch()}
            >
              Thử lại
            </button>
          )}
        </div>
      )}

      {loading && !report && (
        <p className="text-sm text-gray-500">Đang tải báo cáo...</p>
      )}

      {report && (
        <>
          <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", loading && "opacity-60")}>
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(report.summary.revenue)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-500">Số đơn</p>
              <p className="text-2xl font-semibold">
                {report.summary.orderCount}
              </p>
            </div>
          </div>

          {isEmpty && (
            <p className="text-sm text-gray-500">
              Chưa có đơn hoàn thành trong kỳ này
            </p>
          )}

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="font-semibold mb-2">Doanh thu từng ngày</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th className="text-right">Số đơn</th>
                    <th className="text-right">Phí ship</th>
                    <th className="text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {report.daily.map((day) => (
                    <tr key={day.date}>
                      <td>{toDmy(day.date)}</td>
                      <td className="text-right">{day.orderCount}</td>
                      <td className="text-right">
                        {formatCurrency(day.shippingFee)}
                      </td>
                      <td className="text-right">
                        {formatCurrency(day.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="font-semibold mb-2">Theo phương thức thanh toán</h2>
            {report.byPayment.length === 0 ? (
              <p className="text-sm text-gray-500">
                Chưa có đơn hoàn thành trong kỳ này
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Phương thức</th>
                      <th className="text-right">Số đơn</th>
                      <th className="text-right">Phí ship</th>
                      <th className="text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byPayment.map((pay) => (
                      <tr key={pay.label}>
                        <td>{pay.label}</td>
                        <td className="text-right">{pay.orderCount}</td>
                        <td className="text-right">
                          {formatCurrency(pay.shippingFee)}
                        </td>
                        <td className="text-right">
                          {formatCurrency(pay.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {canFetch && (
        <ProductSalesReport
          params={params}
          canFetch={canFetch}
          categoryId={query.category_id}
          onCategoryChange={(value) => setQuery({ category_id: value || null })}
        />
      )}
    </div>
  );
};

export default RevenueReport;
