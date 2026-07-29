"use client";
import { useCartStore } from "@/hooks/web/cart/store";
import { WebProductDetails } from "@/types/products";
import React, { FC, PropsWithChildren, useCallback, useState } from "react";

interface ProductState {
  price: number;
  quantity: number;
  title: string;
  id: number;
  addons: { id: number; name: string; price: number; quantity: number }[];
}

const Context = React.createContext<{
  product: ProductState;
  onChangeQuantity(quantity: number): void;
  onChangeAddonQuantity(id: number, quantity: number): void;
  onAddToCart(): void;
} | null>(null);

const ProductEditorProvider: FC<
  PropsWithChildren<{ product: WebProductDetails }>
> = ({ children, product }) => {
  const [state, setState] = useState({
    price: product.price,
    quantity: 1,
    title: product.title,
    id: product.id,
    addons: product.addons.map((addon) => ({ ...addon, quantity: 0 })),
  });

  const onInitProductState = useCallback(() => {
    setState({
      price: product.price,
      quantity: 1,
      title: product.title,
      id: product.id,
      addons: product.addons.map((addon) => ({ ...addon, quantity: 0 })),
    });
  }, [product]);

  const addToCart = useCartStore((state) => state.actions.addToCart);

  const onChangeQuantity = useCallback((quantity: number) => {
    if (quantity < 1) return;
    setState((prev) => ({
      ...prev,
      quantity,
    }));
  }, []);

  const onChangeAddonQuantity = useCallback((id: number, quantity: number) => {
    if (quantity < 0) return;
    setState((prev) => ({
      ...prev,
      addons: prev.addons.map((addon) =>
        addon.id === id ? { ...addon, quantity } : addon,
      ),
    }));
  }, []);

  const onAddToCart = useCallback(() => {
    addToCart(
      {
        productId: product.id,
        quantity: state.quantity,
        addons: state.addons.filter((addon) => addon.quantity > 0),
        notes: "",
      },
      product.title,
    );
    onInitProductState();
  }, [
    addToCart,
    onInitProductState,
    product.id,
    state.addons,
    state.quantity,
    product.title,
  ]);

  return (
    <Context.Provider
      value={{
        product: state,
        onChangeQuantity,
        onChangeAddonQuantity,
        onAddToCart,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ProductEditorProvider;

export const useProductEditorContext = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      "useProductEditorContext must be used within ProductEditorProvider",
    );
  }
  return context;
};
