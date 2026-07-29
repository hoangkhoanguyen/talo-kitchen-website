import { useMemo } from "react";
import { useCartStore, useCartHydrated, useCrossTabSyncTrigger } from "./store";
import useGetProductsDetailsByIds from "../products/useGetProductsDetailsByIds";
import { CartItemDisplay } from "@/types/cart";

const useGetCartProducts = () => {
  const cart = useCartStore((state) => state.context.cart);
  const hydrated = useCartHydrated();
  const crossTabSyncVersion = useCrossTabSyncTrigger(); // Trigger refetch khi sync từ tab khác

  const productIds = useMemo(
    () => Array.from(new Set(cart.map((item) => item.productId))),
    [cart],
  );

  const { data: products, isLoading: isProductsLoading } =
    useGetProductsDetailsByIds({
      ids: productIds,
      enabled: hydrated,
      crossTabSyncVersion, // Truyền version để trigger refetch
    });

  const cartItems: CartItemDisplay[] = useMemo((): CartItemDisplay[] => {
    if (!products) return [];
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          ...item,
          title: product.title,
          imageUrl: product.imageUrl || "",
          category: product.category,
          price: product.price,
          slug: product.slug,
          addons: product.addons.map((addon) => ({
            id: addon.id,
            name: addon.name,
            price: addon.price,
            quantity: item.addons.find((a) => a.id === addon.id)?.quantity || 0,
          })),
          totalPrice:
            item.quantity * product.price +
            product.addons.reduce((sum, addon) => {
              const addonInCart = item.addons.find((a) => a.id === addon.id);
              if (!addonInCart) return sum;
              return sum + addon.price * addonInCart.quantity;
            }, 0),
        };
      })
      .filter((item) => item !== null);
  }, [cart, products]);

  // Loading nếu chưa hydrate hoặc đang fetch products
  const isLoading = !hydrated || isProductsLoading;

  return { cartItems, isLoading };
};

export default useGetCartProducts;
