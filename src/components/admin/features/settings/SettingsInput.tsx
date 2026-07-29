import React, { FC, PropsWithChildren } from "react";
import { Label } from "../../ui/form";

const SettingsInput: FC<
  PropsWithChildren<{
    label: string;
    required?: boolean;
    description?: string;
    isAlwaysShow?: boolean;
  }>
> = ({ label, required, description, children }) => {
  return (
    <div className="border border-gray-200 bg-white p-4 rounded-xl">
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <Label>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          {/* {!isAlwaysShow && <Switch className="toggle-sm" />} */}
        </div>
        {description && (
          <p className="text-xs mb-1 text-gray-500 italic">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default SettingsInput;
