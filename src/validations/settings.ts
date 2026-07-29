import z from "zod";

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
