export interface OrderItemAddon {
  id: number;
  quantity: number;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  productId: number;
  quantity: number;
  title: string;
  price: number;
  notes: string;
  addons: OrderItemAddon[];
  totalPrice: number; // price * quantity + addons total price
}
