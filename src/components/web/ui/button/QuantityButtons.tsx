import Icon from "@/components/common/Icon";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import React, { FC } from "react";

const variants = cva("", {
  variants: {
    size: {
      sm: "h-10",
      md: "h-[52px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const AdjustButton: FC<{
  icon: string;
  onClick?(): void;
  disabled?: boolean;
}> = ({ icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="text-web-content-2 flex-1 h-full aspect-square flex justify-center items-center"
  >
    <Icon icon={icon} />
  </button>
);

export const QuantityButtons: FC<
  VariantProps<typeof variants> & {
    quantity: number;
    onChangeQuantity(value: number): void;
  }
> = ({ size, quantity, onChangeQuantity }) => {
  return (
    <div
      className={cn(
        "flex items-center bg-web-background-1 border border-web-content-3 rounded-lg overflow-hidden",
        variants({ size }),
      )}
    >
      <AdjustButton
        icon="ph:minus"
        disabled={quantity <= 0}
        onClick={() => onChangeQuantity(quantity - 1)}
      />
      <span className="text-web-content-1 flex-1 h-full aspect-square flex justify-center items-center box-content border-x border-web-content-3">
        {quantity}
      </span>
      <AdjustButton
        icon="ph:plus"
        onClick={() => onChangeQuantity(quantity + 1)}
      />
    </div>
  );
};
