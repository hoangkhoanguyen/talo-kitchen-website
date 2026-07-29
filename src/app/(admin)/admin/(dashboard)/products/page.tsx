"use client";
import CreateProduct from "@/components/admin/features/products/CreateProduct";
import ProductFilter from "@/components/admin/features/products/ProductFilter";
import ProductTable from "@/components/admin/features/products/ProductTable";
import FilterTag from "@/components/admin/shared/FilterTag";
import Header from "@/components/admin/shared/header/Header";
import SearchInput from "@/components/admin/shared/SearchInput";
import Pagination from "@/components/admin/ui/table/Pagination";
import useFetchProducts from "@/hooks/admin/features/products/useFetchProducts";
import useProductsParams from "@/hooks/admin/features/products/useProductsParams";
import { AdminProductTable } from "@/types/products";
import React, { useMemo } from "react";

const ProductPage = () => {
  const { query, setQuery } = useProductsParams();

  const { data, refetch, isPending, isRefetching } = useFetchProducts(query);

  const convertedData: AdminProductTable[] = useMemo(
    () =>
      data?.products.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        category: item.category.name,
        imageUrl: item.images[0]?.url,
        isActive: item.isActive,
        slug: item.slug,
        priority: item.priority,
      })) || [],
    [data],
  );

  return (
    <div className="container px-5 pb-5 mx-auto flex flex-col gap-4 min-h-screen">
      <Header
        title="Danh sách sản phẩm"
        center={
          <div className="flex-1 px-7">
            <SearchInput className="input-sm" onSubmit={() => {}} />
          </div>
        }
        actions={
          <div className="flex gap-2">
            <CreateProduct />
            <ProductFilter />
          </div>
        }
      />
      <div className="flex gap-2 flex-wrap">
        {query.isActive !== null && (
          <FilterTag
            onRemove={() =>
              setQuery({
                isActive: null,
              })
            }
            label="Trạng thái"
            value={query.isActive ? "Đang hoạt động" : "Ngưng hoạt động"}
          />
        )}
      </div>

      <ProductTable
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
