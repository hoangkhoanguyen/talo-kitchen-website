import { WebProduct } from "./products";

export interface CartItemAddon {
  id: number;
  quantity: number;
}

export interface CartItem {
  id: string; // uuid generated
  productId: number;
  quantity: number;
  addons: CartItemAddon[];
  notes: string;
}

export type CartItemDisplay = Omit<CartItem, "addons"> &
  Pick<WebProduct, "title" | "price" | "imageUrl" | "category" | "slug"> & {
    addons: (CartItemAddon & {
      name: string;
      price: number;
    })[];
    totalPrice: number;
  };
