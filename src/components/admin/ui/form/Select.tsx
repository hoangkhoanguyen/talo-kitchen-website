import { cn } from "@/lib/utils";
import React, { FC, SelectHTMLAttributes } from "react";

export const Select: FC<SelectHTMLAttributes<HTMLSelectElement>> = ({
  className = "",
  ...props
}) => {
  return (
    <select className={cn("select rounded-xl w-full", className)} {...props} />
  );
};
