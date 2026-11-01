"use server";
import { createOrder, validateOrderData } from "@/services/orders";
import { computeOrderTotal } from "@/lib/order-edit";
import {
  NewOrderDB,
  NewOrderItemAddonDB,
  NewOrderItemDB,
} from "@/types/orders";

export async function createOrderAction(data: {
  orderData: Omit<NewOrderDB, "code">;
  orderItems: (Omit<NewOrderItemDB, "id" | "orderId"> & {
    addons?: Omit<NewOrderItemAddonDB, "id" | "orderItemId">[];
  })[];
}) {
  try {
    const validation = await validateOrderData(data.orderItems);

    if (!validation.ok) {
      return validation.code === "PRICE_CHANGED"
        ? {
            success: false,
            error: "Prices have been updated. Please review your order.",
            code: "PRICE_CHANGED",
          }
        : {
            success: false,
            error: "Invalid order data",
            code: "INVALID_ORDER_DATA",
          };
    }

    // Giá món do server chốt → tổng đơn tính lại từ đó (phí ship giữ nguyên)
    const shippingFee = data.orderData.shippingFee ?? 0;
    const createdOrder = await createOrder({
      orderData: {
        ...data.orderData,
        totalPrice: computeOrderTotal(validation.orderItems, shippingFee),
      },
      orderItems: validation.orderItems,
    });

    return {
      success: true,
      data: createdOrder,
    };
  } catch (error) {
    console.log('"createOrderAction" error', error);
    return {
      success: false,
      error: "Failed to create order",
    };
  }
}
