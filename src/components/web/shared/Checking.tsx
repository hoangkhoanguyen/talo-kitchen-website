import Icon from "@/components/common/Icon";
import React from "react";

const Checking = () => {
  return (
    <div className="flex justify-center items-center h-full py-56">
      <Icon
        icon="line-md:loading-twotone-loop"
        className="text-web-secondary-1 text-6xl"
      />
    </div>
  );
};

export default Checking;
