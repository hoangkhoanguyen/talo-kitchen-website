import React, { FC } from "react";
import AddonsEditor from "../../shared/AddonsEditor";
import { WebProductAddons } from "@/types/products";
import { useCartStore } from "@/hooks/web/cart/store";

const CardItemAddons: FC<{
  cartId: string;
  cartAddons: (WebProductAddons & {
    quantity: number;
  })[];
}> = ({ cartAddons, cartId }) => {
  const updateAddonQuantity = useCartStore(
    (state) => state.actions.updateAddonQuantity,
  );

  return (
    <AddonsEditor
      addons={cartAddons}
      onChangeQuantity={(id, quantity) => {
        updateAddonQuantity(cartId, id, quantity);
      }}
    />
  );
};

export default CardItemAddons;
