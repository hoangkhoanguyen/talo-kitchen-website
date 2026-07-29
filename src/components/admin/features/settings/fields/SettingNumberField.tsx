import React, { FC } from "react";
import { Control, Controller } from "react-hook-form";
import SettingsNumberInput from "../elements/SettingsNumberInput";
import { CommonField, NumberField } from "@/types/settings";

const SettingNumberField: FC<
  Omit<NumberField, "type" | "key"> & { control: Control; name: string }
> = ({ control, name, ...props }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <SettingsNumberInput
          value={value}
          onChange={onChange}
          errorMessage={error?.message}
          {...props}
        />
      )}
    />
  );
};

export default SettingNumberField;
