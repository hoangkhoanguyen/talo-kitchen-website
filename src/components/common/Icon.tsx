import { Icon as Iconify } from "@iconify/react";
import { ComponentProps, FC } from "react";

const Icon: FC<ComponentProps<typeof Iconify>> = (props) => {
    return <Iconify {...props} />;
};

export default Icon;
