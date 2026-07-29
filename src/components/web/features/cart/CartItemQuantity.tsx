"use client";
import React, { FC } from "react";
import QuantityEditor from "../../shared/QuantityEditor";
import { useCartStore } from "@/hooks/web/cart/store";

const CartItemQuantity: FC<{ id: string; price: number; quantity: number }> = ({
  id,
  price,
  quantity,
}) => {
  const updateQuantity = useCartStore((state) => state.actions.updateQuantity);
  return (
    <QuantityEditor
      price={price}
      quantity={quantity}
      onChangeQuantity={(quantity) => updateQuantity(id, quantity)}
    />
  );
};

export default CartItemQuantity;
