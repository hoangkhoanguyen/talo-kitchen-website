import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import { CartItem, CartItemDisplay } from "@/types/cart";
import { create, StateCreator } from "zustand";
import { toast } from "sonner";
import { capitalize } from "lodash";
import { useEffect, useState } from "react";

export interface CartItemsSlice {
  cart: CartItem[];
  length: number;
}

// Custom storage để đồng bộ giữa các tab
const createSyncedStorage = <T>(): PersistStorage<T> => ({
  getItem: (name: string): StorageValue<T> | null => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return JSON.parse(str);
  },
  setItem: (name: string, value: StorageValue<T>): void => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
});

export interface CartActionsSlice {
  addToCart: (item: Omit<CartItem, "id">, productName: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateAddonQuantity: (id: string, addonId: number, quantity: number) => void;
  updateNote: (id: string, notes: string) => void;
}

export type CartSlice = {
  context: CartItemsSlice;
  actions: CartActionsSlice;
  display: {
    cartItems: CartItemDisplay[];
    totalPrice: number;
  };
};

export const CART_STORAGE_KEY = "cart";

export const useCartStore = create<CartSlice>()(
  persist(
    (set, get) => ({
      context: {
        cart: [],
        length: 0,
      },
      display: {
        cartItems: [],
        totalPrice: 0,
      },
      actions: {
        addToCart: (item, productName) => {
          set((state) => {
            return {
              context: {
                cart: [
                  { ...item, id: crypto.randomUUID() },
                  ...state.context.cart,
                ],
                length: state.context.cart.length + 1,
              },
            };
          });
          toast.success(`${capitalize(productName)} added to cart`, {
            description: "Ready for checkout",
          });
        },
        removeFromCart(id) {
          set((state) => ({
            context: {
              cart: state.context.cart.filter((item) => item.id !== id),
              length: state.context.cart.length - 1,
            },
          }));
        },
        clearCart() {
          set(() => ({
            context: { cart: [], length: 0 },
          }));
        },
        updateQuantity(id, quantity) {
          if (quantity < 1) return;

          set((state) => ({
            context: {
              ...state.context,
              cart: state.context.cart.map((item) =>
                item.id === id ? { ...item, quantity } : item,
              ),
            },
          }));
        },
        updateAddonQuantity(id, addonId, quantity) {
          const item = get().context.cart.find((item) => item.id === id);
          if (!item) return;
          const addon = item.addons.find((addon) => addon.id === addonId);
          if (!addon) {
            set((state) => ({
              context: {
                ...state.context,
                cart: state.context.cart.map((cartItem) =>
                  cartItem.id === id
                    ? {
                        ...cartItem,
                        addons: [...cartItem.addons, { id: addonId, quantity }],
                      }
                    : cartItem,
                ),
              },
            }));

            return;
          }

          set((state) => ({
            context: {
              ...state.context,
              cart: state.context.cart.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      addons: item.addons.map((addon) =>
                        addon.id === addonId ? { ...addon, quantity } : addon,
                      ),
                    }
                  : item,
              ),
            },
          }));
        },
        updateNote(id, notes) {
          set((state) => ({
            context: {
              ...state.context,
              cart: state.context.cart.map((item) =>
                item.id === id ? { ...item, notes } : item,
              ),
            },
          }));
        },
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createSyncedStorage<{ context: CartItemsSlice }>(),
      partialize(state) {
        return { context: state.context };
      },
    },
  ),
);

// Helper để kiểm tra đã hydrate chưa
export const useCartHydrated = () => {
  const [hydrated, setHydrated] = useState(
    // Kiểm tra ngay lập tức nếu đã hydrate
    () => useCartStore.persist.hasHydrated(),
  );

  useEffect(() => {
    // Nếu đã hydrated thì không cần subscribe
    if (hydrated) return;

    // Subscribe để nhận event khi hydrate xong
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsubscribe;
  }, [hydrated]);

  return hydrated;
};

// Store để track khi cart thay đổi từ tab khác
let crossTabSyncListeners: Set<() => void> = new Set();

export const subscribeToCrossTabSync = (callback: () => void) => {
  crossTabSyncListeners.add(callback);
  return () => {
    crossTabSyncListeners.delete(callback);
  };
};

const notifyCrossTabSync = () => {
  crossTabSyncListeners.forEach((callback) => callback());
};

// Hook để lắng nghe khi cart thay đổi từ tab khác
export const useCrossTabSyncTrigger = () => {
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToCrossTabSync(() => {
      setSyncVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  return syncVersion;
};

// Đồng bộ giỏ hàng giữa các tab trong cùng trình duyệt
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === CART_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.state?.context) {
          useCartStore.setState({
            context: parsed.state.context,
          });
          // Thông báo cho các listener rằng cart đã thay đổi từ tab khác
          notifyCrossTabSync();
        }
      } catch (error) {
        console.error("Error syncing cart between tabs:", error);
      }
    }
  });
}
