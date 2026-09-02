"use client";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "../../ui/button";
import { useRouter } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";
import { useCartContext } from "./CartProvider";
import { formatCurrencyWebsite } from "@/lib/utils";
import { resolveLocale } from "@/lib/locale";

const CartSubmit = () => {
  const router = useRouter();
  const t = useTranslations("cart");
  const locale = resolveLocale(useLocale());

  const { totalPrice } = useCartContext();

  const onGoCheckout = () => {
    router.push(webRoutes.checkout());
  };

  return (
    <Button
      className="w-full text-web-button-mobile lg:text-web-button text-web-background-1 py-4.5"
      variant={"secondary1"}
      onClick={onGoCheckout}
    >
      {t("checkout", { total: formatCurrencyWebsite(totalPrice, locale) })}
    </Button>
  );
};

export default CartSubmit;
