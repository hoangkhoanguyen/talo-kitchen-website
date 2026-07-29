"use client";
import React, { FC } from "react";
import { InputWithLabel, Textarea } from "../../../ui/form";
import WithError from "@/components/admin/ui/form/WithError";
import { Editor } from "@/types/common";

const ProductAllergenInfoInput: FC<Editor> = ({ value, onChange, error }) => {
  return (
    <InputWithLabel label="Mô tả thành phần món ăn">
      <WithError error={error}>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "input-error" : ""}
        />
      </WithError>
    </InputWithLabel>
  );
};

export default ProductAllergenInfoInput;
