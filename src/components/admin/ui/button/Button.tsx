import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { ButtonHTMLAttributes, FC } from "react";

const buttonVariants = cva("btn rounded-xl", {
  variants: {
    variant: {
      default: "",
      soft: "btn-soft",
      outline: "btn-outline",
      dash: "btn-dash",
    },
    color: {
      default: "",
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      info: "btn-info",
      success: "btn-success",
      warning: "btn-warning",
      error: "btn-error",
    },
    size: {
      xs: "btn-xs",
      sm: "btn-sm",
      md: "btn-md",
      lg: "btn-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
    size: "sm",
  },
});

export const Button: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
> = ({ variant, color, size, className = "", ...props }) => {
  return (
    <button
      className={cn(
        buttonVariants({
          color,
          variant,
          size,
        }),
        className,
      )}
      {...props}
    />
  );
};
