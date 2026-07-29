"use client";
import React from "react";
import QuantityEditor from "../../shared/QuantityEditor";
import { useProductEditorContext } from "./ProductEditorProvider";

const ProductQuantityEditor = () => {
  const { product, onChangeQuantity } = useProductEditorContext();
  return (
    <QuantityEditor
      price={product.price}
      onChangeQuantity={onChangeQuantity}
      quantity={product.quantity}
    />
  );
};

export default ProductQuantityEditor;
