"use client";
import React, { useMemo, useRef } from "react";
import CategoryTable from "@/components/admin/features/categories/CategoryTable";
import CreateCategory from "@/components/admin/features/products/CreateCategory";
import UpdateCategory from "@/components/admin/features/categories/UpdateCategory";
import ViewCategoryProducts from "@/components/admin/features/categories/ViewCategoryProducts";
import Header from "@/components/admin/shared/header/Header";
import SearchInput from "@/components/admin/shared/SearchInput";
import Pagination from "@/components/admin/ui/table/Pagination";
import { Button } from "@/components/admin/ui/button";
import { LayoutRef } from "@/components/admin/ui/layout";
import {
  useFetchCategories,
  useCategoriesParams,
} from "@/hooks/admin/features/categories";
import { AdminProductCategory } from "@/types/products";

const CategoriesPage = () => {
  const { query, setQuery } = useCategoriesParams();
  const { data, refetch } = useFetchCategories(query);

  const updateModalRef = useRef<{
    open: (categoryId: number) => void;
    close: () => void;
  }>(null);

  const createModalRef = useRef<LayoutRef>(null);

  const viewProductsModalRef = useRef<{
    open: (categoryId: number) => void;
    close: () => void;
  }>(null);

  const categories: AdminProductCategory[] = useMemo(
    () =>
      data?.categories.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        isActive: item.isActive,
        description: item.description,
      })) || [],
    [data],
  );

  const handleEditCategory = (category: AdminProductCategory) => {
    updateModalRef.current?.open(category.id);
  };

  const handleViewProducts = (category: AdminProductCategory) => {
    viewProductsModalRef.current?.open(category.id);
  };

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleCreateSuccess = () => {
    refetch();
    createModalRef.current?.close();
  };

  return (
    <div className="container px-5 pb-5 mx-auto flex flex-col gap-4 min-h-screen">
      <Header
        title="Quản lý danh mục"
        center={
          <div className="flex-1 px-7">
            <SearchInput
              className="input-sm"
              placeholder="Tìm kiếm danh mục..."
              onSubmit={() => {}}
            />
          </div>
        }
        actions={
          <div className="flex gap-2">
            <Button
              color="success"
              onClick={() => createModalRef.current?.open()}
            >
              Thêm danh mục
            </Button>
            {/* <CategoryFilter /> */}
          </div>
        }
      />

      <CategoryTable
        data={categories}
        loading={!data}
        onReloadData={refetch}
        onEdit={handleEditCategory}
        onViewProducts={handleViewProducts}
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

      <UpdateCategory ref={updateModalRef} onSuccess={handleUpdateSuccess} />
      <CreateCategory ref={createModalRef} onSuccess={handleCreateSuccess} />
      <ViewCategoryProducts ref={viewProductsModalRef} />
    </div>
  );
};

export default CategoriesPage;
