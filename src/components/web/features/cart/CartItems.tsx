"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { useCartContext } from "./CartProvider";
import CartItem from "./CartItem";

const CartItems = () => {
  const { cartItems } = useCartContext();
  const t = useTranslations("cart");
  return (
    <div className="flex flex-col items-stretch gap-10 mb-10">
      {cartItems.length === 0 && (
        <p className="text-web-body-mobile lg:text-web-body text-web-content-1">
          {t("itemsEmpty")}
        </p>
      )}
      {cartItems.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default CartItems;
