"use client";
import React, { FC } from "react";
import { Input, InputWithLabel } from "../../../ui/form";
import { Editor } from "@/types/common";
import WithError from "@/components/admin/ui/form/WithError";

const ProductPriceInput: FC<Editor> = ({ value, onChange, error }) => {
  return (
    <InputWithLabel label="Giá sản phẩm (VND)">
      <WithError error={error}>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={error ? "input-error" : ""}
        />
      </WithError>
    </InputWithLabel>
  );
};

export default ProductPriceInput;
