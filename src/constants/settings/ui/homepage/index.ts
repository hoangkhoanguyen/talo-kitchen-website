import { MetaValue } from "@/types/settings";
import { heroInitialValue, heroMeta } from "./hero";
import { NewConfigDB } from "@/db/schemas";
import { ourStoryInitialValue, ourStoryMeta } from "./our-story";
import { whyChooseUsInitialValue, whyChooseUsMeta } from "./why-choose-us";
import { galleryInitValue, galleryMeta } from "./gallery";
import { reviewsInitValue, reviewsMeta } from "./reviews";
import { contactInitValue, contactMeta } from "./contact";
import { seoInitialValue, seoMeta } from "./seo";

export const homepageMeta: MetaValue[] = [
  seoMeta,
  heroMeta,
  ourStoryMeta,
  whyChooseUsMeta,
  galleryMeta,
  reviewsMeta,
  contactMeta,
];

export const initialHomepageConfig: NewConfigDB = {
  key: "homepage",
  title: "Cấu hình trang chủ",
  config_type: "ui",
  description: "Cấu hình các phần giao diện của trang chủ",
  value: {
    seo: seoInitialValue,
    hero: heroInitialValue,
    our_story: ourStoryInitialValue,
    why_choose_us: whyChooseUsInitialValue,
    gallery: galleryInitValue,
    reviews: reviewsInitValue,
    contact: contactInitValue,
  },
};
