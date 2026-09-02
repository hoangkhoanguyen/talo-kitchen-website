import {
  productAddonTranslations,
  productAddons,
  productCategories,
  productCategoryTranslations,
  productImages,
  productTranslations,
  products,
} from "@/db/schemas";
import type { Locale } from "@/types/configs";
import {
  createProductSchema,
  productCategorySchema,
  updateProductSchema,
} from "@/validations/product";
import { z } from "zod";

export type ProductDB = typeof products.$inferSelect;
export type NewProductDB = typeof products.$inferInsert;
export type UpdateProductDB = Partial<NewProductDB>;

export type ProductCategoryDB = typeof productCategories.$inferSelect;
export type NewProductCategoryDB = typeof productCategories.$inferInsert;
export type UpdateProductCategoryDB = Partial<NewProductCategoryDB>;

export type ProductAddOnDB = typeof productAddons.$inferSelect;
export type NewProductAddOnDB = Omit<
  typeof productAddons.$inferInsert,
  "createdAt" | "updatedAt"
>;
export type UpdateProductAddOnDB = Omit<
  Partial<NewProductAddOnDB>,
  "createdAt" | "updatedAt"
>;

export type ProductImageDB = typeof productImages.$inferSelect;
export type NewProductImageDB = Omit<
  typeof productImages.$inferInsert,
  "createdAt" | "updatedAt"
>;
export type UpdateProductImageDB = Omit<
  Partial<NewProductImageDB>,
  "createdAt" | "updatedAt"
>;

export type ProductTranslationDB = typeof productTranslations.$inferSelect;
export type NewProductTranslationDB = typeof productTranslations.$inferInsert;

export type ProductCategoryTranslationDB =
  typeof productCategoryTranslations.$inferSelect;
export type NewProductCategoryTranslationDB =
  typeof productCategoryTranslations.$inferInsert;

export type ProductAddonTranslationDB =
  typeof productAddonTranslations.$inferSelect;
export type NewProductAddonTranslationDB =
  typeof productAddonTranslations.$inferInsert;

// Admin form nested (RULE-19): translations record theo locale
export type ProductTranslationForm = Record<
  Locale,
  {
    title: string;
    description?: string;
    subDescription?: string;
    allergenInfo?: string;
  }
>;

export type CategoryTranslationForm = Record<
  Locale,
  { name: string; description?: string }
>;

export type AddonTranslationForm = Record<Locale, { name: string }>;

export type AdminProductTableApi = ProductDB & {
  category: ProductCategoryDB;
  images: ProductImageDB[];
};

export interface AdminProductTable {
  id: number;
  title: string;
  price: number | null;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  slug: string;
  priority: number | null;
}

export interface AdminProductAddons {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

export interface AdminProductCategory {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  description: string | null;
}

export interface AdminProductImage {
  id: number;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export type AdminRelatedProduct = Pick<AdminProductTable, "id" | "title">;

export interface AdminProductDetails
  extends Omit<AdminProductTable, "category" | "imageUrl"> {
  images: AdminProductImage[];
  addons: AdminProductAddons[];
  category: AdminProductCategory;
  slug: string;
  allergenInfo: string | null;
  subDescription: string | null;
  description: string | null;
  relatedProducts: AdminRelatedProduct[];
  isActive: boolean;
}

export type AdminCreateProductForm = z.infer<typeof createProductSchema>;

export type AdminCreateProductCategoryForm = z.infer<
  typeof productCategorySchema
>;

export type AdminEditProductForm = z.infer<typeof updateProductSchema>;

// website
export interface WebProductCategory {
  id: number;
  name: string;
}
export interface WebProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
  subDescription: string;
  category: string;
}

export interface WebProductImage {
  id: number;
  url: string;
  altText: string;
}

export interface WebProductAddons {
  id: number;
  name: string;
  price: number;
}

export interface WebProductDetails extends Omit<WebProduct, "imageUrl"> {
  images: WebProductImage[];
  description: string | null;
  allergenInfo: string | null;
  addons: WebProductAddons[];
}
