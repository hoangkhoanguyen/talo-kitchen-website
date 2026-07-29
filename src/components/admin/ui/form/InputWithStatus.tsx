import React, { ComponentProps, FC } from "react";
import { Input } from "./Input";
import { cn } from "@/lib/utils";

const InputWithStatus: FC<
  ComponentProps<typeof Input> & { error?: boolean }
> = ({ error, className, ...rest }) => {
  return (
    <Input className={cn(className, error ? "input-error" : "")} {...rest} />
  );
};

export default InputWithStatus;
