import { cn, formatCurrencyWebsite } from "@/lib/utils";
import { CartItemDisplay } from "@/types/cart";
import Image from "next/image";
import React, { FC } from "react";

const OrderItem: FC<{ item: Omit<CartItemDisplay, "id"> }> = ({ item }) => {
  const addons = item.addons.filter((addon) => addon.quantity > 0);
  return (
    <li className="pb-5 border-b border-web-content-3 flex flex-col gap-5">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-1.5">
          <div className="relative pt-3 pe-2">
            <span
              className={cn(
                "w-8 aspect-square rounded-full bg-web-secondary-1 text-web-content-1 flex justify-center items-center text-web-h4-mobile lg:text-web-h4",
                "absolute z-10 end-0 top-0",
              )}
            >
              {item.quantity}
            </span>
            <div className="relative w-20 aspect-square rounded-sm overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <p className="text-web-h3-mobile lg:text-web-h3 text-web-content-1 flex-1 line-clamp-1 pt-3">
            {item.title}
          </p>
        </div>
        <p className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1 shrink-0 pt-3">
          {formatCurrencyWebsite(item.price * item.quantity)}
        </p>
      </div>
      {addons.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {addons.map((addon) => (
            <li
              className="flex justify-between items-center gap-2.5"
              key={addon.id}
            >
              <span className="flex-1 text-web-body-mobile lg:text-web-body text-web-content-1">
                +{addon.quantity} {addon.name}
              </span>
              <span className="text-web-h4-mobile lg:text-web-h4 text-web-secondary-1 shrink-0">
                {formatCurrencyWebsite(addon.price * addon.quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {item.notes && (
        <div className="px-5 py-4 bg-web-background-1 rounded-lg">
          <p className="text-web-h4-mobile lg:text-web-h4 text-web-content-2">
            Note:
          </p>
          <p className="text-web-body-mobile lg:text-web-body italic text-web-content-2">
            {item.notes}
          </p>
        </div>
      )}
    </li>
  );
};

export default OrderItem;
