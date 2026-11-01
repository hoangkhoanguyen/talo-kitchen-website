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
  { value: "daily", label: "Theo ngày" },
  { value: "orders", label: "Theo từng đơn" },
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

  const card = "rounded-xl border border-gray-200 bg-white p-4";
  const exportDisabled = !canFetch || !!errorMessage;

  return (
    <div className="flex flex-col gap-5">
      {/* Mô tả + xuất Excel */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-600">
            Chỉ tính đơn Hoàn thành · ngày theo giờ Việt Nam (ngày khách đặt)
          </p>
          <p className="text-sm font-medium">
            {report
              ? `Khoảng ngày: ${toDmy(report.range.start)} - ${toDmy(report.range.end)}`
              : " "}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Xuất Excel:</span>
          {EXPORT_MODES.map((item, index) =>
            exportDisabled ? (
              <button
                key={item.value}
                type="button"
                className="btn btn-sm"
                disabled
              >
                {item.label}
              </button>
            ) : (
              <a
                key={item.value}
                className={cn(
                  "btn btn-sm",
                  index === 0 ? "btn-outline btn-primary" : "btn-primary",
                )}
                href={adminRoutes.revenueReportExportApi({
                  ...params,
                  mode: item.value,
                  category_id: query.category_id,
                })}
                download
              >
                {item.label}
              </a>
            ),
          )}
        </div>
      </div>

      {/* Bộ lọc ngày dùng chung cho cả trang */}
      <div className={cn(card, "flex flex-col gap-3")}>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={cn(
                "btn btn-sm rounded-full",
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
          {/* Số tổng + mỗi phương thức thanh toán 1 ô */}
          <div
            className={cn(
              "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4",
              loading && "opacity-60",
            )}
          >
            <div className={card}>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold">
                {formatCurrency(report.summary.revenue)}
              </p>
              <p className="text-xs text-gray-500">
                Đã gồm phí ship {formatCurrency(report.summary.shippingFee)}
              </p>
            </div>
            <div className={card}>
              <p className="text-sm text-gray-600">Số đơn</p>
              <p className="text-2xl font-bold">{report.summary.orderCount}</p>
              <p className="text-xs text-gray-500">Đơn Hoàn thành</p>
            </div>
            {report.byPayment.map((pay) => (
              <div key={pay.label} className={card}>
                <p className="text-sm text-gray-600">{pay.label}</p>
                <p className="text-xl font-bold">
                  {formatCurrency(pay.revenue)}
                </p>
                <p className="text-xs text-gray-500">{pay.orderCount} đơn</p>
              </div>
            ))}
          </div>

          {isEmpty && (
            <p className="text-sm text-gray-500">
              Chưa có đơn hoàn thành trong kỳ này
            </p>
          )}

          {/* Theo ngày (trái) + theo phương thức thanh toán (phải) */}
          <div className="flex flex-wrap items-start gap-4">
            <div className={cn(card, "flex-[999_1_560px] min-w-0")}>
              <h2 className="font-semibold mb-2">Doanh thu từng ngày</h2>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="table table-sm table-pin-rows">
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
                      <tr
                        key={day.date}
                        className={cn(day.orderCount === 0 && "text-gray-400")}
                      >
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
                  <tfoot>
                    <tr className="font-semibold text-gray-900">
                      <td>Tổng</td>
                      <td className="text-right">{report.summary.orderCount}</td>
                      <td className="text-right">
                        {formatCurrency(report.summary.shippingFee)}
                      </td>
                      <td className="text-right">
                        {formatCurrency(report.summary.revenue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className={cn(card, "flex-[1_1_320px] min-w-0")}>
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
