import React, { FC } from "react";
import { Control, Controller } from "react-hook-form";
import SettingsBooleanInput from "../elements/SettingsBooleanInput";

const SettingBooleanField: FC<{
  control: Control;
  name: string;
  label?: string;
  description?: string;
}> = ({ control, name, label, description }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <SettingsBooleanInput checked={value} onCheckedChange={onChange} />
          {label && (
            <span className="flex flex-col">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              {description && (
                <span className="text-xs text-gray-400">{description}</span>
              )}
            </span>
          )}
        </label>
      )}
    />
  );
};

export default SettingBooleanField;
