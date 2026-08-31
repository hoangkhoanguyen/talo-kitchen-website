import React, { FC } from "react";
import { getTranslations } from "next-intl/server";
import ProductImagesSlider from "./ProductImagesSlider";
import Image from "next/image";
import ProductQuantityEditor from "./ProductQuantityEditor";
import ProductAddOns from "./ProductAddOns";
import AddToCartButton from "./AddToCartButton";
import { WebProductDetails } from "@/types/products";
import { formatCurrencyWebsite, splitTextByNewLine } from "@/lib/utils";
import ProductEditorProvider from "./ProductEditorProvider";
import type { Locale } from "@/types/configs";

const ProductInformation: FC<{ product: WebProductDetails; locale?: Locale }> = async ({
  product,
  locale,
}) => {
  const t = await getTranslations("products");
  return (
    <ProductEditorProvider product={product}>
      <section className="bg-web-background-1">
        <div className="container">
          <div className="pb-10 lg:pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ProductImagesSlider
                thumbs={product.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative w-full aspect-square rounded-xs overflow-hidden"
                  >
                    <Image
                      fill
                      src={image.url}
                      alt={product.title}
                      className="object-contain"
                    />
                  </div>
                ))}
              >
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative w-full aspect-square border border-web-background-3 rounded-xs overflow-hidden"
                  >
                    <Image
                      fill
                      src={image.url}
                      alt={product.title}
                      className="object-contain"
                    />
                  </div>
                ))}
              </ProductImagesSlider>
              <div>
                <p className="text-web-body-mobile lg:text-web-body text-web-secondary-3 mb-2.5 capitalize">
                  {product.category}
                </p>
                <h1 className="text-web-h3-mobile lg:text-web-h3 text-web-content-1 mb-5">
                  {product.title}
                </h1>
                <p className="text-web-h2-mobile lg:text-web-h2 text-web-secondary-1 mb-5">
                  {formatCurrencyWebsite(product.price, locale)}
                </p>
                <aside className="rounded-lg bg-web-background-3 p-3 mb-5">
                  <h2 className="text-web-h4-mobile lg:text-web-h4 text-web-content-2 mb-2">
                    {t("foodIngredients")}
                  </h2>
                  <p className="text-web-content-2 text-web-caption-mobile lg:text-web-caption">
                    {product.allergenInfo || t("noFoodIngredientsInfo")}
                  </p>
                </aside>
                <hr className="border-web-content-3 mb-5" />
                <div className="mb-10">
                  <ProductQuantityEditor />
                </div>

                {product.addons.length > 0 && (
                  <div className="mb-11">
                    <ProductAddOns />
                  </div>
                )}
                <div>
                  <AddToCartButton />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-web-content-3" />
          <div className="py-10">
            <h2 className="text-web-h3-mobile lg:text-web-h3 mb-5 text-web-content-1">
              {t("description")}
            </h2>
            <div>
              {splitTextByNewLine(product.description || "").map(
                (text: string, index: number) => (
                  <p
                    key={index}
                    className="text-web-body-mobile lg:text-web-body text-web-content-1"
                  >
                    {text}
                  </p>
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </ProductEditorProvider>
  );
};

export default ProductInformation;
