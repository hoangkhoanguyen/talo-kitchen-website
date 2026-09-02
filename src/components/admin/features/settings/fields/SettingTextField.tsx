import React, { FC } from "react";
import { Control, Controller } from "react-hook-form";
import SettingsTextInput from "../elements/SettingsTextInput";
import LocalizedFieldInput from "../elements/LocalizedFieldInput";
import { CommonField, TextField } from "@/types/settings";
import { InputWithLabel } from "@/components/admin/ui/form";

const SettingTextField: FC<
  Omit<TextField, "type" | "key"> &
    Omit<CommonField, "key"> & { control: Control; name: string }
> = ({ control, name, withLabel, isRequired, label, localized, ...props }) => {
  if (localized) {
    return (
      <LocalizedFieldInput
        control={control}
        name={name}
        variant="text"
        label={label}
        withLabel={withLabel}
        isRequired={isRequired}
        {...props}
      />
    );
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) =>
        withLabel ? (
          <InputWithLabel label={label} required={isRequired}>
            <SettingsTextInput
              value={value}
              onChange={onChange}
              errorMessage={error?.message}
              {...props}
            />
          </InputWithLabel>
        ) : (
          <SettingsTextInput
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

export default SettingTextField;
