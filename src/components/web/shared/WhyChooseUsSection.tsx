import Icon from "@/components/common/Icon";
import React, { FC } from "react";
import SectionTitleFromConfigs from "./SectionTitleFromConfigs";
import SectionSubTitleFromConfigs from "./SectionSubTitleFromConfigs";

export const WhyChooseUsSection: FC<{ configs?: any }> = ({
  configs = { reasons: [], title: [], sub_title: [] },
}) => {
  return (
    <div className="container pt-10 pb-10 md:pt-12">
      <h3 className="section-subtitle mb-5 text-center">
        <SectionSubTitleFromConfigs sub_title={configs.sub_title} />
      </h3>
      <h2 className="text-center flex flex-wrap justify-center gap-x-2 items-center mb-5 section-title">
        <SectionTitleFromConfigs title={configs.title} />
      </h2>

      <div className="mb-10 lg:max-w-2xl mx-auto">
        <p className="text-center text-web-content-2 text-web-subtitle-mobile lg:text-web-subtitle">
          {configs.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-5">
        {configs.reasons.map((reason: any, index: number) => (
          <ReasonItem
            key={index}
            icon={reason.icon}
            title={reason.title}
            desc={reason.desc}
          />
        ))}
      </div>
    </div>
  );
};

function ReasonItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 aspect-square rounded-full bg-web-primary text-web-secondary-2 flex justify-center items-center mb-2">
        <Icon icon={icon} className="text-[40px]" />
      </div>
      <h4 className="text-web-h3-mobile lg:text-web-h3 text-web-primary capitalize mb-5">
        {title}
      </h4>
      <p className="text-web-body-mobile lg:text-web-body text-web-content-2">
        {desc}
      </p>
    </div>
  );
}
