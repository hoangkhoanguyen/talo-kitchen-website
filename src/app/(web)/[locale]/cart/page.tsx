import CartIntro from "@/components/web/features/cart/CartIntro";
import CartItems from "@/components/web/features/cart/CartItems";
import CartProvider from "@/components/web/features/cart/CartProvider";
import CartSummary from "@/components/web/features/cart/CartSummary";
import { buildAlternates, getOgLocale } from "@/lib/i18n-meta";
import { resolveLocale } from "@/lib/locale";
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

  const title = t("cart.title");
  const description = t("cart.description");
  const alternates = buildAlternates(locale, "/cart");

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

const CartPage = () => {
  return (
    <CartProvider>
      <div className="container py-10">
        <CartIntro />
        {/* <p className="text-web-body-mobile lg:text-web-body text-web-content-1 mb-10">
          Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing,
          Fresh mozzarella, Crisp romaine lettuce, parmesan cheese, croutons,
          Crisp romaine lettuce, parmesan cheese, croutons. Description Crisp
          romaine lettuce,
        </p> */}
        <CartItems />
        <CartSummary />
      </div>
    </CartProvider>
  );
};

export default CartPage;
