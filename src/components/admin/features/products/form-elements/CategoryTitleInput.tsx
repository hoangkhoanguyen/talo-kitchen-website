"use client";
import React from "react";
import { Input, InputWithLabel } from "../../../ui/form";

const CategoryTitleInput = () => {
  return (
    <InputWithLabel label="Tên danh mục" required>
      <Input />
    </InputWithLabel>
  );
};

export default CategoryTitleInput;
