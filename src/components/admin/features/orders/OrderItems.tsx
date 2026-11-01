"use client";
import { cn, formatCurrency } from "@/lib/utils";
import useToggleOrderItemEnabled from "@/hooks/admin/features/orders/useToggleOrderItemEnabled";
import { AdminOrderItem } from "@/types/orders";
import Image from "next/image";
import React, { FC, useRef } from "react";
import { Button, IconButton } from "../../ui/button";
import { LayoutRef } from "../../ui/layout";
import ProductSelectorModal from "../products/ProductSelectorModal";
import useAddOrderItem from "@/hooks/admin/features/orders/useAddOrderItem";
import useUpdateOrderItemQuantity from "@/hooks/admin/features/orders/useUpdateOrderItemQuantity";
import useRemoveOrderItem from "@/hooks/admin/features/orders/useRemoveOrderItem";
import { useSetLoading } from "@/hooks/admin/loading";
import { MAX_ITEM_QUANTITY } from "@/lib/order-edit";

const OrderItems: FC<{
  orderId: number;
  items: AdminOrderItem[];
  canToggle?: boolean;
  // Đơn pending/processing mới sửa được
  canEdit?: boolean;
}> = ({ orderId, items, canToggle = false, canEdit = false }) => {
  const pickerRef = useRef<LayoutRef>(null);
  const { mutate: addItem, isPending: isAdding } = useAddOrderItem();

  useSetLoading(isAdding);

  return (
    <div className="card p-5 bg-white">
      <div className="flex justify-between items-center">
        <h2 className="card-title">Order Items</h2>
        {canEdit && (
          <Button color="primary" onClick={() => pickerRef.current?.open()}>
            + Thêm sản phẩm
          </Button>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {items.map((item) => (
          <OrderItem
            key={item.id}
            orderId={orderId}
            data={item}
            canToggle={canToggle}
            canEdit={canEdit}
            canRemove={items.length > 1}
          />
        ))}
      </div>
      {canEdit && (
        <ProductSelectorModal
          ref={pickerRef}
          isPending={isAdding}
          onSubmit={(payload) =>
            addItem(
              { orderId, ...payload },
              {
                onSuccess: (res) => {
                  if (res.success) pickerRef.current?.close();
                },
              },
            )
          }
        />
      )}
    </div>
  );
};

export default OrderItems;

function OrderItem({
  orderId,
  data,
  canToggle,
  canEdit,
  canRemove,
}: {
  orderId: number;
  data: AdminOrderItem;
  canToggle: boolean;
  canEdit: boolean;
  canRemove: boolean;
}) {
  const { mutate, isPending } = useToggleOrderItemEnabled();
  const { mutate: updateQty, isPending: isUpdatingQty } =
    useUpdateOrderItemQuantity();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveOrderItem();
  const editBusy = isUpdatingQty || isRemoving;

  useSetLoading(isUpdatingQty, isRemoving);
  // Item đã tắt: làm mờ nội dung, riêng công tắc giữ rõ nét để dễ bật lại
  const dimmed = data.isEnabled === false && "opacity-50";

  return (
    <div className="border border-gray-200 rounded p-4 flex items-start gap-4 w-full">
      <div
        className={cn(
          "w-16 aspect-square relative bg-gray-200 rounded overflow-hidden",
          dimmed,
        )}
      >
        {data.image && <Image fill src={data.image} alt={data.productName} />}
      </div>
      <div
        className={cn(
          "flex-1 flex flex-col gap-2 items-stretch font-semibold",
          dimmed,
        )}
      >
        <div className="flex justify-between gap-3 items-start font-bold text-gray-700">
          <p className="flex-1">{data.productName}</p>
          <p className="text-end">{formatCurrency(data.totalPrice)}</p>
        </div>
        <div className="flex justify-between gap-3 items-start text-xs font-semibold text-gray-500">
          {canEdit ? (
            <div className="flex items-center gap-2 text-gray-700">
              <IconButton
                icon="mdi:minus"
                size="xs"
                aria-label="Giảm số lượng"
                disabled={editBusy || data.quantity <= 1}
                onClick={() =>
                  updateQty({
                    orderId,
                    itemId: data.id,
                    quantity: data.quantity - 1,
                  })
                }
              />
              <span>x {data.quantity}</span>
              <IconButton
                icon="mdi:plus"
                size="xs"
                aria-label="Tăng số lượng"
                disabled={editBusy || data.quantity >= MAX_ITEM_QUANTITY}
                onClick={() =>
                  updateQty({
                    orderId,
                    itemId: data.id,
                    quantity: data.quantity + 1,
                  })
                }
              />
            </div>
          ) : (
            <p>x {data.quantity}</p>
          )}
          <p className="text-end">{formatCurrency(data.price)}</p>
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
      {canEdit && (
        <IconButton
          icon="mdi:trash-outline"
          color="error"
          variant="soft"
          size="xs"
          aria-label="Xoá sản phẩm"
          title={canRemove ? "Xoá sản phẩm" : "Đơn phải còn ít nhất 1 sản phẩm"}
          disabled={editBusy || !canRemove}
          onClick={() => {
            if (window.confirm(`Xoá "${data.productName}" khỏi đơn hàng?`)) {
              removeItem({ orderId, itemId: data.id });
            }
          }}
        />
      )}
      {canToggle && (
        <input
          type="checkbox"
          className="toggle toggle-primary toggle-sm shrink-0 self-start"
          aria-label="Bật/tắt sản phẩm"
          checked={data.isEnabled !== false}
          disabled={isPending}
          onChange={(e) =>
            mutate({ itemId: data.id, isEnabled: e.target.checked })
          }
        />
      )}
    </div>
  );
}
