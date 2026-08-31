"use client";
import Image from "next/image";
import React, { FC } from "react";
import { useLocale, useTranslations } from "next-intl";
import CartItemQuantity from "./CartItemQuantity";
import CardItemAddons from "./CardItemAddons";
import CartItemTotalPrice from "./CartItemTotalPrice";
import CartItemNote from "./CartItemNote";
import { CartItemDisplay } from "@/types/cart";
import { formatCurrencyWebsite } from "@/lib/utils";
import Icon from "@/components/common/Icon";
import { useCartStore } from "@/hooks/web/cart/store";
import { resolveLocale } from "@/lib/locale";

const CartItem: FC<{ item: CartItemDisplay }> = ({ item }) => {
  const removeFromCart = useCartStore((state) => state.actions.removeFromCart);
  const t = useTranslations("cart");
  const locale = resolveLocale(useLocale());
  return (
    <div className="border-t border-web-content-3 pt-5 relative">
      <button
        className="absolute top-5 right-0 text-web-content-1"
        onClick={() => removeFromCart(item.id)}
      >
        <Icon icon="ph:trash" className="text-2xl" />
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-40 aspect-square relative overflow-hidden shrink-0">
            <Image
              src={item.imageUrl}
              alt={t("item.productImageAlt")}
              layout="fill"
              objectFit="cover"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <h3 className="text-web-body-mobile lg:text-web-body text-web-secondary-3 capitalize">
              {item.category}
            </h3>
            <h2 className="text-web-h3-mobile lg:text-web-h3 text-web-content-1 capitalize">
              {item.title}
            </h2>
            <p className="text-web-h4-mobile lg:text-web-h4">
              <span className="text-web-content-1">{t("item.priceLabel")}</span>{" "}
              <span className="text-web-secondary-1 uppercase">
                {formatCurrencyWebsite(item.price, locale)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-5">
          <CartItemQuantity
            price={item.price}
            quantity={item.quantity}
            id={item.id}
          />
          {item.addons.length > 0 && (
            <CardItemAddons cartId={item.id} cartAddons={item.addons} />
          )}
          <hr className="border-web-content-3" />
          <CartItemTotalPrice totalPrice={item.totalPrice} />
        </div>
      </div>
      <CartItemNote cartId={item.id} note={item.notes} />
    </div>
  );
};

export default CartItem;
