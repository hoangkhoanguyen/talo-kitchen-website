"use client";
import { formatCurrency } from "@/lib/utils";
import { AdminOrderItem } from "@/types/orders";
import Image from "next/image";
import React, { FC } from "react";

const OrderItems: FC<{ items: AdminOrderItem[] }> = ({ items }) => {
  return (
    <div className="card p-5 bg-white">
      <h2 className="card-title">Order Items</h2>
      <div className="mt-4 flex flex-col gap-4">
        {items.map((item) => (
          <OrderItem key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
};

export default OrderItems;

function OrderItem({ data }: { data: AdminOrderItem }) {
  return (
    <div className="border border-gray-200 rounded p-4 flex items-start gap-4 w-full">
      <div className="w-16 aspect-square relative bg-gray-200 rounded overflow-hidden">
        {data.image && <Image fill src={data.image} alt={data.productName} />}
      </div>
      <div className="flex-1 flex flex-col gap-2 items-stretch font-semibold">
        <div className="flex justify-between gap-3 items-start font-bold text-gray-700">
          <p>{data.productName}</p>

          <p className="text-end">{formatCurrency(data.totalPrice)}</p>
        </div>
        <div className="flex justify-between gap-3 items-start text-xs font-semibold text-gray-500">
          <p>x {data.quantity}</p>
          <p className="text-end">
            {formatCurrency(data.price * data.quantity)}
          </p>
        </div>

        {data.addons.length > 0 && (
          <details>
            <summary className="cursor-pointer">
              <span className="font-semibold text-xs">
                Add-ons ({data.addons.length})
              </span>
            </summary>
            <div className="flex flex-col items-stretch gap-2 ps-4 border-s border-gray-200 mt-2">
              {data.addons.map((addon) => (
                <div className="flex justify-between" key={addon.id}>
                  <span className="text-xs  text-gray-500">
                    {addon.name} x{addon.quantity}
                  </span>
                  <span className="text-xs text-gray-700">
                    {formatCurrency(addon.totalPrice)}
                  </span>
                </div>
              ))}
              <hr className="border-gray-200" />
              <div className="flex justify-between">
                <span className="text-xs  text-gray-700">Add-ons Total:</span>
                <span className="text-xs text-gray-700">
                  {formatCurrency(
                    data.addons.reduce(
                      (acc, addon) => acc + addon.totalPrice,
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          </details>
        )}

        {data.note && (
          <details open>
            <summary className="cursor-pointer">
              <span className="font-semibold text-xs">Note</span>
            </summary>
            <p className="text-xs text-gray-700 border-s border-gray-200 ps-4">
              {data.note}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
