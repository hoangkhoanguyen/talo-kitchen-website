"use client";
import React from "react";
import ProductTitleInput from "./form-elements/ProductTitleInput";
import ProductStatusSwitch from "./form-elements/ProductStatusSwitch";
import ProductAllergenInfoInput from "./form-elements/ProductAllergenInfoInput";
import ProductSubDescriptionInput from "./form-elements/ProductSubDescriptionInput";
import ProductDescriptionInput from "./form-elements/ProductDescriptionInput";
import CategorySelector from "./form-elements/CategorySelector";
import ProductPriceInput from "./form-elements/ProductPriceInput";
import RelatedProductEditor from "./form-elements/RelatedProductEditor";
import ImagesEditor from "./form-elements/ImagesEditor";
import AddonsEditor from "./form-elements/AddonsEditor";
import LocaleTabStrip from "./form-elements/LocaleTabStrip";
import { useProductDetailsContext } from "./ProductDetailsProvider";
import { Controller, FieldPath, useWatch } from "react-hook-form";
import { generateSlug } from "@/lib/utils";
import { Input, InputWithLabel, SlugInput } from "../../ui/form";
import WithError from "../../ui/form/WithError";
import { routing } from "@/i18n/routing";
import { AdminEditProductForm } from "@/types/products";
import type { Locale } from "@/types/configs";

const translatedPath = (
  locale: string,
  field: "title" | "allergenInfo" | "subDescription" | "description",
) =>
  `translations.${locale}.${field}` as FieldPath<AdminEditProductForm>;

const ProductEditForm = () => {
  const { control, setValue, activeLocale, setActiveLocale } =
    useProductDetailsContext();
  const title = useWatch({
    control,
    name: translatedPath(routing.defaultLocale, "title"),
  });
  const translations = useWatch({
    control,
    name: "translations",
  });
  const addons = useWatch({
    control,
    name: "addons",
  });

  const isMissing = (locale: string) => {
    const defaultGroup = translations?.[routing.defaultLocale as Locale];
    const localeGroup = translations?.[locale as Locale];

    const basicFieldsMissing = (
      ["title", "allergenInfo", "subDescription", "description"] as const
    ).some((field) => {
      const defaultValue = defaultGroup?.[field];
      const localeValue = localeGroup?.[field];
      return !!defaultValue && !localeValue;
    });

    const addonNameMissing = (addons ?? []).some((addon) => {
      const defaultName =
        addon.translations?.[routing.defaultLocale as Locale]?.name;
      const localeName = addon.translations?.[locale as Locale]?.name;
      return !!defaultName && !localeName;
    });

    return basicFieldsMissing || addonNameMissing;
  };

  const onCopyFromDefault = () => {
    const defaultGroup = translations?.[routing.defaultLocale as Locale];

    (
      ["title", "allergenInfo", "subDescription", "description"] as const
    ).forEach((field) => {
      setValue(
        translatedPath(activeLocale, field),
        defaultGroup?.[field] ?? "",
      );
    });

    (addons ?? []).forEach((_, index) => {
      setValue(
        `addons.${index}.translations.${activeLocale}.name` as FieldPath<AdminEditProductForm>,
        addons?.[index]?.translations?.[routing.defaultLocale as Locale]
          ?.name ?? "",
      );
    });
  };

  return (
    <div className="container p-5 mx-auto">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-1 gap-4">
            <div className="card bg-white">
              <div className="p-5">
                <div className="card-title">Thông tin cơ bản</div>
                <LocaleTabStrip
                  className="mb-4"
                  locales={routing.locales}
                  defaultLocale={routing.defaultLocale}
                  activeLocale={activeLocale}
                  onChange={setActiveLocale}
                  isMissing={isMissing}
                  showCopy={activeLocale !== routing.defaultLocale}
                  onCopyFromDefault={onCopyFromDefault}
                />
                <div className="grid grid-cols-1 gap-4">
                  <Controller
                    control={control}
                    name={translatedPath(activeLocale, "title")}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ProductTitleInput
                        value={value as string}
                        onChange={onChange}
                        error={error}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={translatedPath(activeLocale, "allergenInfo")}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ProductAllergenInfoInput
                        value={value as string}
                        onChange={onChange}
                        error={error}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={translatedPath(activeLocale, "subDescription")}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ProductSubDescriptionInput
                        value={value as string}
                        onChange={onChange}
                        error={error}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={translatedPath(activeLocale, "description")}
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ProductDescriptionInput
                        value={value as string}
                        onChange={onChange}
                        error={error}
                      />
                    )}
                  />
                </div>
                <div className="border-t border-base-300 pt-4 mt-4">
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
                          onChange(generateSlug(title as string));
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <ImagesEditor />
            <AddonsEditor />
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 xl:col-span-3">
          <div className="card bg-white">
            <div className="p-5">
              <div className="card-title">Thông tin khác</div>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field: { value, onChange } }) => (
                      <ProductStatusSwitch value={value} onChange={onChange} />
                    )}
                  />
                  <Controller
                    control={control}
                    name="priority"
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <InputWithLabel label="Độ ưu tiên hiển thị">
                        <WithError error={error}>
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => onChange(Number(e.target.value))}
                            className={error ? "input-error" : ""}
                          />
                        </WithError>
                      </InputWithLabel>
                    )}
                  />
                </div>
                <div>
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
                <Controller
                  control={control}
                  name="price"
                  render={({ field: { value, onChange } }) => (
                    <ProductPriceInput value={value} onChange={onChange} />
                  )}
                />

                <RelatedProductEditor />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditForm;
