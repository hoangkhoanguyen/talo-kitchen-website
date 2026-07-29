"use client";
import { LayoutRef, LayoutWithRef, Modal } from "@/components/admin/ui/layout";
import useCreateCategoryForm from "@/hooks/admin/features/categories/useCreateCategoryForm";
import React, { forwardRef, memo, useCallback } from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/admin/ui/button";
import { Input, InputWithLabel, SlugInput } from "../../ui/form";
import WithError from "../../ui/form/WithError";
import { AdminCreateProductCategoryForm } from "@/types/products";
import { generateSlug } from "@/lib/utils";
import { useCreateCategory } from "@/hooks/admin/features/categories";

interface Props {
  onSuccess?: (categoryId?: number) => void;
}

const CreateCategory = memo(
  forwardRef<LayoutRef, Props>(({ onSuccess }, ref) => {
    const {
      control,
      reset,
      handleSubmit,
      getValues,
      formState: { isDirty },
    } = useCreateCategoryForm();
    const { mutate, isPending } = useCreateCategory();

    const onAfterClose = useCallback(() => {
      reset();
    }, [reset]);

    const onSubmit = (data: AdminCreateProductCategoryForm) => {
      mutate(data, {
        onSuccess(result) {
          if (result.success) {
            onSuccess?.(result.data?.newCategory?.id);
          }
        },
      });
    };

    return (
      <LayoutWithRef ref={ref} Component={Modal} afterClose={onAfterClose}>
        <div className="card bg-white grid grid-cols-1 gap-4 w-sm">
          <div className="p-5">
            <p className="card-title">Thêm nhóm món ăn</p>
            <Controller
              control={control}
              name="name"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <WithError error={error}>
                  <InputWithLabel label="Tên danh mục" required>
                    <Input
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className={error ? "input-error" : ""}
                    />
                  </InputWithLabel>
                </WithError>
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
                    const name = getValues("name");
                    onChange(generateSlug(name));
                  }}
                />
              )}
            />
            <div className="card-actions justify-end mt-2">
              <Button
                onClick={handleSubmit(onSubmit)}
                color="success"
                disabled={isPending || !isDirty}
              >
                {isPending ? "Đang thêm..." : "Thêm"}
              </Button>
            </div>
          </div>
        </div>
      </LayoutWithRef>
    );
  }),
);

export default CreateCategory;

CreateCategory.displayName = "CreateCategory";
