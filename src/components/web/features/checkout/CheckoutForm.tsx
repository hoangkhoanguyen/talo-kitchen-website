"use client";
import React, { FC } from "react";
import { RadioItem } from "../../ui/form";
import { useCheckoutContext } from "./CheckoutProvider";
import { Controller, useWatch } from "react-hook-form";
import { Button } from "../../ui/button";
import { cn, formatCurrencyWebsite } from "@/lib/utils";
import { EShippingMethod } from "@/types/app-configs";
import Icon from "@/components/common/Icon";
import { Link } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";
import GoToMenuButton from "../../shared/GoToMenuButton";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocale } from "@/lib/locale";

const CheckoutForm: FC<{ shippingMethods: any }> = ({ shippingMethods }) => {
  const { control, onCheckout, totalPrice, cartItems } = useCheckoutContext();
  const t = useTranslations("checkout");
  const locale = resolveLocale(useLocale());

  const shippingMethod = useWatch({
    control,
    name: "shippingMethod",
  });

  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="grid grid-cols-1 gap-5">
        <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
          {t("form.contactTitle")}
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
                placeholder={t("form.phonePlaceholder")}
              />
              {error?.message && (
                <p className="text-web-error text-xs mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="customerName"
          render={({ field, fieldState: { error } }) => (
            <div>
              <input
                {...field}
                type="text"
                className={cn("web-input", !!error && " web-input-error")}
                placeholder={t("form.namePlaceholder")}
              />
              {error?.message && (
                <p className="text-web-error text-xs mt-1">{error.message}</p>
              )}
            </div>
          )}
        />

        <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
          {t("form.paymentMethodTitle")}
        </h2>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <RadioItem
              checked={field.value === "cash"}
              onChange={() => field.onChange("cash")}
              label={t("form.onlyCash")}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-5">
        <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
          {t("form.shippingMethodTitle")}
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
          {t("form.deliveryTitle")}
        </h2>
        <p className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-2">
          {t("form.deliveryNote")}
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
                placeholder={t("form.deliveryAddressPlaceholder")}
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
                placeholder={t("form.addressNotePlaceholder")}
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
          {t("form.completeOrder", {
            amount: formatCurrencyWebsite(totalPrice, locale),
          })}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutForm;
