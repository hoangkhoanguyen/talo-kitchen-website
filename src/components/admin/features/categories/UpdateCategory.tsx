"use client";
import { LayoutRef, LayoutWithRef, Modal } from "@/components/admin/ui/layout";
import useUpdateCategoryForm from "@/hooks/admin/features/categories/useUpdateCategoryForm";
import useFetchCategoryDetail from "@/hooks/admin/features/categories/useFetchCategoryDetail";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/admin/ui/button";
import { Input, InputWithLabel, SlugInput, Textarea } from "../../ui/form";
import WithError from "../../ui/form/WithError";
import { AdminCreateProductCategoryForm } from "@/types/products";
import useUpdateCategory from "@/hooks/admin/features/categories/useUpdateCategory";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";

interface UpdateCategoryRef {
  open: (categoryId: number) => void;
  close: () => void;
}

interface Props {
  onSuccess?: () => void;
}

const UpdateCategory = memo(
  forwardRef<UpdateCategoryRef, Props>(({ onSuccess }, ref) => {
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const modalRef = React.useRef<LayoutRef>(null);

    const {
      control,
      reset,
      handleSubmit,
      getValues,
      setValue,
      formState: { isDirty },
    } = useUpdateCategoryForm();
    const { mutate, isPending } = useUpdateCategory();

    // Fetch category details when categoryId changes
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

    const onAfterClose = useCallback(() => {
      reset();
      setCategoryId(null);
    }, [reset]);

    // Set form values when category data is fetched
    useEffect(() => {
      if (categoryDetail?.category) {
        const category = categoryDetail.category;
        setValue("name", category.name);
        setValue("slug", category.slug);
        setValue("description", category.description || "");
        // Không set isActive - giữ nguyên trạng thái hiện tại
      }
    }, [categoryDetail, setValue]);

    const onSubmit = (data: AdminCreateProductCategoryForm) => {
      if (!categoryId) return;

      mutate(
        {
          id: categoryId,
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            // Không cập nhật isActive - giữ nguyên trạng thái hiện tại
          },
        },
        {
          onSuccess({ success }) {
            if (success) {
              onSuccess?.();
              modalRef.current?.close();
            }
          },
        },
      );
    };

    // Show loading state when fetching category details
    if (categoryId && isLoading) {
      return (
        <LayoutWithRef
          ref={modalRef}
          Component={Modal}
          afterClose={onAfterClose}
        >
          <div className="card bg-white grid grid-cols-1 gap-4 w-sm">
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
      <LayoutWithRef ref={modalRef} Component={Modal} afterClose={onAfterClose}>
        <div className="card bg-white grid grid-cols-1 gap-4 w-sm">
          <div className="p-5">
            <p className="card-title mb-5">Chỉnh sửa danh mục</p>

            <div className="grid grid-cols-1 gap-4">
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

              <Controller
                control={control}
                name="description"
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <WithError error={error}>
                    <InputWithLabel label="Mô tả">
                      <Textarea
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        className={error ? "input-error" : ""}
                        rows={3}
                      />
                    </InputWithLabel>
                  </WithError>
                )}
              />
            </div>

            <div className="card-actions justify-end mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  modalRef.current?.close();
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                color="success"
                disabled={isPending || !isDirty}
              >
                {isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </div>
        </div>
      </LayoutWithRef>
    );
  }),
);

export default UpdateCategory;

UpdateCategory.displayName = "UpdateCategory";
