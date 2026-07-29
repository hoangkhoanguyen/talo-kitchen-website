import Icon from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import React, { FC } from "react";

export const RadioItem: FC<{
  checked?: boolean;
  onChange(checked: boolean): void;
  label?: string;
}> = ({ checked, onChange, label }) => {
  return (
    <label
      className="flex items-center gap-2.5 web-input cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <Icon
        icon={checked ? "ph:check-circle-fill" : "ph:circle"}
        className={cn(
          "text-2xl",
          checked ? "text-web-secondary-1" : "text-web-content-3",
        )}
      />
      {label && <span>{label}</span>}
    </label>
  );
};
