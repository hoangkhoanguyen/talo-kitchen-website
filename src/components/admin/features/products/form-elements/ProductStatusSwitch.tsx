"use client";
import React, { FC } from "react";
import { InputWithLabel, Switch } from "../../../ui/form";
import { Editor } from "@/types/common";

const ProductStatusSwitch: FC<Editor & { disabled?: boolean }> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <InputWithLabel label="Trạng thái" required>
      <Switch
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
    </InputWithLabel>
  );
};

export default ProductStatusSwitch;
