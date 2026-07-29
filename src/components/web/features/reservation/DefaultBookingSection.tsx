import React, { FC } from "react";
import SectionSubTitleFromConfigs from "../../shared/SectionSubTitleFromConfigs";
import SectionTitleFromConfigs from "../../shared/SectionTitleFromConfigs";
import ReservationForm from "./ReservationForm";
import ReservationInformation from "./ReservationInformation";

const DefaultBookingSection: FC<{
  configs: any;
}> = ({ configs }) => {
  return (
    <section>
      <div className="container">
        <div className="flex flex-col gap-5 items-center py-10 text-center">
          <p className="text-web-secondary-3 text-web-subtitle-mobile uppercase lg:text-web-subtitle text-center">
            <SectionSubTitleFromConfigs sub_title={configs.sub_title} />
          </p>
          <h2 className="text-web-h2-mobile capitalize lg:text-web-h2 flex flex-row gap-x-2 flex-wrap justify-center items-center">
            <SectionTitleFromConfigs title={configs.title} />
          </h2>
          <p className="text-web-subtitle-mobile lg:text-web-subtitle text-web-content-2">
            {configs.description}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-10 pb-10">
          <div className="col-span-1 xl:col-span-3">
            <ReservationForm configs={configs} />
          </div>
          <div className="col-span-1 xl:col-span-2">
            <ReservationInformation configs={configs} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DefaultBookingSection;
