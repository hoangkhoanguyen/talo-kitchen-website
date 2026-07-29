"use client";
import { LayoutRef, LayoutWithRef, Modal } from "@/components/admin/ui/layout";
import useFetchCategoryDetail from "@/hooks/admin/features/categories/useFetchCategoryDetail";
import React, { forwardRef, memo, useState } from "react";
import { Button } from "@/components/admin/ui/button";

interface ViewCategoryProductsRef {
  open: (categoryId: number) => void;
  close: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Props {
  // No props needed for now
}

const ViewCategoryProducts = memo(
  forwardRef<ViewCategoryProductsRef, Props>((_, ref) => {
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const modalRef = React.useRef<LayoutRef>(null);

    // Fetch category details with products when categoryId changes
    const { data: categoryDetail, isLoading } = useFetchCategoryDetail(
      categoryId || 0,
    );

    // Expose methods to parent component
    React.useImperativeHandle(ref, () => ({
      open: (id: number) => {
        setCategoryId(id);
        modalRef.current?.open();
      },
      close: () => {
        setCategoryId(null);
        modalRef.current?.close();
      },
    }));

    const category = categoryDetail?.category;

    if (categoryId && isLoading) {
      return (
        <LayoutWithRef ref={modalRef} Component={Modal}>
          <div className="card bg-white grid grid-cols-1 gap-4 w-2xl">
            <div className="p-5">
              <p className="card-title">Đang tải...</p>
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            </div>
          </div>
        </LayoutWithRef>
      );
    }

    return (
      <LayoutWithRef ref={modalRef} Component={Modal}>
        <div className="card bg-white grid grid-cols-1 gap-4 w-2xl">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="card-title">Danh sách sản phẩm</h3>
                {category && (
                  <p className="text-sm text-gray-600 mt-1">
                    Danh mục:{" "}
                    <span className="font-medium">{category.name}</span>
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => modalRef.current?.close()}
              >
                Đóng
              </Button>
            </div>

            {category?.products && category.products.length > 0 ? (
              <div className="space-y-3">
                {category.products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {product.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.slug}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-medium text-green-600">
                          {product.price?.toLocaleString("vi-VN")}đ
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "Đang bán" : "Ngưng bán"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m12 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v4.01M16 9h-4"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">
                  Chưa có sản phẩm nào trong danh mục này
                </p>
              </div>
            )}
          </div>
        </div>
      </LayoutWithRef>
    );
  }),
);

export default ViewCategoryProducts;

ViewCategoryProducts.displayName = "ViewCategoryProducts";
