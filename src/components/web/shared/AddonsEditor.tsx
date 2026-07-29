"use client";
import { FC } from "react";
import { QuantityButtons } from "../ui/button";
import { formatCurrencyWebsite } from "@/lib/utils";

const AddonsEditor: FC<{
  addons: {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }[];
  onChangeQuantity(id: number, quantity: number): void;
}> = ({ addons, onChangeQuantity }) => {
  return (
    <div className="">
      <p className="text-web-h3-mobile lg:text-web-h3 text-web-content-1 mb-5">
        Add Extras
      </p>
      <div className="flex flex-col gap-6 items-stretch">
        {addons.map((addon) => (
          <AddOnsItem
            key={addon.id}
            name={addon.name}
            price={addon.price}
            quantity={addon.quantity}
            onChangeQuantity={(quantity) =>
              onChangeQuantity(addon.id, quantity)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default AddonsEditor;

function AddOnsItem({
  name,
  price,
  quantity,
  onChangeQuantity,
}: {
  name: string;
  price: number;
  quantity: number;
  onChangeQuantity: (value: number) => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <QuantityButtons
        size={"sm"}
        quantity={quantity}
        onChangeQuantity={onChangeQuantity}
      />
      <div className="flex flex-col gap-1 justify-end">
        <p className="text-web-caption-mobile lg:text-web-caption text-web-content-1 text-end">
          {name}
        </p>
        <p className="text-web-button-mobile lg:text-web-button text-web-secondary-1 text-end">
          + {formatCurrencyWebsite(price)}
        </p>
      </div>
    </div>
  );
}
