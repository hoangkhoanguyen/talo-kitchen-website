import { ContactSection } from "@/components/web/features/home/ContactSection";
import { GallerySection } from "@/components/web/features/home/GallerySection";
import { HeroSection } from "@/components/web/features/home/HeroSection";
import { OurStorySection } from "@/components/web/features/home/OurStorySection";
import { ReviewsSection } from "@/components/web/features/home/ReviewsSection";
import { WhyChooseUsSection } from "@/components/web/shared/WhyChooseUsSection";
import { getUIConfigsByKeyCached } from "@/services/cached";
import { APP_ICONS, APP_URL } from "@/constants/app";
import { Metadata } from "next";
import type { Locale } from "@/types/configs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const homeConfig = await getUIConfigsByKeyCached("homepage", locale as Locale);

  const seo = homeConfig?.value?.seo as any;

  // Fallback values
  const title = seo?.title || "TALO Kitchen & Lounge - Home";
  const description =
    seo?.description ||
    "Welcome to TALO Kitchen & Lounge, where culinary excellence meets a warm and inviting atmosphere.";
  const keywords = seo?.keywords?.map((k: any) => k.keyword) || [
    "TALO Kitchen & Lounge",
    "restaurant",
    "dining",
  ];
  const ogTitle = seo?.og_title || title;
  const ogDescription = seo?.og_description || description;
  const ogImage = seo?.og_image?.url || `${APP_URL}/assets/static/hero.png`;
  const ogImageAlt = seo?.og_image?.alt || "TALO Kitchen & Lounge";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: APP_URL,
    },
    icons: APP_ICONS,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: APP_URL,
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

const HomePage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const homeConfig = await getUIConfigsByKeyCached("homepage", locale as Locale);

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
