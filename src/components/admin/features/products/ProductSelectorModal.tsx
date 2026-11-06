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
import { Input, Label, Textarea } from "../../ui/form";
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

function normalizeText(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

type ProductOption = { id: number; title: string; price: number };

/**
 * Ô chọn món kiêm tìm kiếm: gõ để lọc (không phân biệt hoa/thường, dấu),
 * bấm hoặc ↑/↓ + Enter để chọn. Danh sách hiển thị ngay dưới ô (không
 * dùng absolute) để không bị cắt trong modal có overflow.
 */
function ProductCombobox({
  products,
  isLoading,
  value,
  onChange,
}: {
  products: ProductOption[];
  isLoading: boolean;
  value: number | undefined;
  onChange(id: number | undefined): void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = products.find((p) => p.id === value);
  const label = (p: ProductOption) => `${p.title} - ${formatCurrency(p.price)}`;

  const filtered = useMemo(() => {
    const keyword = normalizeText(query.trim());
    if (!keyword) return products;
    return products.filter((p) => normalizeText(p.title).includes(keyword));
  }, [products, query]);

  const choose = (p: ProductOption) => {
    onChange(p.id);
    setOpen(false);
    setQuery("");
  };

  const moveActive = (next: number) => {
    setActive(next);
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${next}"]`)
      ?.scrollIntoView({ block: "nearest" });
  };

  return (
    <div>
      <Input
        role="combobox"
        aria-expanded={open}
        aria-controls="product-combobox-list"
        disabled={isLoading}
        placeholder={
          isLoading ? "Đang tải..." : selected ? label(selected) : "Gõ để tìm món..."
        }
        value={open ? query : selected ? label(selected) : ""}
        onFocus={() => {
          setOpen(true);
          setQuery("");
          setActive(0);
        }}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            moveActive(Math.min(active + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            moveActive(Math.max(active - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (open && filtered[active]) choose(filtered[active]);
          } else if (e.key === "Escape" && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
      />
      {open && (
        <ul
          id="product-combobox-list"
          ref={listRef}
          role="listbox"
          className="mt-1 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">Không tìm thấy món</li>
          ) : (
            filtered.map((p, i) => (
              <li
                key={p.id}
                data-index={i}
                role="option"
                aria-selected={p.id === value}
                // mousedown + preventDefault để input không blur trước khi chọn
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(p);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex justify-between gap-3 px-3 py-2 text-sm cursor-pointer ${
                  i === active ? "bg-gray-100" : ""
                } ${p.id === value ? "font-semibold" : ""}`}
              >
                <span>{p.title}</span>
                <span className="text-gray-500 whitespace-nowrap">
                  {formatCurrency(p.price)}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

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
          <ProductCombobox
            products={products}
            isLoading={isLoading}
            value={productId}
            onChange={(id) => {
              setProductId(id);
              setAddonQty({});
            }}
          />
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
