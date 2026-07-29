import { Button, IconButton } from "@/components/admin/ui/button";
import { Label, Select } from "@/components/admin/ui/form";
import React, { useMemo, useRef, useState } from "react";
import { useProductDetailsContext } from "../ProductDetailsProvider";
import { useFieldArray } from "react-hook-form";
import { LayoutRef, LayoutWithRef, Modal } from "@/components/admin/ui/layout";
import useFetchAllProducts from "@/hooks/admin/features/products/useFetchAllProducts";

const RelatedProductEditor = () => {
  const ref = useRef<LayoutRef>(null);
  const { control, id } = useProductDetailsContext();
  const { data: allProducts = [] } = useFetchAllProducts();
  const [selectedProductId, setSelectedProductId] = useState<
    number | undefined
  >();

  const { fields, remove, append } = useFieldArray({
    control,
    name: "relatedProducts",
    keyName: "uid",
  });

  const productsForSelect = useMemo(
    () =>
      allProducts.filter(
        (item) =>
          id !== item.id && !fields.find((field) => field.id === item.id),
      ),
    [allProducts, fields, id],
  );

  return (
    <>
      <div>
        <div className="flex justify-between items-center">
          <Label>Sản phẩm liên quan</Label>
          <IconButton
            icon="ph:plus"
            onClick={() => {
              ref.current?.open();
            }}
          />
        </div>
        <div className="grid grid-cols-1 gap-2">
          {fields.map((field, index) => (
            <RelatedProduct
              key={field.uid}
              name={field.title}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      </div>

      <LayoutWithRef
        ref={ref}
        Component={Modal}
        afterClose={() => {
          setSelectedProductId(undefined);
        }}
      >
        <div className="card bg-white w-md">
          <div className="p-5">
            <p className="card-title">Chọn sản phẩm liên quan</p>
            <Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
            >
              <option value="">Chọn</option>
              {productsForSelect.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>
            <div className="card-actions justify-end mt-2">
              <Button
                disabled={!selectedProductId}
                color="success"
                onClick={() => {
                  const selectedProduct = productsForSelect.find(
                    (item) => item.id === selectedProductId,
                  );

                  if (!selectedProduct) return;
                  append({
                    id: selectedProduct.id,
                    title: selectedProduct.title,
                  });
                  ref.current?.close();
                }}
              >
                Chọn
              </Button>
            </div>
          </div>
        </div>
      </LayoutWithRef>
    </>
  );
};

export default RelatedProductEditor;

function RelatedProduct({
  name,
  onRemove,
}: {
  name: string;
  onRemove(): void;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-3">
      <p className="font-semibold flex-1 line-clamp-1">{name}</p>
      <IconButton
        icon={"mdi:trash-outline"}
        color="error"
        variant={"soft"}
        onClick={onRemove}
      />
    </div>
  );
}
