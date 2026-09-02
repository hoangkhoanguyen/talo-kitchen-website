import { routing } from "@/i18n/routing";
import { normalizeLocalized } from "@/lib/localized-config";
import z from "zod";

export function localizedTextSchema({
  isRequired,
  variant,
}: {
  isRequired?: boolean;
  variant: "text" | "textarea";
}): z.ZodTypeAny {
  const shape = routing.locales.reduce((acc, locale) => {
    acc[locale] =
      variant === "text"
        ? z
            .string()
            .max(255, { error: "Nội dung quá dài, tối đa 255 ký tự" })
            .optional()
        : z.string().optional();
    return acc;
  }, {} as Record<string, z.ZodTypeAny>);

  const baseSchema = z.object(shape).refine(
    (val) => {
      if (!isRequired) return true;
      const defaultValue = val[routing.defaultLocale];
      return typeof defaultValue === "string" && defaultValue.length > 0;
    },
    {
      error: "Nội dung không được để trống",
      path: [routing.defaultLocale],
    }
  );

  return z.preprocess((v) => normalizeLocalized(v), baseSchema);
}

export const textSettingSchema = z.string().max(255, {
  error: "Nội dung quá dài, tối đa 255 ký tự",
});

export const textareaSettingSchema = z.string();

export const numberSettingSchema = z.number({
  error: "Giá trị phải là số",
});

export const booleanSettingSchema = z.boolean({
  error: "Giá trị phải là true hoặc false",
});

export const imageSettingSchema = z.object({
  url: z.string().min(1, { message: "URL không được để trống" }),
  alt: z
    .string()
    .min(1, {
      error: "Alt text không được để trống",
    })
    .max(255, "Alt text quá dài, tối đa 255 ký tự"),
});
