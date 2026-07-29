import { heroInitValue, heroMeta } from "./hero";
import { MetaValue } from "@/types/settings";
import { foodCategoriesInitValue, foodCategoriesMeta } from "./food-categories";
import { newProductInitValue, newProductMeta } from "./new-product";
import { NewConfigDB } from "@/db/schemas";
import { whyChooseUsInitialValue, whyChooseUsMeta } from "./why-choose-us";
import { seoInitialValue, seoMeta } from "./seo";

export const menuPageMeta: MetaValue[] = [
  seoMeta,
  heroMeta,
  // introductionMeta,
  foodCategoriesMeta,
  newProductMeta,
  whyChooseUsMeta,
];

export const initialMenuPageConfig: NewConfigDB = {
  key: "menu_page",
  title: "Cấu hình trang Menu",
  config_type: "ui",
  description: "Cấu hình các phần giao diện của trang Menu",
  value: {
    seo: seoInitialValue,
    hero: heroInitValue,
    // introduction: introductionInitValue,
    food_categories: foodCategoriesInitValue,
    new_product: newProductInitValue,
    why_choose_us: whyChooseUsInitialValue,
  },
};
