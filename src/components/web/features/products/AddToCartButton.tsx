"use client";
import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "../../ui/button";
import { useProductEditorContext } from "./ProductEditorProvider";
import { formatCurrencyWebsite } from "@/lib/utils";

const AddToCartButton = () => {
  const t = useTranslations("products");
  const { product, onAddToCart } = useProductEditorContext();

  const total = useMemo(
    () =>
      product.price * product.quantity +
      product.addons.reduce(
        (acc, addon) => acc + addon.price * addon.quantity,
        0,
      ),
    [product],
  );

  return (
    <Button
      onClick={onAddToCart}
      variant={"secondary1"}
      className="w-full text-web-background-1 text-web-button-mobile lg:text-web-button py-4.5"
    >
      {t("addToCart", { price: formatCurrencyWebsite(total) })}
    </Button>
  );
};

export default AddToCartButton;
