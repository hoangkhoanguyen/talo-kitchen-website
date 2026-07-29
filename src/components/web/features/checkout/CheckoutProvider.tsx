"use client";
import { useCartStore } from "@/hooks/web/cart/store";
import useGetCartProducts from "@/hooks/web/cart/useGetCartProducts";
import useCheckout from "@/hooks/web/checkout/useCheckout";
import { useSetLoading } from "@/hooks/web/ui/loading";
import { CreateOrderResponse } from "@/services/orders";
import { EShippingMethod } from "@/types/app-configs";
import { CartItemDisplay } from "@/types/cart";
import { CheckoutFormData, checkoutSchema } from "@/validations/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useMemo,
  useState,
} from "react";
import { Control, useForm, useWatch } from "react-hook-form";
import EmptyCart from "../cart/EmptyCart";
import Checking from "../../shared/Checking";
import { flushSync } from "react-dom";

const Context = createContext<{
  cartItems: CartItemDisplay[];
  control: Control<CheckoutFormData>;
  onCheckout: () => void;
  totalPrice: number;
  subTotalPrice: number;
  shippingFee: number;
  successOrder: CreateOrderResponse | null;
} | null>(null);

const CheckoutProvider: FC<
  PropsWithChildren<{
    shippingRules: any;
    defaultMethod?: EShippingMethod;
    shippingMethods: any;
  }>
> = ({ children, shippingRules, defaultMethod, shippingMethods }) => {
  const [successOrder, setSuccessOrder] = useState<CreateOrderResponse | null>(
    null,
  );
  const { mutate, isPending } = useCheckout();
  const clearCart = useCartStore((state) => state.actions.clearCart);
  const { cartItems, isLoading } = useGetCartProducts();
  const { control, handleSubmit } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onSubmit",
    defaultValues: {
      paymentMethod: "cash",
      shippingMethod: defaultMethod,
      addressNote: "",
      customerFirstName: "",
      customerLastName: "",
      customerPhone: "",
      deliveryAddress: "",
      note: "",
    },
  });

  const shippingMethod = useWatch({
    control,
    name: "shippingMethod",
  });

  const subTotalPrice = useMemo(() => {
    return cartItems.reduce(
      (acc, item) =>
        acc +
        item.price * item.quantity +
        item.addons.reduce(
          (result, addon) => result + addon.price * addon.quantity,
          0,
        ),
      0,
    );
  }, [cartItems]);

  const shippingFee = useMemo(() => {
    if (shippingRules && shippingMethod === EShippingMethod.door2door) {
      shippingRules.sort((a: any, b: any) => b.minOrderValue - a.minOrderValue);
      for (const rule of shippingRules) {
        if (subTotalPrice >= rule.minOrderValue) {
          return rule.shippingFee;
        }
      }
    }
    return 0;
  }, [shippingRules, shippingMethod, subTotalPrice]);

  const totalPrice = subTotalPrice + shippingFee;

  const onCheckout = handleSubmit((data: CheckoutFormData) => {
    mutate(
      {
        orderData: {
          customerPhone: data.customerPhone,
          firstName: data.customerFirstName,
          lastName: data.customerLastName,
          paymentMethod: data.paymentMethod,
          orderType: data.shippingMethod,
          deliveryAddress: data.deliveryAddress,
          totalPrice: totalPrice,
          shippingFee: shippingFee,
          note: data.note,
          addressNote: data.addressNote,
          internalNote: "",
          orderTypeLabel: shippingMethods.find(
            (item: any) => item.method === data.shippingMethod,
          )?.label,
        },
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
          productName: item.title,
          totalPrice: item.totalPrice,
          note: item.notes || "",
          addons: item.addons.map((addon) => ({
            quantity: addon.quantity,
            price: addon.price,
            totalPrice: addon.price * addon.quantity,
            addonId: addon.id,
            addonName: addon.name,
          })),
        })),
      },
      {
        onSuccess: (data) => {
          if (data.success && data.data) {
            flushSync(() => {
              setSuccessOrder(data.data);
              clearCart();
            });

            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        },
      },
    );
  });

  useSetLoading(isPending);

  const renderContent = () => {
    if (isLoading) {
      return <Checking />;
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
        control,
        onCheckout,
        totalPrice,
        shippingFee,
        subTotalPrice,
        successOrder,
      }}
    >
      {renderContent()}
    </Context.Provider>
  );
};

export default CheckoutProvider;

export const useCheckoutContext = () => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error(
      "useCheckoutContext must be used within a CheckoutProvider",
    );
  }
  return context;
};
