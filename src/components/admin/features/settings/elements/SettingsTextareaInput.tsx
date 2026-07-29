import { Textarea } from "@/components/admin/ui/form";
import WithError from "@/components/admin/ui/form/WithError";
import { cn } from "@/lib/utils";
import React, { ComponentProps, FC } from "react";

const SettingsTextareaInput: FC<
  Omit<ComponentProps<typeof Textarea>, "onChange"> & {
    onChange?: (value: string) => void;
    errorMessage?: string;
  }
> = ({ className, onChange, errorMessage, value = "", ...props }) => {
  return (
    <WithError error={{ message: errorMessage }}>
      <Textarea
        className={cn(errorMessage && "textarea-error", className)}
        rows={5}
        value={value}
        onChange={
          onChange &&
          ((e) => {
            onChange(e.target.value);
          })
        }
        {...props}
      ></Textarea>
    </WithError>
  );
};

export default SettingsTextareaInput;
