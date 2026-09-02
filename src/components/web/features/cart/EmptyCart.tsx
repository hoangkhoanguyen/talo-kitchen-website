"use client";
import Image from "next/image";
import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "../../ui/button";
import { Link } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";

const EmptyCart = () => {
  const t = useTranslations("cart");
  return (
    <div className="container flex flex-col items-center justify-center py-20 text-center">
      <div className="relative w-full max-w-[483px] aspect-square mb-10">
        <Image
          src="/assets/static/empty-cart.jpg"
          alt={t("empty.imageAlt")}
          fill
          className="w-full"
        />
      </div>
      <h2 className="text-web-h1-mobile lg:text-web-h1 text-web-primary mb-5">
        {t("empty.title")}
      </h2>
      <p className="text-web-h4-mobile lg:text-web-h4 text-web-content-3">
        {t("empty.message")}
      </p>
      <p className="text-web-h4-mobile lg:text-web-h4 text-web-content-3 mb-10">
        {t("empty.cta")}
      </p>
      <Button
        as={Link}
        href={webRoutes.menu("all")}
        variant={"primary"}
        className="rounded-lg text-web-button-mobile lg:text-web-button py-4 px-28"
      >
        {t("empty.continueShopping")}
      </Button>
    </div>
  );
};

export default EmptyCart;
