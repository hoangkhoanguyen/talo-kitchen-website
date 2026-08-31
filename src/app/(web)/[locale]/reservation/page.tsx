import Content from "@/components/web/features/reservation/Content";
import DefaultBookingSection from "@/components/web/features/reservation/DefaultBookingSection";
import ReservationProvider from "@/components/web/features/reservation/ReservationProvider";
import {
  getAppConfigsByKeyCached,
  getUIConfigsByKeyCached,
} from "@/services/cached";
import { APP_ICONS, APP_URL } from "@/constants/app";
import { buildAlternates, getOgLocale } from "@/lib/i18n-meta";
import { resolveLocale } from "@/lib/locale";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import React from "react";

// export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const t = await getTranslations({ locale, namespace: "metadata" });

  const reservationConfig = await getUIConfigsByKeyCached(
    "reservation_page",
    locale,
  );
  const seo = (reservationConfig?.value as any)?.seo;

  const title = seo?.title || t("reservation.title");
  const description = seo?.description || t("reservation.description");
  const alternates = buildAlternates(locale, "/reservation");
  const url = alternates.canonical;
  const keywords = seo?.keywords?.map((k: any) => k.keyword) || [];
  const ogTitle = seo?.og_title || title;
  const ogDescription = seo?.og_description || description;
  const ogImage =
    seo?.og_image?.url || `${APP_URL}/assets/static/reservation-og-image.jpg`;
  const ogImageAlt =
    seo?.og_image?.alt || "Reserve Your Table at TALO Kitchen & Lounge";

  return {
    title,
    description,
    keywords,
    alternates,
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
      locale: getOgLocale(locale),
      type: "website",
    },
  };
}

const page = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const configsDb = await getUIConfigsByKeyCached("reservation_page", locale);

  const reservationConfigs = await getAppConfigsByKeyCached("reservation");

  const configs = configsDb?.value || ({} as any);

  return (
    <div className="bg-web-background-3">
      <ReservationProvider reservationConfigs={reservationConfigs?.value}>
        <Content configs={configs.booking}>
          <section>
            <div className="w-full aspect-[21/9] relative">
              <Image
                src={configs.hero?.banner.url || ""}
                alt={configs.hero?.banner.alt || ""}
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 z-10 justify-center items-center hidden lg:flex">
                <h1 className="flex flex-col items-center text-web-h1-mobile lg:text-web-h1 text-shadow-black/10 text-shadow-md">
                  {configs.hero?.title.map((item: any, index: number) => (
                    <span
                      className={
                        index % 2 === 0
                          ? "text-web-background-1"
                          : "text-web-secondary-1"
                      }
                      key={index}
                    >
                      {item.text}
                    </span>
                  ))}
                </h1>
              </div>
            </div>
          </section>
          <DefaultBookingSection configs={configs.booking} />
        </Content>
      </ReservationProvider>
    </div>
  );
};

export default page;
