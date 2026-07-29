import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ComponentProps, ElementType, ReactNode } from "react";

const buttonVariants = cva("", {
  variants: {
    variant: {
      primary: "text-web-background-1 bg-web-primary",
      secondary1:
        "text-web-content-1 bg-web-secondary-1 disabled:bg-web-secondary-1/40",
      secondary2: "text-web-content-1 bg-web-secondary-2",
      white:
        "text-web-content-1 bg-web-background-1 border border-web-background-2 disabled:text-web-content-3 disabled:border-web-content-3",
      link: "h-max p-0 text-web-background-1 hover:text-web-secondary-1",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

type ButtonProps<T extends ElementType> = {
  as?: T;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
} & VariantProps<typeof buttonVariants>;

type PropsToPass<T extends ElementType = "button"> = ButtonProps<T> &
  Omit<ComponentProps<T>, keyof ButtonProps<T>>;

export const Button = <T extends ElementType = "button">({
  className,
  variant,
  children,
  startIcon,
  endIcon,
  as,
  ...props
}: PropsToPass<T>) => {
  const Component = as || "button";
  return (
    <Component
      className={cn(
        "px-3 py-2.5 rounded",
        "flex flex-row justify-center items-center gap-1.5",
        "duration-200 not-disabled:active:scale-90",
        buttonVariants({ variant }),
        className,
      )}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </Component>
  );
};
