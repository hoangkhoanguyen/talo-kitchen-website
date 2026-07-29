"use client";
import useGetCartProducts from "@/hooks/web/cart/useGetCartProducts";
import { CartItemDisplay } from "@/types/cart";
import React, { FC, PropsWithChildren, useMemo } from "react";
import EmptyCart from "./EmptyCart";
import Checking from "../../shared/Checking";

const Context = React.createContext<{
  cartItems: CartItemDisplay[];
  totalPrice: number;
} | null>(null);

const CartProvider: FC<PropsWithChildren> = ({ children }) => {
  const { cartItems, isLoading } = useGetCartProducts();

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cartItems]);

  const renderContent = () => {
    if (isLoading) {
      return <Checking />; // Hoặc một component loading khác
    }

    if (cartItems.length === 0) {
      return <EmptyCart />;
    }
    return children;
  };

  return (
    <Context.Provider
      value={{
        cartItems,
        totalPrice,
      }}
    >
      {renderContent()}
    </Context.Provider>
  );
};

export default CartProvider;

export const useCartContext = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};
