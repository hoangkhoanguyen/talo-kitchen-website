"use client";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { LayoutRef, LayoutWithRef, Modal } from "../../ui/layout";
import { Button } from "../../ui/button";
import { Input, Label, Select, Textarea } from "../../ui/form";
import useFetchOrderProductOptions from "@/hooks/admin/features/orders/useFetchOrderProductOptions";
import {
  MAX_ADDON_QUANTITY,
  MAX_ITEM_NOTE_LENGTH,
  MAX_ITEM_QUANTITY,
  computeItemTotal,
} from "@/lib/order-edit";
import { formatCurrency } from "@/lib/utils";

export interface SelectedProductPayload {
  productId: number;
  quantity: number;
  note: string;
  addons: { addonId: number; quantity: number }[];
}

/**
 * Bộ chọn sản phẩm (kèm add-on, số lượng, ghi chú) để thêm món vào đơn.
 * Giá chỉ để hiển thị tham khảo; server luôn tính lại giá từ DB.
 */
const ProductSelectorModal = forwardRef<
  LayoutRef,
  {
    title?: string;
    isPending?: boolean;
    onSubmit(payload: SelectedProductPayload): void;
  }
>(({ title = "Thêm sản phẩm", isPending = false, onSubmit }, ref) => {
  const innerRef = useRef<LayoutRef>(null);
  useImperativeHandle(ref, () => ({
    open: () => innerRef.current?.open(),
    close: () => innerRef.current?.close(),
  }));

  return (
    <LayoutWithRef ref={innerRef} Component={Modal}>
      {/* Form nằm trong Modal nên được mount lại (reset state) mỗi lần mở */}
      <PickerForm
        title={title}
        isPending={isPending}
        onSubmit={onSubmit}
        onCancel={() => innerRef.current?.close()}
      />
    </LayoutWithRef>
  );
});
export default ProductSelectorModal;

ProductSelectorModal.displayName = "ProductSelectorModal";

function PickerForm({
  title,
  isPending,
  onSubmit,
  onCancel,
}: {
  title: string;
  isPending: boolean;
  onSubmit(payload: SelectedProductPayload): void;
  onCancel(): void;
}) {
  const { data: products = [], isLoading } = useFetchOrderProductOptions();
  const [productId, setProductId] = useState<number | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [addonQty, setAddonQty] = useState<Record<number, number>>({});

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  const selectedAddons = useMemo(
    () =>
      (product?.addons ?? [])
        .map((a) => ({ ...a, quantity: addonQty[a.id] ?? 0 }))
        .filter((a) => a.quantity > 0),
    [product, addonQty],
  );

  const estimatedTotal = product
    ? computeItemTotal(product.price, quantity, selectedAddons)
    : 0;

  const clampQty = (v: number, max: number, min: number) =>
    Math.min(max, Math.max(min, Number.isFinite(v) ? Math.floor(v) : min));

  return (
    <div className="card bg-white w-xs sm:w-sm md:w-md max-h-[90vh] overflow-y-auto">
      <div className="p-5 flex flex-col gap-4">
        <p className="card-title">{title}</p>

        <div>
          <Label>Sản phẩm</Label>
          <Select
            value={productId ?? ""}
            disabled={isLoading}
            onChange={(e) => {
              setProductId(e.target.value ? Number(e.target.value) : undefined);
              setAddonQty({});
            }}
          >
            <option value="">{isLoading ? "Đang tải..." : "Chọn sản phẩm"}</option>
            {products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} - {formatCurrency(item.price)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Số lượng</Label>
          <Input
            type="number"
            min={1}
            max={MAX_ITEM_QUANTITY}
            value={quantity}
            onChange={(e) =>
              setQuantity(clampQty(Number(e.target.value), MAX_ITEM_QUANTITY, 1))
            }
          />
        </div>

        {product && product.addons.length > 0 && (
          <div>
            <Label>Add-ons</Label>
            <div className="flex flex-col gap-2">
              {product.addons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-gray-700">
                    {addon.name}{" "}
                    <span className="text-gray-500">
                      ({formatCurrency(addon.price)})
                    </span>
                  </span>
                  <Input
                    type="number"
                    min={0}
                    max={MAX_ADDON_QUANTITY}
                    className="w-20"
                    value={addonQty[addon.id] ?? 0}
                    onChange={(e) =>
                      setAddonQty((prev) => ({
                        ...prev,
                        [addon.id]: clampQty(
                          Number(e.target.value),
                          MAX_ADDON_QUANTITY,
                          0,
                        ),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label>Ghi chú</Label>
          <Textarea
            rows={2}
            maxLength={MAX_ITEM_NOTE_LENGTH}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú cho món (không bắt buộc)"
          />
        </div>

        <div className="flex justify-between text-sm font-semibold text-gray-700">
          <span>Tạm tính</span>
          <span>{formatCurrency(estimatedTotal)}</span>
        </div>

        <div className="card-actions justify-end">
          <Button disabled={isPending} onClick={onCancel}>
            Đóng
          </Button>
          <Button
            color="primary"
            disabled={!product || isPending}
            onClick={() => {
              if (!product) return;
              onSubmit({
                productId: product.id,
                quantity,
                note: note.trim(),
                addons: selectedAddons.map((a) => ({
                  addonId: a.id,
                  quantity: a.quantity,
                })),
              });
            }}
          >
            Thêm
          </Button>
        </div>
      </div>
    </div>
  );
}
