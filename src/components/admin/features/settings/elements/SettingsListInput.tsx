import { Button, IconButton } from "@/components/admin/ui/button";
import Icon from "@/components/common/Icon";
import React, { FC, ReactNode } from "react";

const SettingsListInput: FC<{
  children: ReactNode[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  isEditableList?: boolean;
}> = ({ children, onAdd, onRemove, isEditableList }) => {
  return (
    <div className="flex flex-col gap-4 items-stretch">
      {children.length > 0 &&
        children.map((child, index) => (
          <div key={index} className={"flex items-start gap-2"}>
            <div className="flex-1">{child}</div>
            {isEditableList && (
              <IconButton
                icon="ph:x-bold"
                color="error"
                onClick={() => onRemove(index)}
              />
            )}
          </div>
        ))}
      {isEditableList && (
        <Button className="rounded-lg" onClick={onAdd}>
          <Icon icon={"ph:plus"} />
        </Button>
      )}
    </div>
  );
};

export default SettingsListInput;
