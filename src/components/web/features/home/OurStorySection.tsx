import { splitTextByNewLine } from "@/lib/utils";
import Image from "next/image";
import React, { FC } from "react";
import SectionTitleFromConfigs from "../../shared/SectionTitleFromConfigs";
import SectionSubTitleFromConfigs from "../../shared/SectionSubTitleFromConfigs";

export const OurStorySection: FC<{ configs: any }> = ({ configs }) => {
  return (
    <section className="bg-web-background-3">
      <div className="container pt-6 md:pt-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 gap-x-8">
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[5/6] rounded-2xl overflow-hidden lg:mt-11">
              <Image
                src={configs.image.url}
                alt={configs.image.alt}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="order-2 lg:order-1">
            <div>
              <h3 className="inline-block bg-web-background-3 rounded-full px-4 py-1 text-web-secondary-3 text-web-subtitle-mobile uppercase mb-5 lg:text-web-subtitle">
                <SectionSubTitleFromConfigs sub_title={configs.sub_title} />
              </h3>
              <h2 className="text-web-h2-mobile capitalize mb-2 md:mb-9 lg:mb-5 lg:text-web-h2 flex flex-row gap-x-2 flex-wrap">
                <SectionTitleFromConfigs title={configs.title} />
              </h2>
              <div className="text-web-content-2 text-web-subtitle-mobile lg:text-web-subtitle flex flex-col gap-5">
                {splitTextByNewLine(configs.content).map(
                  (text: string, index: number) => (
                    <p key={index}>{text}</p>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
