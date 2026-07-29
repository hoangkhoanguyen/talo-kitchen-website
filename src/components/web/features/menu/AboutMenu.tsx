import React, { FC } from "react";
import SectionSubTitleFromConfigs from "../../shared/SectionSubTitleFromConfigs";
import SectionTitleFromConfigs from "../../shared/SectionTitleFromConfigs";
import { splitTextByNewLine } from "@/lib/utils";

const AboutMenu: FC<{ configs: any }> = ({ configs }) => {
  return (
    <section>
      <div className="container py-10 lg:pt-16 max-w-4xl">
        <h3 className="section-subtitle text-center mb-5">
          <SectionSubTitleFromConfigs sub_title={configs.sub_title} />
        </h3>
        <h2 className="section-title text-center mb-10 flex flex-wrap items-center gap-2 justify-center">
          <SectionTitleFromConfigs title={configs.title} />
        </h2>
        <div className="flex flex-col items-center gap-5">
          {splitTextByNewLine(configs.description).map((text, index) => (
            <p
              key={index}
              className="text-center text-web-body-mobile lg:text-web-body text-web-content-2"
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutMenu;
