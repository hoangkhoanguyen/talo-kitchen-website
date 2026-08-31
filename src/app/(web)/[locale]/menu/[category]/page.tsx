import BannerSlider from "@/components/web/features/menu/BannerSlider";
import FoodCategories from "@/components/web/features/menu/FoodCategories";
import NewFood from "@/components/web/features/menu/NewFood";
import { WhyChooseUsSection } from "@/components/web/shared/WhyChooseUsSection";
import { getUIConfigsByKeyCached } from "@/services/cached";
import { APP_ICONS, APP_URL } from "@/constants/app";
import { resolveLocale } from "@/lib/locale";
import { Metadata } from "next";
import Image from "next/image";
import React from "react";
import type { Locale } from "@/types/configs";

// export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  const { category, locale } = await params;

  // Lấy config để tìm label của category
  const menuConfig = await getUIConfigsByKeyCached("menu_page", locale as Locale);
  const categories =
    (menuConfig?.value as any)?.food_categories?.categories_to_show || [];
  const seo = (menuConfig?.value as any)?.seo;

  // Thêm "all" category vào đầu
  const allCategories = [
    { key: "all", label: "All", page_title: "All Menu | TALO Kitchen & Lounge" },
    ...categories,
  ];

  // Tìm category từ config dựa vào key
  const categoryData = allCategories.find((cat: any) => cat.key === category);
  const categoryLabel = categoryData?.label || category;
  const categoryPageTitle = categoryData?.page_title;

  // Fallback values từ SEO config
  const defaultTitle = seo?.title
    ? `${categoryLabel} - ${seo.title}`
    : `Menu - ${categoryLabel} | TALO Kitchen & Lounge`;

  // Sử dụng page_title từ category config nếu có, nếu không dùng default
  const title = categoryPageTitle || defaultTitle;

  const description =
    seo?.description ||
    `Explore our delicious ${categoryLabel.toLowerCase()} menu at TALO Kitchen & Lounge. Fresh ingredients, authentic flavors.`;
  const url = `${APP_URL}/menu/${category}`;
  const keywords = seo?.keywords?.map((k: any) => k.keyword) || [];
  const ogTitle = seo?.og_title || title;
  const ogDescription = seo?.og_description || description;
  const ogImage =
    seo?.og_image?.url || `${APP_URL}/assets/static/menu-og-image.jpg`;
  const ogImageAlt =
    seo?.og_image?.alt || `${categoryLabel} Menu - TALO Kitchen & Lounge`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    icons: APP_ICONS,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: "TALO Kitchen & Lounge",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

const page = async ({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) => {
  const { category, locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const dbConfigs = await getUIConfigsByKeyCached("menu_page", locale);

  const configs = dbConfigs?.value as any;

  return (
    <div className="bg-web-background-3">
      <section className="relative">
        <BannerSlider autoplay={configs?.hero.autoplay}>
          {configs?.hero.images.map((item: any, index: number) => (
            <div className="relative w-full aspect-[21/9]" key={index}>
              <Image
                src={item.url}
                fill
                alt={item.alt}
                className="object-cover"
              />
            </div>
          ))}
        </BannerSlider>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block">
          <h1 className="flex flex-col items-center text-web-h1-mobile lg:text-web-h1 text-web-background-1 text-center mb-2.5 md:mb-10 text-shadow-black/10 text-shadow-md">
            {configs.hero.title.map((item: any, index: number) => (
              <span
                key={index}
                className={index % 2 === 0 ? "" : "text-web-secondary-1"}
              >
                {item.text}
              </span>
            ))}
          </h1>
        </div>
      </section>
      {/* <AboutMenu configs={configs?.introduction} /> */}
      <FoodCategories
        configs={configs?.food_categories}
        activeCategoryKey={category}
        locale={locale}
      />
      <NewFood configs={configs?.new_product} locale={locale} />
      <section className="bg-web-background-1">
        <WhyChooseUsSection configs={configs?.why_choose_us} />
      </section>
    </div>
  );
};

export default page;
