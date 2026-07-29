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
import { useProductDetailsContext } from "./ProductDetailsProvider";
import { Controller, useWatch } from "react-hook-form";
import { generateSlug } from "@/lib/utils";
import { Input, InputWithLabel, SlugInput } from "../../ui/form";
import WithError from "../../ui/form/WithError";

const ProductEditForm = () => {
  const { control } = useProductDetailsContext();
  const title = useWatch({
    control,
    name: "title",
  });

  return (
    <div className="container p-5 mx-auto">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 xl:col-span-9">
          <div className="grid grid-cols-1 gap-4">
            <div className="card bg-white">
              <div className="p-5">
                <div className="card-title">Thông tin cơ bản</div>
                <div className="grid grid-cols-1 gap-4">
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
                    name="allergenInfo"
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ProductAllergenInfoInput
                        value={value}
                        onChange={onChange}
                        error={error}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="subDescription"
                    render={({
                      field: { value, onChange },
                      fieldState: { error },
                    }) => (
                      <ProductSubDescriptionInput
                        value={value}
                        onChange={onChange}
                        error={error}
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
                      <ProductDescriptionInput
                        value={value}
                        onChange={onChange}
                        error={error}
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
