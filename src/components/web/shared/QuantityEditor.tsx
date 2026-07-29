import React, { FC } from "react";
import { QuantityButtons } from "../ui/button";
import { formatCurrencyWebsite } from "@/lib/utils";

const QuantityEditor: FC<{
  price: number;
  quantity: number;
  onChangeQuantity(quantity: number): void;
}> = ({ price, quantity, onChangeQuantity }) => {
  return (
    <div>
      <p className="text-web-h3-mobile lg:text-web-h3 mb-5 text-web-content-1">
        Amount
      </p>
      <div className="flex justify-between items-center gap-5">
        <QuantityButtons
          onChangeQuantity={onChangeQuantity}
          quantity={quantity}
        />
        <p className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
          {formatCurrencyWebsite(price)}
        </p>
      </div>
    </div>
  );
};

export default QuantityEditor;
