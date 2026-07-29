import { webRoutes } from "@/constants/route";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React, { FC } from "react";
import ProductCard from "../../shared/ProductCard";
import SectionSubTitleFromConfigs from "../../shared/SectionSubTitleFromConfigs";
import SectionTitleFromConfigs from "../../shared/SectionTitleFromConfigs";
import { getProductsByCategorySlugCached } from "@/services/cached";

const FoodCategories: FC<{ activeCategoryKey: string; configs: any }> = async ({
  activeCategoryKey,
  configs,
}) => {
  const products = await getProductsByCategorySlugCached(activeCategoryKey);

  const categoryLabel = configs.categories_to_show.find(
    (category: any) => category.key === activeCategoryKey,
  )?.label;

  return (
    <section className="pt-8 pb-24 bg-web-background-1">
      <div className="container">
        <h3 className="section-subtitle text-center mb-5">
          <SectionSubTitleFromConfigs sub_title={configs.sub_title} />
        </h3>
        <h2 className="text-center section-title flex flex-wrap items-center gap-2 justify-center mb-5">
          <SectionTitleFromConfigs title={configs.title} />
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-3 lg:gap-5 mb-10">
          <Link
            scroll={false}
            href={webRoutes.menu("all")}
            className={cn(
              "px-5 h-10 flex items-center  rounded-lg text-web-body-mobile lg:text-web-body",
              activeCategoryKey === "all"
                ? "text-web-background-1 bg-web-primary text-web-button-mobile lg:text-web-button"
                : "text-web-content-2 border border-web-content-2",
            )}
          >
            All
          </Link>
          {configs.categories_to_show.map((category: any) => (
            <Link
              scroll={false}
              href={webRoutes.menu(category.key)}
              key={category.key}
              className={cn(
                "px-5 h-10 flex items-center  rounded-lg text-web-body-mobile lg:text-web-body",
                activeCategoryKey === category.key
                  ? "text-web-background-1 bg-web-primary text-web-button-mobile lg:text-web-button"
                  : "text-web-content-2 border border-web-content-2",
              )}
            >
              {category.label}
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-x-2 md:gap-y-5 lg:gap-x-5 lg:gap-y-16">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryLabel={categoryLabel || ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FoodCategories;
