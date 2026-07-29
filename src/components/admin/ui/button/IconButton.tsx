import Icon from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import React, { ComponentProps, FC } from "react";
import { Button } from "./Button";

export const IconButton: FC<
  Omit<ComponentProps<typeof Button>, "children"> & { icon: string }
> = ({ icon, className, ...rest }) => {
  return (
    <Button className={cn("btn-square p-1", className)} {...rest}>
      <Icon icon={icon} />
    </Button>
  );
};
