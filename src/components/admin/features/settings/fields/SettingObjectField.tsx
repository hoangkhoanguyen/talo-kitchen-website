import { ObjectField } from "@/types/settings";
import React, { FC } from "react";
import { Control } from "react-hook-form";
import SettingField from "../SettingField";
import SettingsInput from "../SettingsInput";

const SettingObjectField: FC<
  Omit<ObjectField, "type" | "key"> & {
    control: Control;
    name: string;
  }
> = ({ control, name, fields, needBox }) => {
  return (
    <div className="flex flex-col gap-y-4">
      {fields.map((field) =>
        needBox ? (
          <SettingsInput
            key={field.key}
            label={field.label}
            description={field.description}
            required={field.isRequired}
          >
            <SettingField
              control={control}
              item={field}
              name={`${name}.${field.key}`}
            />
          </SettingsInput>
        ) : (
          <SettingField
            key={field.key}
            control={control}
            item={field}
            name={`${name}.${field.key}`}
          />
        ),
      )}
    </div>
  );
};

export default SettingObjectField;
