"use client";
import { useCallback, useRef } from "react";
import { Button } from "../../ui/button";
import { LayoutRef, LayoutWithRef, Modal } from "../../ui/layout";
import useAddProductForm from "@/hooks/admin/features/products/useAddProductForm";
import { Controller, useWatch } from "react-hook-form";
import ProductTitleInput from "./form-elements/ProductTitleInput";
import { generateSlug } from "@/lib/utils";
import CategorySelector from "./form-elements/CategorySelector";
import { AdminCreateProductForm } from "@/types/products";
import useAddProduct from "@/hooks/admin/features/products/useAddProduct";
import { useRouter } from "next/navigation";
import { adminRoutes } from "@/constants/route";
import { SlugInput } from "../../ui/form";
import { useSetLoading } from "@/hooks/admin/loading";

const CreateProduct = () => {
  const modalRef = useRef<LayoutRef>(null);
  const route = useRouter();
  const { reset, control, handleSubmit } = useAddProductForm();
  const { mutate, isPending } = useAddProduct();

  const openModal = useCallback(() => {
    modalRef.current?.open();
  }, []);

  const closeModal = useCallback(() => {
    modalRef.current?.close();
  }, []);

  const onAfterClose = useCallback(() => {
    reset();
  }, [reset]);

  const title = useWatch({
    control,
    name: "title",
  });

  const onSubmit = (data: AdminCreateProductForm) => {
    mutate(
      {
        ...data,
        isActive: false,
      },
      {
        onSuccess({ data, success }) {
          if (success && data) {
            route.push(adminRoutes.product(data.newProduct.id));
            return;
          }
        },
      },
    );
  };

  useSetLoading(isPending);

  return (
    <>
      <Button color="primary" onClick={openModal}>
        Thêm mới
      </Button>
      <LayoutWithRef afterClose={onAfterClose} Component={Modal} ref={modalRef}>
        <div className="card p-5 bg-white w-md">
          <p className="card-title">Thêm mới sản phẩm</p>
          <div className="grid grid-cols-1 gap-2 mb-2">
            <Controller
              control={control}
              name="title"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <ProductTitleInput
                  value={value}
                  onChange={onChange}
                  error={error}
                />
              )}
            />
            <Controller
              control={control}
              name="slug"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <SlugInput
                  value={value}
                  onChange={onChange}
                  error={error}
                  onGenerateSlug={() => {
                    onChange(generateSlug(title));
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="categoryId"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <CategorySelector
                  value={value}
                  onChange={onChange}
                  error={error}
                />
              )}
            />
          </div>
          <div className="card-actions justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={closeModal}
              disabled={isPending}
            >
              Hủy bỏ
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              color="success"
              onClick={handleSubmit(onSubmit)}
            >
              Thêm
            </Button>
          </div>
        </div>
      </LayoutWithRef>
    </>
  );
};

export default CreateProduct;
