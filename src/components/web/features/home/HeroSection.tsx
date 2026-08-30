import Icon from "@/components/common/Icon";
import React, { FC } from "react";
import { Button } from "../../ui/button";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { webRoutes } from "@/constants/route";
import { getTranslations } from "next-intl/server";

export const HeroSection: FC<{ configs: any }> = async ({ configs }) => {
  const t = await getTranslations("home");
  return (
    <section className="relative ">
      <div className="absolute w-full h-full top-0 left-0 z-0">
        <Image
          src={configs.image.url}
          fill
          className="object-cover"
          alt={configs.image.alt}
        />
      </div>
      <div className="relative container h-[calc(100vh-149px)] lg:h-[calc(100vh-146px)]">
        <div className="h-full flex flex-col items-center justify-center md:px-10 lg:max-w-2xl mx-auto pt-2.5 pb-6 md:pt-10 lg:pt-6 gap-2.5 md:gap-10">
          {configs.isShowTitle && (
            <h1 className="flex flex-col items-center text-web-h1-mobile lg:text-web-h1 text-web-background-1 text-center text-shadow-black/10 text-shadow-md">
              {configs.title.map((item: any, index: number) => (
                <span
                  key={index}
                  className={index % 2 === 0 ? "" : "text-web-secondary-2"}
                >
                  {item.text}
                </span>
              ))}
            </h1>
          )}

          <div className="flex flex-col md:flex-row gap-5 md:gap-11 items-stretch w-full md:px-2 mb-5 md:mb-20">
            <Button
              as={Link}
              href={webRoutes.menu("all")}
              startIcon={<Icon icon="ph:shopping-bag" className="text-2xl" />}
              className="border border-web-background-1 flex-1 capitalize text-web-button-mobile lg:text-web-button"
            >
              {t("delivery")}
            </Button>
            <Button
              as={Link}
              href={webRoutes.reservation()}
              className="flex-1 text-web-content-1 capitalize text-web-button-mobile lg:text-web-button"
              startIcon={<Icon icon="ph:calendar-blank" className="text-2xl" />}
              variant={"secondary2"}
            >
              {t("reserveYourTable")}
            </Button>
          </div>
        </div>
        <div className="invisible lg:visible absolute bottom-7 left-1/2 -translate-x-1/2">
          <Icon icon="ph:mouse-simple" className="text-5xl animate-bounce" />
        </div>
      </div>
    </section>
  );
};
