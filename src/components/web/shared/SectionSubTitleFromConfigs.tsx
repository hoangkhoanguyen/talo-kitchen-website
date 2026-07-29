import React, { FC } from "react";

const SectionSubTitleFromConfigs: FC<{ sub_title: any }> = ({ sub_title }) => {
  return (
    <>
      {sub_title.map((item: any, index: number) => (
        <span key={index}>
          {index !== 0 && <span className="ms-1">&bull;</span>} {item.text}
        </span>
      ))}
    </>
  );
};

export default SectionSubTitleFromConfigs;
