import { useEffect, useMemo } from "react";
import { earliestEndsAt } from "@/lib/pricing";
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

  const {
    data: products,
    isLoading: isProductsLoading,
    refetch,
  } =
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
          originalPrice: product.originalPrice,
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

  // Giá khung giờ hết hiệu lực (mốc do server tính) → tải lại giá giỏ hàng
  const endsAt = useMemo(() => earliestEndsAt(products ?? []), [products]);
  useEffect(() => {
    if (!endsAt) return;
    const delay = new Date(endsAt).getTime() - Date.now() + 1000;
    if (delay > 24 * 60 * 60 * 1000) return;
    const timer = setTimeout(refetch, Math.max(delay, 0));
    return () => clearTimeout(timer);
  }, [endsAt, refetch]);

  return { cartItems, isLoading, refetch };
};

export default useGetCartProducts;
