"use client";
import React from "react";
import { formatCurrency, cn } from "@/lib/utils";
import useFetchAllCategories from "@/hooks/admin/features/categories/useFetchAllCategories";
import useFetchProductSalesReport from "@/hooks/admin/features/reports/useFetchProductSalesReport";

type Props = {
  // Khoảng ngày dùng chung với báo cáo doanh thu
  params: { preset: string; start_date?: string; end_date?: string };
  canFetch: boolean;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
};

const ProductSalesReport = ({
  params,
  canFetch,
  categoryId,
  onCategoryChange,
}: Props) => {
  const { data: categories } = useFetchAllCategories();
  const { data, isPending, isFetching, error, refetch } =
    useFetchProductSalesReport({ ...params, category_id: categoryId }, canFetch);

  const loading = canFetch && (isPending || isFetching);
  const report = canFetch && !error ? data : undefined;
  const errorMessage =
    canFetch && error
      ? error.response?.data?.message ||
        "Không tải được thống kê theo món, vui lòng thử lại"
      : null;

  const sold = report?.items.filter((item) => item.quantity > 0) ?? [];
  const unsold = report?.items.filter((item) => item.quantity === 0) ?? [];

  const renderRow = (
    item: NonNullable<typeof report>["items"][number],
    index: number,
  ) => (
    <tr
      key={item.productId}
      className={cn(item.quantity === 0 && "text-gray-400")}
    >
      <td>{index + 1}</td>
      <td className={cn(item.quantity > 0 && "font-medium")}>{item.name}</td>
      <td>{item.categoryName ?? "—"}</td>
      <td className="text-right">{item.quantity}</td>
      <td className="text-right">{item.orderCount}</td>
      <td className="text-right">{formatCurrency(item.revenue)}</td>
    </tr>
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold">Thống kê lượt đặt từng món</h2>
          <p className="text-xs text-gray-500">
            Xếp theo số phần bán, nhiều → ít · doanh thu gồm topping · cùng
            khoảng ngày ở trên
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          Danh mục
          <select
            className="select select-sm select-bordered"
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Tất cả</option>
            {categories?.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {errorMessage && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{errorMessage}</span>
          <button type="button" className="btn btn-sm" onClick={() => refetch()}>
            Thử lại
          </button>
        </div>
      )}

      {loading && !report && (
        <p className="text-sm text-gray-500">Đang tải thống kê...</p>
      )}

      {report &&
        (report.items.length === 0 ? (
          <p className="text-sm text-gray-500">Không có món nào</p>
        ) : (
          <div className={cn("overflow-x-auto", loading && "opacity-60")}>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th className="w-10">#</th>
                  <th>Món</th>
                  <th>Danh mục</th>
                  <th className="text-right">Số phần bán</th>
                  <th className="text-right">Số đơn</th>
                  <th className="text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {sold.map((item, index) => renderRow(item, index))}
                {unsold.length > 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="bg-gray-50 text-xs font-semibold text-gray-600"
                    >
                      Món chưa bán trong kỳ ({unsold.length})
                    </td>
                  </tr>
                )}
                {unsold.map((item, index) => renderRow(item, sold.length + index))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-gray-900">
                  <td />
                  <td>Tổng</td>
                  <td />
                  <td className="text-right">{report.summary.quantity}</td>
                  <td className="text-right text-gray-400">—</td>
                  <td className="text-right">
                    {formatCurrency(report.summary.revenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}

      {report && report.items.length > 0 && (
        <p className="text-xs text-gray-500">
          Doanh thu món + Phí ship = Tổng doanh thu. &quot;Số đơn&quot; ở dòng
          tổng để trống vì 1 đơn có thể có nhiều món.
        </p>
      )}
    </div>
  );
};

export default ProductSalesReport;
