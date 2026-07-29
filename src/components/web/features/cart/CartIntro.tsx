"use client";
import React from "react";
import { useCartContext } from "./CartProvider";

const CartIntro = () => {
  const { cartItems } = useCartContext();
  return (
    <h1 className="text-web-h3-mobile lg:text-web-h3 text-web-content-1 mb-5">
      Your Cart ({cartItems.length})
    </h1>
  );
};

export default CartIntro;
