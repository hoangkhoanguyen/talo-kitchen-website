"use client";
import React, { FC, useCallback, useRef } from "react";
import { LayoutRef } from "@/components/admin/ui/layout";
import { Label, Select } from "@/components/admin/ui/form";
import CreateCategory from "../CreateCategory";
import useFetchAllCategories from "@/hooks/admin/features/categories/useFetchAllCategories";
import { IconButton } from "@/components/admin/ui/button";
import WithError from "@/components/admin/ui/form/WithError";
import { Editor } from "@/types/common";

const CategorySelector: FC<Editor> = ({ onChange, value, error }) => {
  const modalRef = useRef<LayoutRef>(null);
  const { data = [] } = useFetchAllCategories();

  const onSuccess = useCallback(
    (categoryId?: number) => {
      if (categoryId) {
        onChange(categoryId);
      }
      modalRef.current?.close();
    },
    [onChange],
  );

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-1">
          <Label>
            Nhóm món ăn <span className="text-error">*</span>
          </Label>
          <IconButton icon="ph:plus" onClick={() => modalRef.current?.open()} />
        </div>
        <WithError error={error}>
          <Select
            value={value}
            onChange={(e) => {
              onChange(Number(e.target.value));
            }}
            className={error ? "input-error" : ""}
          >
            <option value="">Chọn</option>
            {data.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </WithError>
      </div>
      <CreateCategory ref={modalRef} onSuccess={onSuccess} />
    </>
  );
};

export default CategorySelector;
