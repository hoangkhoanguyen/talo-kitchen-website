import { cn } from "@/lib/utils";
import React, { FC, InputHTMLAttributes } from "react";

export const Switch: FC<InputHTMLAttributes<HTMLInputElement>> = ({
  className = "",
  type = "checkbox",
  ...props
}) => {
  return (
    <input
      type={type}
      className={cn("toggle toggle-success", className)}
      {...props}
    />
  );
};
