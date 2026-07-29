import React, { FC } from "react";
import { Control, Controller } from "react-hook-form";
import SettingsTextareaInput from "../elements/SettingsTextareaInput";
import { CommonField, TextareaField } from "@/types/settings";
import { InputWithLabel } from "@/components/admin/ui/form";

const SettingTextareaField: FC<
  Omit<TextareaField, "type" | "key"> &
    Omit<CommonField, "key"> & { control: Control; name: string }
> = ({ control, name, withLabel, isRequired, label, ...props }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) =>
        withLabel ? (
          <InputWithLabel label={label} required={isRequired}>
            <SettingsTextareaInput
              value={value}
              onChange={onChange}
              errorMessage={error?.message}
              {...props}
            />
          </InputWithLabel>
        ) : (
          <SettingsTextareaInput
            value={value}
            onChange={onChange}
            errorMessage={error?.message}
            {...props}
          />
        )
      }
    />
  );
};

export default SettingTextareaField;
