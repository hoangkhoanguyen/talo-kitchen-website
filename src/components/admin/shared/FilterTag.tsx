"use client";
import Icon from "@/components/common/Icon";
import React, { FC } from "react";

const FilterTag: FC<{
  label: string;
  value: string;
  onRemove(): void;
}> = ({ label, value, onRemove }) => {
  return (
    <span className="badge badge-soft badge-primary">
      {label}: {value}
      <button onClick={onRemove}>
        <Icon icon="ph:x" />
      </button>
    </span>
  );
};

export default FilterTag;
