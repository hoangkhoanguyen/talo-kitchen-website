import React, { FC, PropsWithChildren } from "react";
import { Label } from "./Label";

export const InputWithLabel: FC<
  PropsWithChildren<{ label: string; required?: boolean; className?: string }>
> = ({ children, label, required, className = "" }) => {
  return (
    <div className={className}>
      <Label>
        {label} {required && <span className="text-error">*</span>}
      </Label>
      {children}
    </div>
  );
};
