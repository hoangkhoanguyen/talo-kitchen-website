"use client";
import React, { FC } from "react";
import { RadioItem } from "../../ui/form";
import { useCheckoutContext } from "./CheckoutProvider";
import { Controller, useWatch } from "react-hook-form";
import { Button } from "../../ui/button";
import { cn, formatCurrencyWebsite } from "@/lib/utils";
import { EShippingMethod } from "@/types/app-configs";
import Icon from "@/components/common/Icon";
import Link from "next/link";
import { webRoutes } from "@/constants/route";
import GoToMenuButton from "../../shared/GoToMenuButton";

const CheckoutForm: FC<{ shippingMethods: any }> = ({ shippingMethods }) => {
  const { control, onCheckout, totalPrice, cartItems } = useCheckoutContext();

  const shippingMethod = useWatch({
    control,
    name: "shippingMethod",
  });

  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="grid grid-cols-1 gap-5">
        <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
          Contact
        </h2>

        <Controller
          control={control}
          name="customerPhone"
          render={({ field, fieldState: { error } }) => (
            <div>
              <input
                {...field}
                type="tel"
                className={cn("web-input", !!error && " web-input-error")}
                placeholder="Phone number in Vietnam"
              />
              {error?.message && (
                <p className="text-web-error text-xs mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="customerFirstName"
          render={({ field, fieldState: { error } }) => (
            <div>
              <input
                {...field}
                type="text"
                className={cn("web-input", !!error && " web-input-error")}
                placeholder="First name"
              />
              {error?.message && (
                <p className="text-web-error text-xs mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="customerLastName"
          render={({ field, fieldState: { error } }) => (
            <div>
              <input
                {...field}
                type="text"
                className={cn("web-input", !!error && " web-input-error")}
                placeholder="Last name"
              />
              {error?.message && (
                <p className="text-web-error text-xs mt-1">{error.message}</p>
              )}
            </div>
          )}
        />

        <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
          Payment Method
        </h2>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <RadioItem
              checked={field.value === "cash"}
              onChange={() => field.onChange("cash")}
              label="Only Cash"
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-5">
        <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
          Shipping Method
        </h2>
        <Controller
          control={control}
          name="shippingMethod"
          render={({ field: { value, onChange } }) => (
            <div className="flex flex-col gap-10">
              {shippingMethods.map((method: any) => (
                <div className="flex flex-col gap-5" key={method.method}>
                  <p className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-2">
                    {method.description}
                  </p>
                  <RadioItem
                    checked={value === method.method}
                    onChange={() => onChange(method.method)}
                    label={method.label}
                  />
                </div>
              ))}
            </div>
          )}
        />
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-5 overflow-hidden duration-200",
          shippingMethod === EShippingMethod.door2door ? "h-auto" : "h-0",
        )}
      >
        <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
          Delivery
        </h2>
        <p className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-2">
          We will deliver within a 10km radius. If your address is too far from
          the restaurant, we will call to confirm with you.
        </p>
        <Controller
          control={control}
          name="deliveryAddress"
          render={({ field, fieldState: { error } }) => (
            <div>
              <input
                {...field}
                type="text"
                className={cn("web-input", !!error && " web-input-error")}
                placeholder="Delivery address"
              />
              {error?.message && (
                <p className="text-web-error text-xs mt-1">{error.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="addressNote"
          render={({ field, fieldState: { error } }) => (
            <div>
              <input
                {...field}
                type="text"
                className={cn("web-input", !!error && " web-input-error")}
                placeholder="Apartment, Homestay, etc (optional)"
              />
              {error?.message && (
                <p className="text-web-error text-xs mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      <div className="py-2 border-t border-web-content-3 items-stretch gap-4 flex fixed z-30 bottom-0 left-0 right-0 bg-web-background-1 px-3 lg:px-0 lg:relative lg:inset-0">
        <GoToMenuButton />
        <Button
          disabled={cartItems.length === 0}
          onClick={onCheckout}
          className="w-full text-web-button-mobile lg:text-web-button py-5 text-web-background-1"
          variant={"secondary1"}
        >
          Complete the Order &bull; {formatCurrencyWebsite(totalPrice)}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutForm;
