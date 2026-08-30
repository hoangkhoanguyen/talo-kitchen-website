import Image from "next/image";
import React, { FC } from "react";
import ProductCard from "../../shared/ProductCard";
import { Link } from "@/i18n/navigation";
import SectionTitleFromConfigs from "../../shared/SectionTitleFromConfigs";
import SectionSubTitleFromConfigs from "../../shared/SectionSubTitleFromConfigs";
import { splitTextByNewLine } from "@/lib/utils";
import { webRoutes } from "@/constants/route";
import { getProductBySlugCached } from "@/services/cached";

const NewFood: FC<{ configs: any }> = async ({ configs }) => {
  if (!configs.isShow) return null;

  const product = await getProductBySlugCached(configs?.product_slug);

  if (!product) return null;

  return (
    <section className="bg-web-background-3">
      <div className="py-10 pb-6 container">
        <h3 className="section-subtitle mb-5 text-center">
          <SectionSubTitleFromConfigs sub_title={configs?.sub_title} />
        </h3>
        <h2 className="section-title text-center mb-2.5 text-web-content-1 flex flex-wrap items-center justify-center gap-x-2">
          <SectionTitleFromConfigs title={configs?.title} />
        </h2>
        <div className="flex flex-col items-stretch gap-2 mb-10">
          {splitTextByNewLine(configs?.description).map(
            (line: string, index: number) => (
              <p
                key={index}
                className="max-w-3xl text-center block mx-auto text-web-subtitle-mobile lg:text-web-subtitle text-web-content-2"
              >
                {line}
              </p>
            ),
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-5">
          <div className="col-span-1 md:col-span-2 relative border border-web-content-3 rounded-xl overflow-hidden">
            <div className="relative aspect-[3/2] lg:aspect-auto md:h-full">
              <Image
                src={configs?.banner?.url}
                alt={configs?.banner?.alt || "New Food Banner"}
                fill
                className="object-cover"
              />
            </div>
            <div className="relative md:absolute md:bottom-0 md:left-0 md:w-full md:p-5 flex gap-5 items-end">
              <div className="bg-web-background-3 p-2.5 md:px-5 md:rounded-lg flex-1">
                <div className="flex">
                  <div className="flex-1 flex flex-col items-stretch gap-2.5">
                    <div>
                      <h3 className="text-web-h4-mobile lg:text-web-h4 text-web-content-1 mb-1">
                        {configs.label}
                      </h3>
                      <p className="text-web-caption-mobile lg:text-web-caption text-web-content-1">
                        {configs.sub_label}
                      </p>
                    </div>
                    <Link
                      href={webRoutes.dish(configs?.product_slug)}
                      className="md:hidden bg-web-secondary-2 text-web-content-1 text-center rounded-lg py-4 text-web-button-mobile lg:text-web-button hover:bg-web-secondary-1 duration-200"
                    >
                      Discover
                    </Link>
                  </div>
                </div>
              </div>
              <Link
                href={webRoutes.dish(configs?.product_slug)}
                className="hidden md:block bg-web-secondary-2 text-web-content-1 text-center rounded-lg py-4 md:px-10 text-web-button-mobile lg:text-web-button hover:bg-web-secondary-1 duration-200"
              >
                Discover
              </Link>
            </div>
          </div>

          <ProductCard product={product} />
        </div>
      </div>
    </section>
  );
};

export default NewFood;
