import { z } from "zod";

export const productCategorySchema = z.object({
  name: z
    .string()
    .min(1, { error: "Tên danh mục không được để trống" })
    .max(255, { error: "Tên danh mục quá dài" }),
  slug: z
    .string()
    .min(1, { error: "Đường dẫn không được để trống" })
    .max(255, { error: "Đường dẫn quá dài" })
    .refine((val) => !/\s/.test(val), {
      error: "Đường dẫn không được chứa khoảng trắng",
    }),
  isActive: z.boolean().optional(),
  description: z.string().max(1000, { error: "Mô tả quá dài" }).optional(),
});

const productAddonSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, { error: "Tên addons không được để trống" })
    .max(255, { error: "Tên addons quá dài" }),
  price: z.number({ error: "Giá không hợp lệ" }),
  isActive: z.boolean(),
});

const productImageSchema = z.object({
  id: z.number().optional(),
  url: z.string({ message: "URL hình ảnh không hợp lệ" }),
});

const basicProductSchema = {
  title: z
    .string({ error: "Tên sản phẩm không được để trống" })
    .min(1, { error: "Tên sản phẩm không được để trống" })
    .max(255, { error: "Tên sản phẩm quá dài" }),
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
  allergenInfo: z.string().optional(),
  subDescription: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  price: z
    .number({ error: "Giá không hợp lệ" })
    .nonnegative({ error: "Giá phải là lớn hơn 0" }),
  relatedProducts: z.array(relatedProductSchema),
  addons: z.array(productAddonSchema),
  images: z.array(productImageSchema),
  priority: z.number(),
});
