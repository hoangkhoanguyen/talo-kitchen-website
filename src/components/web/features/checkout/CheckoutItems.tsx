"use client";
import React from "react";
import { useCheckoutContext } from "./CheckoutProvider";
import OrderItem from "./OrderItem";

const CheckoutItems = () => {
  const { cartItems } = useCheckoutContext();
  return (
    <ul className="w-full flex-col gap-5">
      {cartItems.map((item) => (
        <OrderItem key={item.id} item={item} />
      ))}
    </ul>
  );
};

export default CheckoutItems;
