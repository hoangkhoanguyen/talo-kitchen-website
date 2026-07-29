"use client";
import React, { FC } from "react";
import { Input, InputWithLabel } from "../../../ui/form";
import { Editor } from "@/types/common";
import WithError from "@/components/admin/ui/form/WithError";

const ProductTitleInput: FC<Editor> = ({ value, onChange, error }) => {
  return (
    <InputWithLabel label="Tên sản phẩm" required>
      <WithError error={error}>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "input-error" : ""}
        />
      </WithError>
    </InputWithLabel>
  );
};

export default ProductTitleInput;
