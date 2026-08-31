"use client";
import { LayoutRef, LayoutWithRef, Modal } from "@/components/admin/ui/layout";
import useCreateCategoryForm from "@/hooks/admin/features/categories/useCreateCategoryForm";
import React, { forwardRef, memo, useCallback, useState } from "react";
import { Controller, FieldPath, useWatch } from "react-hook-form";
import { Button } from "@/components/admin/ui/button";
import { Input, InputWithLabel, SlugInput } from "../../ui/form";
import WithError from "../../ui/form/WithError";
import { AdminCreateProductCategoryForm } from "@/types/products";
import type { Locale } from "@/types/configs";
import { generateSlug } from "@/lib/utils";
import { useCreateCategory } from "@/hooks/admin/features/categories";
import { routing } from "@/i18n/routing";
import LocaleTabStrip from "./form-elements/LocaleTabStrip";

interface Props {
  onSuccess?: (categoryId?: number) => void;
}

// `activeLocale` typed as `Locale` (not plain `string`) so the template
// literal path below resolves to the exact union of `translations.<locale>.name`
// paths already present in `AdminCreateProductCategoryForm`, no `Path<T>` cast
// needed (RULE-19 shape from TASK-14).
const translatedNamePath = (
  locale: Locale,
): FieldPath<AdminCreateProductCategoryForm> => `translations.${locale}.name`;

const CreateCategory = memo(
  forwardRef<LayoutRef, Props>(({ onSuccess }, ref) => {
    const {
      control,
      reset,
      handleSubmit,
      getValues,
      setValue,
      formState: { isDirty },
    } = useCreateCategoryForm();
    const { mutate, isPending } = useCreateCategory();
    const [activeLocale, setActiveLocale] = useState<Locale>(
      routing.defaultLocale as Locale,
    );

    const translations = useWatch({ control, name: "translations" });

    const isMissing = (locale: string) => {
      const defaultName = translations?.[routing.defaultLocale as Locale]
        ?.name;
      const localeName = translations?.[locale as Locale]?.name;
      return !!defaultName && !localeName;
    };

    const onCopyFromDefault = () => {
      const defaultName =
        translations?.[routing.defaultLocale as Locale]?.name ?? "";
      setValue(translatedNamePath(activeLocale), defaultName, {
        shouldDirty: true,
      });
    };

    const onAfterClose = useCallback(() => {
      reset();
      setActiveLocale(routing.defaultLocale as Locale);
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
            <LocaleTabStrip
              locales={routing.locales}
              defaultLocale={routing.defaultLocale}
              activeLocale={activeLocale}
              onChange={(locale) => setActiveLocale(locale as Locale)}
              isMissing={isMissing}
              showCopy={activeLocale !== routing.defaultLocale}
              onCopyFromDefault={onCopyFromDefault}
              className="mb-3"
            />
            <Controller
              control={control}
              name={translatedNamePath(activeLocale)}
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
                      translatedNamePath(routing.defaultLocale as Locale),
                    );
                    onChange(generateSlug(name as string));
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
