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

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="font-semibold">Thống kê theo món</h2>
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
                  <th>#</th>
                  <th>Món</th>
                  <th>Danh mục</th>
                  <th className="text-right">Số phần bán</th>
                  <th className="text-right">Số đơn</th>
                  <th className="text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {report.items.map((item, index) => (
                  <tr
                    key={item.productId}
                    className={cn(item.quantity === 0 && "opacity-50")}
                  >
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.categoryName ?? "—"}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{item.orderCount}</td>
                    <td className="text-right">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td />
                  <td>Tổng</td>
                  <td />
                  <td className="text-right">{report.summary.quantity}</td>
                  <td />
                  <td className="text-right">
                    {formatCurrency(report.summary.revenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
    </div>
  );
};

export default ProductSalesReport;
