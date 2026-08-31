"use client";
import React, { FC } from "react";
import { QuantityButtons } from "../ui/button";
import { formatCurrencyWebsite } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocale } from "@/lib/locale";

const QuantityEditor: FC<{
  price: number;
  quantity: number;
  onChangeQuantity(quantity: number): void;
}> = ({ price, quantity, onChangeQuantity }) => {
  const t = useTranslations("common");
  const locale = resolveLocale(useLocale());

  return (
    <div>
      <p className="text-web-h3-mobile lg:text-web-h3 mb-5 text-web-content-1">
        {t("amount")}
      </p>
      <div className="flex justify-between items-center gap-5">
        <QuantityButtons
          onChangeQuantity={onChangeQuantity}
          quantity={quantity}
        />
        <p className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
          {formatCurrencyWebsite(price, locale)}
        </p>
      </div>
    </div>
  );
};

export default QuantityEditor;
