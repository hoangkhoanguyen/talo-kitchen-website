import { FieldType } from "@/types/settings";
import React, { FC } from "react";
import { Control, useWatch } from "react-hook-form";
import SettingTextField from "./fields/SettingTextField";
import SettingObjectField from "./fields/SettingObjectField";
import SettingImageField from "./fields/SettingImageField";
import SettingBooleanField from "./fields/SettingBooleanField";
import SettingTextareaField from "./fields/SettingTextareaField";
import SettingArrayField from "./fields/SettingArrayField";
import { omit } from "lodash";
import SettingNumberField from "./fields/SettingNumberField";
import SettingSelectField from "./fields/SettingSelectField";

const SettingField: FC<{
  item: FieldType;
  control: Control<any>;
  name: string;
}> = ({ item, control, name }) => {
  switch (item.type) {
    case "text":
      return (
        <SettingTextField
          control={control}
          name={name}
          {...omit(item, "type", "key")}
        />
      );
    case "number":
      return (
        <SettingNumberField
          control={control}
          name={name}
          {...omit(item, "type", "key")}
        />
      );
    case "textarea":
      return (
        <SettingTextareaField
          control={control}
          name={name}
          {...omit(item, "type", "key")}
        />
      );
    case "boolean":
      return (
        <SettingBooleanField
          control={control}
          name={name}
          {...omit(item, "type", "key")}
        />
      );
    case "image":
      return (
        <SettingImageField
          control={control}
          name={name}
          {...omit(item, "type", "key")}
        />
      );
    case "object":
      return (
        <SettingObjectField
          control={control}
          name={name}
          {...omit(item, "type", "key")}
        />
      );
    case "array":
      return (
        <SettingArrayField
          control={control}
          name={name}
          {...omit(item, "type", "key")}
        />
      );
    case "select":
      return (
        <SettingSelectField
          control={control}
          name={name}
          {...omit(item, "type", "key")}
        />
      );
  }
  return null;
};

export default SettingField;
