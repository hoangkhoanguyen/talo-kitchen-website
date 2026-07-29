import Icon from "@/components/common/Icon";
import React, { FC } from "react";
import { Button } from "../../ui/button";
import Link from "next/link";

const ReservationInformation: FC<{ configs: any }> = ({ configs }) => {
  return (
    <div className="grid grid-cols-1 gap-10">
      <div className="reservation-card-shadow p-5 bg-white rounded-xl">
        <div className="flex flex-row items-center gap-2 mb-10">
          <div className="rounded-full bg-web-secondary-1 text-web-content-1 p-2.5">
            <Icon icon={"ph:clock"} className="text-2xl" />
          </div>
          <h3 className="text-web-h3-mobile lg:text-web-h3 text-web-content-1">
            Reservation Information
          </h3>
        </div>
        <ul className="flex flex-col gap-5">
          {configs.reservation_info.map((info: any, index: number) => (
            <li key={index}>
              <div className="flex flex-row items-start gap-2">
                <div className="rounded-full shrink-0 w-9 aspect-square bg-web-secondary-2 text-web-content-1 flex justify-center items-center">
                  <Icon icon={info.icon} className="text-lg" />
                </div>
                <div className="flex flex-col gap-2.5 pt-1">
                  <h4 className="text-web-h4-mobile lg:text-web-h4 text-web-content-1">
                    {info.title}
                  </h4>
                  <ul className="flex flex-col items-stretch gap-0.5">
                    {info.items.map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.type === "label" ? (
                          <p className="text-web-body-mobile lg:text-web-body text-web-content-1 mt-2">
                            {item.text}
                          </p>
                        ) : item.type === "bullet" ? (
                          <p className="text-web-body-mobile lg:text-web-body text-web-secondary-1 pl-3">
                            • {item.text}
                          </p>
                        ) : item.type === "note" ? (
                          <p className="text-web-caption-mobile lg:text-web-caption text-web-content-2 italic mt-1">
                            {item.text}
                          </p>
                        ) : (
                          <p className="text-web-body-mobile lg:text-web-body text-web-content-2">
                            {item.text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 bg-web-primary rounded-xl">
        <p className="text-web-caption-mobile lg:text-web-caption text-web-background-1 mb-2.5">
          Need Assistance?
        </p>
        <p className="text-web-body-mobile lg:text-web-body text-web-background-3 mb-12">
          Get in touch with our reservations team
        </p>
        <div className="flex flex-row items-center gap-2 mb-10">
          <div className="w-[52px] aspect-square rounded-full flex justify-center items-center bg-web-secondary-1 text-web-content-1">
            <Icon icon={"ph:phone"} className="text-2xl" />
          </div>
          <div className="flex flex-col">
            <p className="text-web-background-1 text-web-h4-mobile lg:text-web-h4">
              {configs.contact.phone}
            </p>
            <p className="text-web-background-3 text-web-body-mobile lg:text-web-body">
              Call us directly
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2 mb-10">
          <div className="w-[52px] aspect-square rounded-full flex justify-center items-center bg-web-secondary-1 text-web-content-1">
            <Icon icon={"ph:envelope"} className="text-2xl" />
          </div>
          <div className="flex flex-col">
            <p className="text-web-background-1 text-web-h4-mobile lg:text-web-h4">
              {configs.contact.email}
            </p>
            <p className="text-web-background-3 text-web-body-mobile lg:text-web-body">
              Email for special requests
            </p>
          </div>
        </div>
        <Button
          as={Link}
          href={`tel:${configs.contact.phone}`}
          className="capitalize w-full text-web-background-1 text-web-button-mobile lg:text-web-button py-3 rounded-lg"
          variant="secondary1"
          startIcon={<Icon icon="ph:phone" className="text-2xl" />}
        >
          call now
        </Button>
      </div>
    </div>
  );
};

export default ReservationInformation;
