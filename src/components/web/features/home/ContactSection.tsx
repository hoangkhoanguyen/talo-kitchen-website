import Icon from "@/components/common/Icon";
import { cn, splitTextByNewLine } from "@/lib/utils";
import React, { FC, PropsWithChildren } from "react";
import { Button } from "../../ui/button";
import SectionTitleFromConfigs from "../../shared/SectionTitleFromConfigs";
import { getTranslations } from "next-intl/server";

const openingHoursConfigs = [
  {
    title: "Restaurant Hours",
    items: [
      { label: "Tuesday - Sunday", value: "11:00 AM - 10:00 PM" },
      { label: "Last Order", value: "09:30 PM" },
      { label: "Kitchen Closes", value: "9:45 PM" },
      { label: "Monday", value: "Closed" },
    ],
  },
  {
    title: "Delivery Hours",
    items: [
      { label: "Lunch Delivery", value: "11:30 AM - 2:30 PM" },
      { label: "Dinner Delivery", value: "6:00 PM - 9:30 PM" },
      { label: "Pickup Available", value: "All Day" },
    ],
  },
];

export const ContactSection: FC<{ configs: any }> = async ({ configs }) => {
  const t = await getTranslations("home");
  return (
    <section className="bg-web-background-2 pt-10 pb-10 md:pb-12 lg:pb-14">
      <div className="container">
        <h3 className="text-web-secondary-1 text-center text-web-subtitle-mobile uppercase mb-5 lg:text-web-subtitle">
          {t("visitUs")}
        </h3>

        <h2 className="text-web-h2-mobile text-center capitalize lg:text-web-h2 mb-5 flex flex-row flex-wrap justify-center items-center gap-x-2">
          <SectionTitleFromConfigs title={configs.title} />
        </h2>
        <p className="text-web-subtitle-mobile lg:text-web-subtitle mb-10 text-center block mx-auto max-w-3xl text-web-content-2">
          {configs.description}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          <div className="col-span-1">
            <Card>
              <div className="flex flex-col gap-5 h-full">
                <div className="flex flex-col gap-10 flex-1">
                  <CardTitle icon="ph:map-pin" title={t("location")} />

                  <div className="w-full">
                    {splitTextByNewLine(configs.location.address).map(
                      (item, index) => (
                        <p
                          className="text-web-caption-mobile lg:text-web-caption text-web-content-2"
                          key={index}
                        >
                          {item}
                        </p>
                      ),
                    )}
                  </div>
                </div>

                <Button
                  as="a"
                  href={configs.location.ggmap_link}
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary2"
                  startIcon={
                    <Icon
                      icon="ph:navigation-arrow"
                      className="rotate-90 text-lg"
                    />
                  }
                  className="text-web-label-mobile lg:text-web-label border border-web-content-3"
                >
                  {t("getDirections")}
                </Button>
              </div>
            </Card>
          </div>
          <div className="col-span-1">
            <Card>
              <div className="flex flex-col gap-5 h-full">
                <div className="flex flex-col gap-10 flex-1">
                  <CardTitle icon="ph:phone" title={t("contact")} />

                  <div className="w-full flex flex-col gap-5">
                    <div>
                      <p className="text-web-content-2 text-web-h4-mobile lg:text-web-h4">
                        {t("phone")}
                      </p>
                      <p className="text-web-content-2 text-web-caption-mobile lg:text-web-caption">
                        {configs.contact_info.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-web-content-2 text-web-h4-mobile lg:text-web-h4">
                        {t("email")}
                      </p>
                      <p className="text-web-content-2 text-web-caption-mobile lg:text-web-caption">
                        {configs.contact_info.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  as="a"
                  href={`https://wa.me/${configs.contact_info.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary2"
                  startIcon={<Icon icon="ph:chat-circle" className="text-lg" />}
                  className="text-web-label-mobile lg:text-web-label border border-web-content-3"
                >
                  WhatsApp
                </Button>
              </div>
            </Card>
          </div>
          <div className="col-span-1 lg:col-span-2">
            <Card>
              <div className="mb-10">
                <CardTitle icon="ph:clock" title={t("openingHours")} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                {configs.opening_hours.map((config: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col items-stretch gap-5"
                  >
                    <p className="text-web-content-2 text-web-h4-mobile lg:text-web-h4">
                      {config.title}
                    </p>
                    <ul className="text-web-content-2 text-web-caption-mobile lg:text-web-caption flex flex-col gap-2">
                      {config.items.map((item: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex justify-between items-center"
                        >
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </li>
                      ))}
                      {config.note && (
                        <li className="text-[14px] leading-[160%] font-normal italic text-web-secondary-1">
                          {config.note}
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "py-5 px-5 md:px-10 border border-web-content-3 rounded-lg bg-web-background-3 h-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 lg:gap-1">
      <Icon icon={icon} className="text-2xl text-web-secondary-1" />
      <p className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-2">
        {title}
      </p>
    </div>
  );
}
