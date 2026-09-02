import React, { FC } from "react";
import { getTranslations } from "next-intl/server";
import RelatedProductsSlider from "./RelatedProductsSlider";
import { WebProduct } from "@/types/products";
import ProductCard from "../../shared/ProductCard";
import type { Locale } from "@/types/configs";

const RelatedProducts: FC<{ products: WebProduct[]; locale?: Locale }> = async ({
  products,
  locale,
}) => {
  const t = await getTranslations("products");
  return (
    <section className="bg-web-background-2">
      <div className="container py-10">
        <h2 className="capitalize text-web-h3-mobile lg:text-web-h3 text-web-content-1 mb-5">
          {t("youAlsoLike")}
        </h2>
        <div>
          <RelatedProductsSlider>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </RelatedProductsSlider>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
