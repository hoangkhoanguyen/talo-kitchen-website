import React, { FC } from "react";
import { cn, formatCurrencyWebsite } from "@/lib/utils";
import type { Locale } from "@/types/configs";

/** Giá hiệu lực; nếu đang áp giá khung giờ thì kèm giá gốc gạch ngang. */
const PriceTag: FC<{
  price: number;
  originalPrice?: number | null;
  locale?: Locale;
  className?: string;
}> = ({ price, originalPrice, locale, className }) => (
  <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
    {originalPrice && originalPrice > price && (
      <s className="text-[0.75em] opacity-60 font-normal">
        {formatCurrencyWebsite(originalPrice, locale)}
      </s>
    )}
    <span>{formatCurrencyWebsite(price, locale)}</span>
  </span>
);

export default PriceTag;
