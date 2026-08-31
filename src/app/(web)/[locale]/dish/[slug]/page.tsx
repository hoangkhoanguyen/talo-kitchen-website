import ProductInformation from "@/components/web/features/products/ProductInformation";
import RelatedProducts from "@/components/web/features/products/RelatedProducts";
import { APP_ICONS } from "@/constants/app";
import { buildAlternates, getOgLocale } from "@/lib/i18n-meta";
import { resolveLocale } from "@/lib/locale";
import {
  getRelatedProductsCached,
  getProductDetailsBySlugCached,
} from "@/services/cached";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import React, { FC } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const product = await getProductDetailsBySlugCached(slug, locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  if (!product) {
    return {
      title: `${t("dish.notFound")} | TALO Kitchen & Lounge`,
    };
  }

  const title = `${product.title} | TALO Kitchen & Lounge`;
  const description =
    product.description ||
    t("dish.descriptionFallback", { title: product.title });
  const alternates = buildAlternates(locale, `/dish/${slug}`);
  const imageUrl =
    product.images?.[0]?.url || "/assets/static/dish-og-image.jpg";

  return {
    title,
    description,
    alternates,
    icons: APP_ICONS,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "TALO Kitchen & Lounge",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      locale: getOgLocale(locale),
      type: "website",
    },
  };
}

const page: FC<{ params: Promise<{ slug: string; locale: string }> }> = async ({
  params,
}) => {
  const { slug, locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);

  const product = await getProductDetailsBySlugCached(slug, locale);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProductsCached(
    product.relatedProductIds,
    locale,
  );

  return (
    <div>
      <ProductInformation
        product={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          images: product.images || [],
          description: product.description || "",
          allergenInfo: product.allergenInfo || "",
          price: product.price || 0,
          addons: product.addons || [],
          category: product.category.name,
          subDescription: product.subDescription || "",
        }}
      />
      {relatedProducts.length > 0 && (
        <RelatedProducts
          products={relatedProducts.map((relatedProduct) => ({
            ...relatedProduct,
            images: relatedProduct.images || [],
            imageUrl: relatedProduct.images[0]?.url || "",
            subDescription: relatedProduct.subDescription || "",
            category: relatedProduct.category.name,
          }))}
        />
      )}
    </div>
  );
};

export default page;
