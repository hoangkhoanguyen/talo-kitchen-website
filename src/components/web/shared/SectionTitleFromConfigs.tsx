import React, { FC } from "react";

const SectionTitleFromConfigs: FC<{ title?: any }> = ({ title = [] }) => {
  return (
    <>
      {title.map((item: any, index: number) => (
        <span
          key={index}
          className={
            index % 2 === 0 ? "text-web-content-1" : "text-web-secondary-1"
          }
        >
          {item.text}
        </span>
      ))}
    </>
  );
};

export default SectionTitleFromConfigs;
