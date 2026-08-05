import ProductInformation from "@/components/web/features/products/ProductInformation";
import RelatedProducts from "@/components/web/features/products/RelatedProducts";
import { APP_URL } from "@/constants/app";
import {
  getRelatedProductsCached,
  getProductDetailsBySlugCached,
} from "@/services/cached";
import { Metadata } from "next";
import React, { FC } from "react";
import NotFound from "@/components/web/shared/NotFound";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetailsBySlugCached(slug);

  if (!product) {
    return {
      title: "Product Not Found | TALO Kitchen & Lounge",
    };
  }

  const title = `${product.title} | TALO Kitchen & Lounge`;
  const description =
    product.description || `Discover ${product.title} at TALO Kitchen & Lounge`;
  const url = `${APP_URL}/dish/${slug}`;
  const imageUrl =
    product.images?.[0]?.url || "/assets/static/dish-og-image.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    icons: {
      icon: `/talo-logo-bg.svg`,
      apple: `/talo-logo-bg.svg`,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "TALO Kitchen & Lounge",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
  };
}

const page: FC<{ params: Promise<{ slug: string }> }> = async ({ params }) => {
  const { slug } = await params;

  const product = await getProductDetailsBySlugCached(slug);

  if (!product) {
    return <NotFound />;
  }

  const relatedProducts = await getRelatedProductsCached(
    product.relatedProductIds,
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
