import z from "zod";
import { MINUTES_PER_DAY } from "@/lib/pricing";

export const priceSlotSchema = z
  .object({
    daysOfWeek: z
      .array(z.number().int().min(0).max(6))
      .min(1, { error: "Chọn ít nhất 1 ngày" }),
    startMinute: z.number().int().min(0).max(MINUTES_PER_DAY - 1),
    endMinute: z.number().int().min(1).max(MINUTES_PER_DAY),
    price: z
      .number({ error: "Nhập giá" })
      .positive({ error: "Giá phải lớn hơn 0" })
      .max(1_000_000_000),
  })
  .refine((s) => s.startMinute < s.endMinute, {
    error: "Giờ kết thúc phải sau giờ bắt đầu",
    path: ["endMinute"],
  });

export const priceProgramSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Nhập tên chương trình" })
    .max(255, { error: "Tối đa 255 ký tự" }),
  isActive: z.boolean(),
  slots: z.array(priceSlotSchema).min(1, { error: "Thêm ít nhất 1 khung giờ" }),
  productIds: z
    .array(z.number().int().positive())
    .min(1, { error: "Chọn ít nhất 1 món" }),
});

export type PriceProgramFormInput = z.infer<typeof priceProgramSchema>;
