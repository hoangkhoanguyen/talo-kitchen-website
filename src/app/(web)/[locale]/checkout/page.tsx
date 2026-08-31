import CheckoutProvider from "@/components/web/features/checkout/CheckoutProvider";
import CheckoutRender from "@/components/web/features/checkout/CheckoutRender";
import { buildAlternates, getOgLocale } from "@/lib/i18n-meta";
import { resolveLocale } from "@/lib/locale";
import { getAppConfigsByKeyCached } from "@/services/cached";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  const title = t("checkout.title");
  const description = t("checkout.description");
  const alternates = buildAlternates(locale, "/checkout");

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "TALO Kitchen & Lounge",
      type: "website",
      locale: getOgLocale(locale),
    },
  };
}

const page = async () => {
  const orderConfigs = await getAppConfigsByKeyCached("order");

  return (
    <CheckoutProvider
      shippingMethods={orderConfigs?.value.shipping.methods}
      defaultMethod={
        ((orderConfigs?.value.shipping.methods as any[]) || []).find(
          (item: any) => item.isDefault,
        )?.method
      }
      shippingRules={orderConfigs?.value.shipping.rules}
    >
      <CheckoutRender configs={orderConfigs?.value} />
    </CheckoutProvider>
  );
};

export default page;
