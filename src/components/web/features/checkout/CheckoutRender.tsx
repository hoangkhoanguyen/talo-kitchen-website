"use client";
import React, { FC, ReactNode } from "react";
import CheckoutForm from "./CheckoutForm";
import CheckoutSummary from "./CheckoutSummary";
import Icon from "@/components/common/Icon";
import { Button } from "../../ui/button";
import { Link } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";
import OrderItem from "./OrderItem";
import { useCheckoutContext } from "./CheckoutProvider";
import { formatCurrencyWebsite } from "@/lib/utils";
import { useTranslations } from "next-intl";

const CheckoutRender: FC<{ configs: any }> = ({ configs }) => {
  const { successOrder } = useCheckoutContext();
  const t = useTranslations("checkout");

  if (!successOrder)
    return (
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <CheckoutForm shippingMethods={configs.shipping.methods} />
          </div>
          <div className="lg:pt-14 lg:pb-10 lg:bg-web-background-3 lg:px-5">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    );

  const renderTitle = () => (
    <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
      {t("summary.title")}
    </h2>
  );

  const renderOrderContent = () => (
    <>
      <ul className="w-full flex-col gap-5 mt-9 mb-5">
        {successOrder.items.map((item) => (
          <OrderItem
            key={item.id}
            item={{
              productId: item.productId,
              title: item.productName,
              imageUrl: item.productImageUrl,
              price: item.price,
              quantity: item.quantity,
              notes: item.note,
              category: "",
              slug: item.productSlug,
              totalPrice: item.totalPrice,
              addons: item.addons.map((addon) => ({
                id: addon.id,
                name: addon.addonName,
                price: addon.price,
                quantity: addon.quantity,
              })),
            }}
          />
        ))}
      </ul>
      <ul className="flex flex-col gap-2.5 items-stretch">
        <li className="flex justify-between items-center">
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-content-1">
            {t("summary.subtotal")}
          </span>
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
            {formatCurrencyWebsite(
              successOrder.order.totalPrice - successOrder.order.shippingFee,
            )}
          </span>
        </li>
        <li className="flex justify-between items-center">
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-content-1">
            {t("summary.shippingFee")}
          </span>
          <span className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
            {successOrder.order.shippingFee
              ? formatCurrencyWebsite(successOrder.order.shippingFee)
              : t("summary.free")}
          </span>
        </li>
        <li className="flex justify-between items-center">
          <span className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
            {t("summary.total")}
          </span>
          <span className="text-web-h2-mobile lg:text-web-h2 text-web-secondary-1">
            {formatCurrencyWebsite(successOrder.order.totalPrice)}
          </span>
        </li>
      </ul>
    </>
  );

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-web-h2-mobile lg:text-web-h2 text-web-content-1 mb-5">
            {t("success.title")}
          </h2>
          <p className="text-web-body-mobile lg:text-web-body text-web-content-1 mb-5">
            {t("success.thankYouMessage")}
          </p>
          <p className="text-web-body-mobile lg:text-web-body text-web-content-1 mb-10">
            {t("success.confirmCallMessage")}
          </p>
          <Card>
            <CardTitle label={t("success.yourContact")} icon="ph:phone" />
            <ul className="flex flex-col gap-5">
              <InfoItem
                label={t("success.orderCodeLabel")}
                value={`#${successOrder.order.code}`}
              />
              <InfoItem
                label={t("success.phoneLabel")}
                value={successOrder.order.customerPhone}
              />
              <InfoItem
                label={t("success.paymentMethodLabel")}
                value={t("form.onlyCash")}
              />
              <InfoItem
                label={t("success.shippingMethodLabel")}
                value={successOrder.order.orderTypeLabel || ""}
              />
            </ul>
          </Card>
          <div className="lg:mt-5 fixed z-20 lg:z-0 lg:static bottom-0 left-0 w-full bg-white lg:bg-transparent p-5 lg:p-0">
            <Button
              as={Link}
              href={webRoutes.home()}
              variant={"primary"}
              className="w-full text-web-button-mobile lg:text-web-button py-4 rounded-lg"
            >
              {t("success.backToHome")}
            </Button>
          </div>
        </div>
        <div className="lg:pt-14 lg:pb-10 lg:bg-web-background-3 lg:px-5">
          <div className="hidden lg:block">
            {renderTitle()}
            {renderOrderContent()}
          </div>
          <details className="lg:hidden">
            <summary className="flex justify-between items-center">
              {renderTitle()}
              <Icon
                icon="ph:caret-down"
                className="text-web-content-2 text-2xl"
              />
            </summary>
            {renderOrderContent()}
          </details>
        </div>
      </div>
    </div>
  );
};

export default CheckoutRender;

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-web-background-3 border border-web-content-3 p-5 flex flex-col items-stretch gap-10">
      {children}
    </div>
  );
}

function CardTitle({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon icon={icon} className="text-2xl text-web-secondary-1" />

      <h3 className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-1 capitalize">
        {label}
      </h3>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <li className="flex flex-col gap-1">
      <span className="text-web-h4-mobile lg:text-web-h4 text-web-content-2 capitalize">
        {label}
      </span>
      <span className="text-web-caption-mobile lg:text-web-caption text-web-content-2">
        {value}
      </span>
    </li>
  );
}
