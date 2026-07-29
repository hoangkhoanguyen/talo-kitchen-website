"use client";
import React, { FC } from "react";
import { InputWithLabel, Textarea } from "../../../ui/form";
import { Editor } from "@/types/common";
import WithError from "@/components/admin/ui/form/WithError";

const ProductDescriptionInput: FC<Editor> = ({ value, onChange, error }) => {
  return (
    <InputWithLabel label="Mô tả đầy đủ">
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

export default ProductDescriptionInput;
