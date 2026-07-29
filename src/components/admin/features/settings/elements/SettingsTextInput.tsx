import InputWithStatus from "@/components/admin/ui/form/InputWithStatus";
import WithError from "@/components/admin/ui/form/WithError";
import React, { ComponentProps, FC } from "react";

const SettingsTextInput: FC<
  Omit<ComponentProps<typeof InputWithStatus>, "onChange"> & {
    onChange?: (value: string) => void;
    errorMessage?: string;
  }
> = ({ onChange, errorMessage, value = "", ...props }) => {
  return (
    <WithError
      error={{
        message: errorMessage,
      }}
    >
      <InputWithStatus
        type="text"
        error={!!errorMessage}
        value={value}
        onChange={
          onChange &&
          ((e) => {
            onChange(e.target.value);
          })
        }
        {...props}
      />
    </WithError>
  );
};

export default SettingsTextInput;
