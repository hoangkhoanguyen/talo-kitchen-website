import { formatCurrencyWebsite } from "@/lib/utils";
import React, { FC } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/types/configs";

const CartItemTotalPrice: FC<{ totalPrice: number; locale?: Locale }> = ({
  totalPrice,
  locale,
}) => {
  const t = useTranslations("cart");
  return (
    <div className="flex items-center justify-between gap-5">
      <p className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
        {t("item.total")}
      </p>
      <span className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
        {formatCurrencyWebsite(totalPrice, locale)}
      </span>
    </div>
  );
};

export default CartItemTotalPrice;
