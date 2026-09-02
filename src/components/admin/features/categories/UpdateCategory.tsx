"use client";
import { LayoutRef, LayoutWithRef, Modal } from "@/components/admin/ui/layout";
import useUpdateCategoryForm, {
  mapCategoryTranslationsToForm,
} from "@/hooks/admin/features/categories/useUpdateCategoryForm";
import useFetchCategoryDetail from "@/hooks/admin/features/categories/useFetchCategoryDetail";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Controller, FieldPath, useWatch } from "react-hook-form";
import { Button } from "@/components/admin/ui/button";
import {
  Input,
  InputWithLabel,
  SlugInput,
  Textarea,
} from "../../ui/form";
import WithError from "../../ui/form/WithError";
import { AdminCreateProductCategoryForm } from "@/types/products";
import type { Locale } from "@/types/configs";
import useUpdateCategory from "@/hooks/admin/features/categories/useUpdateCategory";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import LocaleTabStrip from "../products/form-elements/LocaleTabStrip";

// `locale` typed as `Locale` (not plain `string`) so the template literal
// path below resolves to the exact union of `translations.<locale>.<field>`
// paths already present in `AdminCreateProductCategoryForm` — no `Path<T>`
// cast needed (RULE-19 shape from TASK-14).
const translatedPath = (
  locale: Locale,
  field: "name" | "description",
): FieldPath<AdminCreateProductCategoryForm> => `translations.${locale}.${field}`;

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
    const [activeLocale, setActiveLocale] = useState<Locale>(
      routing.defaultLocale as Locale,
    );

    // Fetch category details when categoryId changes
    const { data: categoryDetail, isLoading } = useFetchCategoryDetail(
      categoryId || 0,
    );

    const translations = useWatch({ control, name: "translations" });

    const isMissing = (locale: string) => {
      const loc = locale as Locale;
      const defaultGroup = translations?.[routing.defaultLocale as Locale];
      const localeGroup = translations?.[loc];

      return (["name", "description"] as const).some((field) => {
        const defaultValue = defaultGroup?.[field];
        const localeValue = localeGroup?.[field];
        return !!defaultValue && !localeValue;
      });
    };

    const onCopyFromDefault = () => {
      const defaultGroup = translations?.[routing.defaultLocale as Locale];

      (["name", "description"] as const).forEach((field) => {
        setValue(
          translatedPath(activeLocale, field),
          defaultGroup?.[field] ?? "",
          { shouldDirty: true },
        );
      });
    };

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
      setActiveLocale(routing.defaultLocale as Locale);
    }, [reset]);

    // Set form values when category data is fetched (mảng translation, mọi
    // locale, từ TASK-06 admin fetch → record {en,vi} theo RULE-19/EC-05).
    useEffect(() => {
      if (categoryDetail?.category) {
        const category = categoryDetail.category;
        setValue("slug", category.slug);
        setValue(
          "translations",
          mapCategoryTranslationsToForm(category, category.translations),
        );
        // Không set isActive - giữ nguyên trạng thái hiện tại
      }
    }, [categoryDetail, setValue]);

    const onSubmit = (data: AdminCreateProductCategoryForm) => {
      if (!categoryId) return;

      mutate(
        {
          id: categoryId,
          data: {
            slug: data.slug,
            translations: data.translations,
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
              <LocaleTabStrip
                locales={routing.locales}
                defaultLocale={routing.defaultLocale}
                activeLocale={activeLocale}
                onChange={(locale) => setActiveLocale(locale as Locale)}
                isMissing={isMissing}
                showCopy={activeLocale !== routing.defaultLocale}
                onCopyFromDefault={onCopyFromDefault}
              />

              <Controller
                key={`name-${activeLocale}`}
                control={control}
                name={translatedPath(activeLocale, "name")}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <WithError error={error}>
                    <InputWithLabel label="Tên danh mục" required>
                      <Input
                        value={(value as string) ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        className={error ? "input-error" : ""}
                      />
                    </InputWithLabel>
                  </WithError>
                )}
              />

              <Controller
                key={`description-${activeLocale}`}
                control={control}
                name={translatedPath(activeLocale, "description")}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <WithError error={error}>
                    <InputWithLabel label="Mô tả">
                      <Textarea
                        value={(value as string) ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        className={error ? "input-error" : ""}
                        rows={3}
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
                      const name = getValues(
                        translatedPath(routing.defaultLocale as Locale, "name"),
                      );
                      onChange(generateSlug(name as string));
                    }}
                  />
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
