"use client";
import React from "react";
import { Button } from "../../ui/button";
import { useProductDetailsContext } from "./ProductDetailsProvider";
import Header from "../../shared/header/Header";

const ProductDetailsHeader = () => {
  const { onSubmit, isDirty, onReset } = useProductDetailsContext();

  return (
    <>
      <Header
        title="Chi tiết sản phẩm"
        actions={
          isDirty && (
            <div className="flex justify-end gap-3">
              <Button onClick={onSubmit} color="success">
                Lưu
              </Button>
              <Button variant={"outline"} color="error" onClick={onReset}>
                Hủy thay đổi
              </Button>
            </div>
          )
        }
      />
    </>
  );
};

export default ProductDetailsHeader;
