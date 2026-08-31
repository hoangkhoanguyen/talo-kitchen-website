import { routing } from "@/i18n/routing";
import {
  AddonTranslationForm,
  ProductAddonTranslationDB,
  ProductTranslationDB,
  ProductTranslationForm,
} from "@/types/products";

/**
 * Map mảng translation (mọi locale, từ admin fetch RULE-13) → record `{en,vi}` dùng cho form
 * (RULE-19/EC-05). Locale mặc định (`routing.defaultLocale`) thiếu row → seed từ cột gốc (safety
 * net cho dữ liệu cũ chưa seed/race). Locale khác thiếu row → rỗng, KHÔNG crash.
 *
 * Pure helper (KHÔNG import react-hook-form) — dùng được từ cả Server Component (page.tsx) lẫn
 * client hooks (useUpdateProductForm.ts) để tránh kéo `react-hook-form` vào bundle RSC.
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
      title: row?.title ?? (isDefaultLocale ? base.title : "") ?? "",
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

// Entity MỚI (chưa tồn tại) → mọi locale rỗng, không cần seed cột gốc (EC-05 chỉ áp dụng khi load
// entity cũ, xem mapProductTranslationsToForm).
export const createEmptyProductTranslations = (): ProductTranslationForm =>
  routing.locales.reduce((acc, locale) => {
    acc[locale] = {
      title: "",
      description: "",
      subDescription: "",
      allergenInfo: "",
    };
    return acc;
  }, {} as ProductTranslationForm);
