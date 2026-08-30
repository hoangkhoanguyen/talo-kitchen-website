import { formatCurrencyWebsite } from "@/lib/utils";
import React, { FC, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import QuantityEditor from "../QuantityEditor";
import AddonsEditor from "../AddonsEditor";
import { Button } from "../../ui/button";
import { WebProductDetails } from "@/types/products";
import { useCartStore } from "@/hooks/web/cart/store";
import Image from "next/image";

const QuickCartForm: FC<{
  product: Pick<
    WebProductDetails,
    "id" | "title" | "price" | "category" | "allergenInfo" | "addons" | "images"
  >;
  closeModal: () => void;
}> = ({ product, closeModal }) => {
  const addToCart = useCartStore((state) => state.actions.addToCart);
  const tCart = useTranslations("cart");
  const tProducts = useTranslations("products");
  const { title, price, category, allergenInfo, addons, images } = product;

  const [formState, setFormState] = useState({
    quantity: 1,
    addons: addons.reduce(
      (acc, addon) => ({
        ...acc,
        [addon.id]: 0,
      }),
      {} as Record<number, number>,
    ),
  });

  const totalPrice = useMemo(
    () =>
      formState.quantity * price +
      Object.entries(formState.addons).reduce((acc, [id, quantity]) => {
        const addon = addons.find((addon) => addon.id === Number(id));
        return acc + (addon ? addon.price * quantity : 0);
      }, 0),
    [formState, price, addons],
  );

  const handleAddToCart = () => {
    addToCart(
      {
        productId: product.id,
        quantity: formState.quantity,
        addons: Object.entries(formState.addons).map(([id, quantity]) => ({
          id: Number(id),
          quantity,
        })),
        notes: "",
      },
      title,
    );
    closeModal();
  };

  return (
    <>
      <div className="flex-1 overflow-auto px-3 pb-3">
        <div className="flex gap-2.5 mb-5">
          <div className="relative w-30 h-30 flex-shrink-0 rounded overflow-hidden hidden md:block">
            <Image
              src={images[0].url}
              alt={images[0].altText}
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="flex-1">
            <h4 className="text-web-label-mobile lg:text-web-label text-web-secondary-3 mb-2.5">
              {category}
            </h4>
            <h3 className="text-web-h3-mobile lg:text-web-h3 text-web-content-1 mb-2.5">
              {title}
            </h3>
            <p className="flex items-center gap-1">
              <span className="text-web-h4-mobile lg:text-web-h4 text-web-content-1">
                {tCart("item.priceLabel")}
              </span>
              <span className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
                {formatCurrencyWebsite(price)}
              </span>
            </p>
          </div>
        </div>
        <aside className="rounded-lg bg-web-background-3 p-3 mb-5">
          <h2 className="text-web-h4-mobile lg:text-web-h4 text-web-content-2 mb-2">
            {tProducts("foodIngredients")}
          </h2>
          <p className="text-web-content-2 text-web-caption-mobile lg:text-web-caption">
            {allergenInfo?.trim()
              ? allergenInfo
              : tProducts("noFoodIngredientsInfo")}
          </p>
        </aside>
        <div className="mb-5">
          <QuantityEditor
            price={price}
            onChangeQuantity={(quantity) => {
              if (quantity <= 0) return;
              setFormState((prev) => ({
                ...prev,
                quantity,
              }));
            }}
            quantity={formState.quantity}
          />
        </div>
        <div className="mb-5">
          <AddonsEditor
            addons={addons.map((addon) => ({
              id: addon.id,
              name: addon.name,
              price: addon.price,
              quantity: formState.addons[addon.id] || 0,
            }))}
            onChangeQuantity={(id, quantity) => {
              setFormState((prev) => ({
                ...prev,
                addons: {
                  ...prev.addons,
                  [id]: quantity,
                },
              }));
            }}
          />
        </div>

        <div className="flex justify-between items-center mb-5">
          <span className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
            {tCart("item.total")}
          </span>
          <span className="text-web-h3-mobile lg:text-web-h3 text-web-secondary-1">
            {formatCurrencyWebsite(totalPrice)}
          </span>
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-web-content-3">
        <Button
          disabled={formState.quantity <= 0}
          onClick={handleAddToCart}
          variant={"secondary1"}
          className="w-full text-web-background-1 text-web-button-mobile lg:text-web-button py-4.5"
        >
          {tProducts("addToCart", { price: formatCurrencyWebsite(totalPrice) })}
        </Button>
      </div>
    </>
  );
};

export default QuickCartForm;
