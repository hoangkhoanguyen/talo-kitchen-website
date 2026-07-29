"use client";
import React from "react";
import AddonsEditor from "../../shared/AddonsEditor";
import { useProductEditorContext } from "./ProductEditorProvider";

const ProductAddOns = () => {
  const { product, onChangeAddonQuantity } = useProductEditorContext();

  return (
    <AddonsEditor
      addons={product.addons}
      onChangeQuantity={onChangeAddonQuantity}
    />
  );
};

export default ProductAddOns;
