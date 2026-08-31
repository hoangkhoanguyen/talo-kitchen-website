import { routing } from "@/i18n/routing";
import {
  AddonTranslationForm,
  AdminEditProductForm,
  ProductAddonTranslationDB,
  ProductTranslationDB,
  ProductTranslationForm,
} from "@/types/products";
import { updateProductSchema } from "@/validations/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createEmptyProductTranslations } from "./useAddProductForm";

/**
 * Map mảng translation (mọi locale, từ admin fetch RULE-13) → record `{en,vi}` dùng cho form
 * (RULE-19/EC-05). Locale mặc định (`routing.defaultLocale`) thiếu row → seed từ cột gốc (safety
 * net cho dữ liệu cũ chưa seed/race). Locale khác thiếu row → rỗng, KHÔNG crash.
 */
export const mapProductTranslationsToForm = (
  base: {
    title: string;
    description?: string | null;
    subDescription?: string | null;
    allergenInfo?: string | null;
  },
  translations: Pick<
    ProductTranslationDB,
    "locale" | "title" | "description" | "subDescription" | "allergenInfo"
  >[] = [],
): ProductTranslationForm => {
  return routing.locales.reduce((acc, locale) => {
    const row = translations.find((t) => t.locale === locale);
    const isDefaultLocale = locale === routing.defaultLocale;

    acc[locale] = {
      title:
        row?.title ?? (isDefaultLocale ? base.title : "") ?? "",
      description:
        row?.description ?? (isDefaultLocale ? base.description : "") ?? "",
      subDescription:
        row?.subDescription ??
        (isDefaultLocale ? base.subDescription : "") ??
        "",
      allergenInfo:
        row?.allergenInfo ?? (isDefaultLocale ? base.allergenInfo : "") ?? "",
    };
    return acc;
  }, {} as ProductTranslationForm);
};

/**
 * Map mảng translation addon (RULE-13) → record `{en,vi}`. Thiếu row `en` → seed từ `addon.name`
 * (cột gốc); thiếu `vi` → rỗng. KHÔNG crash khi mảng rỗng/undefined.
 */
export const mapAddonTranslationsToForm = (
  base: { name: string },
  translations: Pick<ProductAddonTranslationDB, "locale" | "name">[] = [],
): AddonTranslationForm => {
  return routing.locales.reduce((acc, locale) => {
    const row = translations.find((t) => t.locale === locale);
    const isDefaultLocale = locale === routing.defaultLocale;

    acc[locale] = {
      name: row?.name ?? (isDefaultLocale ? base.name : "") ?? "",
    };
    return acc;
  }, {} as AddonTranslationForm);
};

const useUpdateProductForm = () => {
  return useForm<AdminEditProductForm>({
    mode: "onSubmit",
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      slug: "",
      categoryId: 0,
      translations: createEmptyProductTranslations(),
      isActive: false,
      price: 0,
      addons: [],
      images: [],
      relatedProducts: [],
      priority: 0,
    },
  });
};

export default useUpdateProductForm;
