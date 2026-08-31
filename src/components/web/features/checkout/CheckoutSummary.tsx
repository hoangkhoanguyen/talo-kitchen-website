"use client";
import React from "react";
import CheckoutItems from "./CheckoutItems";
import Note from "./Note";
import { useCheckoutContext } from "./CheckoutProvider";
import { formatCurrencyWebsite } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocale } from "@/lib/locale";

const CheckoutSummary = () => {
  const { totalPrice, subTotalPrice, shippingFee } = useCheckoutContext();
  const t = useTranslations("checkout");
  const locale = resolveLocale(useLocale());
  return (
    <div className="grid grid-cols-1 gap-5">
      <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
        {t("summary.title")}
      </h2>
      <CheckoutItems />
      <p className="text-web-h3-mobile lg:text-web-h3 text-web-content-1">
        {t("summary.noteHeading")}
      </p>
      <Note />
      <div className="h-1 border-y border-web-content-3"></div>
      <div className="flex flex-col gap-2.5 items-stretch">
        <div className="flex justify-between items-center">
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-content-1">
            {t("summary.subtotal")}
          </span>
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
            {formatCurrencyWebsite(subTotalPrice, locale)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-content-1">
            {t("summary.shipping")}
          </span>
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
            {formatCurrencyWebsite(shippingFee, locale)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
          {t("summary.total")}
        </span>
        <span className="text-web-h2-mobile lg:text-web-h2 text-web-secondary-1">
          {formatCurrencyWebsite(totalPrice, locale)}
        </span>
      </div>
    </div>
  );
};

export default CheckoutSummary;
