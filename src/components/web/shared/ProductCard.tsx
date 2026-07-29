import Image from "next/image";
import React, { FC } from "react";
import QuickCartButton from "./quick-cart/QuickCartButton";
import Link from "next/link";
import { webRoutes } from "@/constants/route";
import { WebProduct } from "@/types/products";
import { formatCurrencyWebsite } from "@/lib/utils";

const ProductCard: FC<{ product: WebProduct; categoryLabel?: string }> = ({
  product,
  categoryLabel,
}) => {
  return (
    <Link
      href={webRoutes.dish(product.slug)}
      className="flex flex-col rounded-xl overflow-hidden border border-web-content-3 @container hover:shadow-lg duration-200 cursor-pointer h-full"
    >
      <div className="w-full aspect-square bg-gray-300 relative">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center"
        />
      </div>
      <div className="flex-1 bg-web-background-3 py-5 px-3 flex flex-col justify-between gap-5">
        <div>
          <p className="text-web-label-mobile lg:text-web-label text-web-secondary-3 mb-0.5 capitalize">
            {categoryLabel || product.category}
          </p>
          <p className="text-web-h3-mobile lg:text-web-h3 text-web-content-1 mb-2.5 line-clamp-1">
            {product.title}
          </p>
          <p className="text-web-body-mobile lg:text-web-body text-web-content-1 line-clamp-3 h-[57.6px]">
            {product.subDescription}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-primary">
            {formatCurrencyWebsite(product.price)}
          </span>
          <QuickCartButton data={{ id: product.id, title: product.title }} />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
