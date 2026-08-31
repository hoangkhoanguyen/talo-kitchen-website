import { z } from "zod";

// Bản dịch (RULE-01/RULE-19): en (defaultLocale) required, vi optional (fallback về en khi rỗng)
const productTranslationSchema = z.object({
  en: z.object({
    title: z
      .string({ error: "Tên sản phẩm không được để trống" })
      .min(1, { error: "Tên sản phẩm không được để trống" })
      .max(255, { error: "Tên sản phẩm quá dài" }),
    description: z.string().optional(),
    subDescription: z.string().optional(),
    allergenInfo: z.string().optional(),
  }),
  vi: z.object({
    title: z.string().max(255, { error: "Tên sản phẩm quá dài" }).optional(),
    description: z.string().optional(),
    subDescription: z.string().optional(),
    allergenInfo: z.string().optional(),
  }),
});

const categoryTranslationSchema = z.object({
  en: z.object({
    name: z
      .string({ error: "Tên danh mục không được để trống" })
      .min(1, { error: "Tên danh mục không được để trống" })
      .max(255, { error: "Tên danh mục quá dài" }),
    description: z.string().max(1024, { error: "Mô tả quá dài" }).optional(),
  }),
  vi: z.object({
    name: z.string().max(255, { error: "Tên danh mục quá dài" }).optional(),
    description: z.string().max(1024, { error: "Mô tả quá dài" }).optional(),
  }),
});

const addonTranslationSchema = z.object({
  en: z.object({
    name: z
      .string({ error: "Tên addons không được để trống" })
      .min(1, { error: "Tên addons không được để trống" })
      .max(255, { error: "Tên addons quá dài" }),
  }),
  vi: z.object({
    name: z.string().max(255, { error: "Tên addons quá dài" }).optional(),
  }),
});

export const productCategorySchema = z.object({
  slug: z
    .string()
    .min(1, { error: "Đường dẫn không được để trống" })
    .max(255, { error: "Đường dẫn quá dài" })
    .refine((val) => !/\s/.test(val), {
      error: "Đường dẫn không được chứa khoảng trắng",
    }),
  isActive: z.boolean().optional(),
  translations: categoryTranslationSchema,
});

const productAddonSchema = z.object({
  id: z.number().optional(),
  price: z.number({ error: "Giá không hợp lệ" }),
  isActive: z.boolean(),
  translations: addonTranslationSchema,
});

const productImageSchema = z.object({
  id: z.number().optional(),
  url: z.string({ message: "URL hình ảnh không hợp lệ" }),
});

const basicProductSchema = {
  slug: z
    .string()
    .min(1, { error: "Đường dẫn không được để trống" })
    .max(255, { error: "Đường dẫn quá dài" })
    .refine((val) => !/\s/.test(val), {
      error: "Đường dẫn không được chứa khoảng trắng",
    }),
  categoryId: z.number({ error: "Danh mục không hợp lệ" }).min(1, {
    error: "Danh mục không được để trống",
  }),
  translations: productTranslationSchema,
};

export const createProductSchema = z.object({
  ...basicProductSchema,
});

const relatedProductSchema = z.object({
  id: z.number({ error: "Sản phẩm liên quan không hợp lệ" }).min(1, {
    error: "Sản phẩm liên quan không hợp lệ",
  }),
  title: z.string(),
});

export const updateProductSchema = z.object({
  ...basicProductSchema,
  isActive: z.boolean(),
  price: z
    .number({ error: "Giá không hợp lệ" })
    .nonnegative({ error: "Giá phải là lớn hơn 0" }),
  relatedProducts: z.array(relatedProductSchema),
  addons: z.array(productAddonSchema),
  images: z.array(productImageSchema),
  priority: z.number(),
});
