import InputWithStatus from "@/components/admin/ui/form/InputWithStatus";
import WithError from "@/components/admin/ui/form/WithError";
import React, { ComponentProps, FC } from "react";

const SettingsNumberInput: FC<
  Omit<ComponentProps<typeof InputWithStatus>, "onChange"> & {
    onChange?: (value: number) => void;
    errorMessage?: string;
  }
> = ({ onChange, errorMessage, ...props }) => {
  return (
    <WithError
      error={{
        message: errorMessage,
      }}
    >
      <InputWithStatus
        type="number"
        error={!!errorMessage}
        onChange={
          onChange &&
          ((e) => {
            onChange(Number(e.target.value));
          })
        }
        {...props}
      />
    </WithError>
  );
};

export default SettingsNumberInput;
