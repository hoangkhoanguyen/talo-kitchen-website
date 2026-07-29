import { FieldType } from "@/types/settings";
import {
  booleanSettingSchema,
  imageSettingSchema,
  numberSettingSchema,
  textareaSettingSchema,
  textSettingSchema,
} from "@/validations/settings";
import z from "zod";

export function generateSettingFieldSchema(item: FieldType): z.ZodTypeAny {
  switch (item.type) {
    case "text":
      return item.isRequired
        ? textSettingSchema.min(1, { error: "Nội dung không được để trống" })
        : textSettingSchema;

    case "textarea":
      return item.isRequired
        ? textareaSettingSchema.min(1, {
            error: "Nội dung không được để trống",
          })
        : textareaSettingSchema;

    case "number":
      return numberSettingSchema;

    case "boolean":
      return booleanSettingSchema;

    case "object":
      return z.object(generateSettingSchema(item.fields));

    case "array":
      return z.array(generateSettingFieldSchema(item.itemType as FieldType));

    case "image":
      return item.isRequired
        ? imageSettingSchema
        : imageSettingSchema.optional();

    default:
      return z.any();
  }
}

export function generateSettingSchema(items: FieldType[]) {
  return items.reduce((acc, item) => {
    acc[item.key] = generateSettingFieldSchema(item);
    return acc;
  }, {} as Record<string, z.ZodType>);
}
