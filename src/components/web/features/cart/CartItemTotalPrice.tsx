import { formatCurrencyWebsite } from "@/lib/utils";
import React, { FC } from "react";

const CartItemTotalPrice: FC<{ totalPrice: number }> = ({ totalPrice }) => {
  return (
    <div className="flex items-center justify-between gap-5">
      <p className="text-web-h2-mobile lg:text-web-h2 text-web-content-1">
        Total
      </p>
      <span className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1">
        {formatCurrencyWebsite(totalPrice)}
      </span>
    </div>
  );
};

export default CartItemTotalPrice;
