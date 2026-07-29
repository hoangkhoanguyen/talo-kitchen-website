import { cn } from "@/lib/utils";
import React, { FC, InputHTMLAttributes } from "react";

export const Input: FC<InputHTMLAttributes<HTMLInputElement>> = ({
  className = "",
  ...props
}) => {
  return (
    <input className={cn("input rounded-xl w-full", className)} {...props} />
  );
};
