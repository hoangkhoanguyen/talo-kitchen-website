import React, { FC } from "react";
import { Control, Controller } from "react-hook-form";

const SettingSelectField: FC<{
  control: Control;
  name: string;
  label?: string;
  description?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
}> = ({ control, name, options, placeholder }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    />
  );
};

export default SettingSelectField;
