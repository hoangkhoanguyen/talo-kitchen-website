import { Switch } from "@/components/admin/ui/form";
import React, { FC, PropsWithChildren } from "react";

const WithActive: FC<
  PropsWithChildren<{
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  }>
> = ({ children, checked, onCheckedChange }) => {
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={checked}
        onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default WithActive;
