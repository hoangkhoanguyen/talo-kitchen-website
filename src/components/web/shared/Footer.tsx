import Icon from "@/components/common/Icon";
import { webRoutes } from "@/constants/route";
import { splitTextByNewLine } from "@/lib/utils";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import React, { FC } from "react";

const Footer: FC<{ configs: any }> = ({ configs }) => {
  return (
    <footer className="bg-[#FFF3DA]">
      <div className="container py-10 pb-20 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10 lg:gap-5">
          <div className="col-span-1 lg:col-span-3 xl:col-span-2">
            <div className="flex flex-col gap-2.5">
              <Link href={webRoutes.home()}>
                <Image
                  src={"/logo-talo.svg"}
                  alt="TALO Kitchen & Lounge"
                  width={129}
                  height={61}
                />
              </Link>

              <p className="text-web-caption-mobile lg:text-web-caption text-[#1A1A1A]">
                {configs.description}
              </p>

              <div className="flex gap-5">
                {configs.socials.map((social: any, index: number) => (
                  <Link key={index} href={social.href}>
                    <MediaIcon icon={social.icon} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3 xl:col-span-1">
            <p className="mb-5 text-[#1A1A1A] text-web-h4-mobile lg:text-web-h4 capitalize">
              Quick Links
            </p>
            <ul className="flex flex-col gap-2">
              {configs.quick_links.map((item: any, index: number) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-[#1A1A1A] text-web-label-mobile lg:text-web-label duration-200 hover:text-web-secondary-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-3 xl:col-span-1">
            <p className="mb-5 text-[#1A1A1A] text-web-h4-mobile lg:text-web-h4 capitalize">
              Our Services
            </p>
            <ul className="flex flex-col gap-2">
              {configs.services.map((item: any, index: number) => (
                <li key={index}>
                  <span className="text-[#1A1A1A] text-web-label-mobile lg:text-web-label">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 lg:col-span-3 xl:col-span-2">
            <div className="flex flex-col gap-5">
              <p className="text-[#1A1A1A] text-web-h4-mobile lg:text-web-h4 capitalize">
                Contact Information
              </p>

              <div className="flex flex-col gap-2">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <Icon
                    icon="ph:map-pin"
                    className="text-web-secondary-1 text-xl mt-1 flex-shrink-0"
                  />
                  <div>
                    {splitTextByNewLine(configs.contact.address).map(
                      (line, idx) => (
                        <p
                          key={idx}
                          className="text-[#1A1A1A] text-web-caption-mobile lg:text-web-caption"
                        >
                          {line}
                        </p>
                      ),
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4">
                  <Icon
                    icon="ph:phone"
                    className="text-web-secondary-1 text-xl flex-shrink-0"
                  />
                  <a
                    href={`tel:${configs.contact.phone}`}
                    className="text-[#1A1A1A] text-web-caption-mobile lg:text-web-caption hover:text-web-secondary-1 transition-colors"
                  >
                    {configs.contact.phone}
                  </a>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <Icon
                    icon="ph:envelope-simple"
                    className="text-web-secondary-1 text-xl flex-shrink-0"
                  />
                  <Link
                    href={`mailto:${configs.contact.email}`}
                    className="text-[#1A1A1A] text-web-caption-mobile lg:text-web-caption hover:text-web-secondary-1 transition-colors"
                  >
                    {configs.contact.email}
                  </Link>
                </div>
              </div>

              <div className="bg-[#FEEB79] rounded flex flex-col gap-2 py-2 px-5">
                <p className="text-[#1A1A1A] text-web-subtitle-mobile lg:text-web-subtitle capitalize font-semibold">
                  {configs.opening_hours_title || "Opening Hours"}
                </p>
                <div className="flex flex-col gap-1 text-web-caption-mobile lg:text-web-caption">
                  {configs.opening_hours.map((line: any, idx: any) => (
                    <p key={idx} className="text-[#1A1A1A]">
                      {line.label}:{" "}
                      <span className="text-[#1A1A1A]">{line.value}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-8">
            <div className="h-[1px] bg-[#1A1A1A]/20"></div>
          </div>

          <div className="col-span-1 lg:col-span-8">
            <p className="text-[#1A1A1A] text-web-h4-mobile lg:text-web-h4 text-start md:text-center lg:text-start">
              &copy; 2025 TALO Kitchen &amp; Lounge
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

function MediaIcon({ icon }: { icon: string }) {
  return (
    <div className="p-2.5 rounded-full aspect-square flex items-center justify-center border-2 border-web-primary">
      <Icon icon={icon} className="text-web-primary text-xl" />
    </div>
  );
}
