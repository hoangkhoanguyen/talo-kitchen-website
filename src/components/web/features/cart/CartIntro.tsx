"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { useCartContext } from "./CartProvider";

const CartIntro = () => {
  const { cartItems } = useCartContext();
  const t = useTranslations("cart");
  return (
    <h1 className="text-web-h3-mobile lg:text-web-h3 text-web-content-1 mb-5">
      {t("title", { count: cartItems.length })}
    </h1>
  );
};

export default CartIntro;
