import { ContactSection } from "@/components/web/features/home/ContactSection";
import { GallerySection } from "@/components/web/features/home/GallerySection";
import { HeroSection } from "@/components/web/features/home/HeroSection";
import { OurStorySection } from "@/components/web/features/home/OurStorySection";
import { ReviewsSection } from "@/components/web/features/home/ReviewsSection";
import { WhyChooseUsSection } from "@/components/web/shared/WhyChooseUsSection";
import { getUIConfigsByKeyCached } from "@/services/cached";
import { APP_ICONS, APP_URL } from "@/constants/app";
import { buildAlternates, getOgLocale } from "@/lib/i18n-meta";
import { resolveLocale } from "@/lib/locale";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const homeConfig = await getUIConfigsByKeyCached("homepage", locale);

  const seo = homeConfig?.value?.seo as any;
  const t = await getTranslations({ locale, namespace: "metadata" });

  // Fallback values
  const title = seo?.title || t("home.title");
  const description = seo?.description || t("home.description");
  const keywords = seo?.keywords?.map((k: any) => k.keyword) || [
    "TALO Kitchen & Lounge",
    "restaurant",
    "dining",
  ];
  const ogTitle = seo?.og_title || title;
  const ogDescription = seo?.og_description || description;
  const ogImage = seo?.og_image?.url || `${APP_URL}/assets/static/hero.png`;
  const ogImageAlt = seo?.og_image?.alt || "TALO Kitchen & Lounge";
  const alternates = buildAlternates(locale, "");

  return {
    title,
    description,
    keywords,
    alternates,
    icons: APP_ICONS,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: alternates.canonical,
      siteName: "TALO Kitchen & Lounge",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      locale: getOgLocale(locale),
      type: "website",
    },
  };
}

const HomePage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const homeConfig = await getUIConfigsByKeyCached("homepage", locale);

  return (
    <div>
      <HeroSection configs={homeConfig?.value.hero} />
      <OurStorySection configs={homeConfig?.value.our_story} />
      <section className="bg-web-background-1">
        <WhyChooseUsSection configs={homeConfig?.value.why_choose_us} />
      </section>
      <GallerySection configs={homeConfig?.value.gallery} />
      <ReviewsSection configs={homeConfig?.value.reviews} />
      <ContactSection configs={homeConfig?.value.contact} />
    </div>
  );
};

export default HomePage;
