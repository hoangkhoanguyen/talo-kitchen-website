"use client";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deletePriceProgramAction,
  getPriceProgramsAction,
  savePriceProgramAction,
  togglePriceProgramAction,
} from "@/actions/admin/price-program";
import { Button } from "@/components/admin/ui/button";
import { Switch } from "@/components/admin/ui/form/Switch";
import { Modal } from "@/components/admin/ui/layout";
import { handleServerActionError } from "@/lib/handle-server-action-error";
import { hhmmToMinute, minuteToHHmm } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import { priceProgramSchema } from "@/validations/price-program";
import type { AdminPriceProgram } from "@/types/price-programs";

const QUERY_KEY = ["admin", "price-programs"];

// Thứ hiển thị T2 → CN (giá trị 0 = CN theo getUTCDay)
const DAYS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 0, label: "CN" },
];
const dayLabel = (d: number) => DAYS.find((x) => x.value === d)?.label ?? "";
const sortDays = (days: number[]) =>
  [...days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));

type ProductOption = {
  id: number;
  title: string;
  price: number;
  isActive: boolean;
  categoryId: number | null;
  categoryName: string;
};

type SlotDraft = { daysOfWeek: number[]; start: string; end: string; price: string };
type Draft = {
  id?: number;
  name: string;
  isActive: boolean;
  slots: SlotDraft[];
  productIds: number[];
};

const emptySlot = (): SlotDraft => ({ daysOfWeek: [], start: "", end: "", price: "" });
const emptyDraft = (): Draft => ({
  name: "",
  isActive: true,
  slots: [emptySlot()],
  productIds: [],
});
const toDraft = (p: AdminPriceProgram): Draft => ({
  id: p.id,
  name: p.name,
  isActive: p.isActive,
  slots: p.slots.map((s) => ({
    daysOfWeek: s.daysOfWeek,
    start: minuteToHHmm(s.startMinute),
    end: minuteToHHmm(s.endMinute),
    price: String(s.price),
  })),
  productIds: p.products.map((x) => x.id),
});

const PricePrograms = () => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getPriceProgramsAction();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const toggle = useMutation({
    mutationFn: togglePriceProgramAction,
    onSuccess: (res) => {
      if (!res.success) return handleServerActionError(res.code, res.error);
      refresh();
    },
    onError: () => toast.error("Có lỗi xảy ra"),
  });
  const remove = useMutation({
    mutationFn: deletePriceProgramAction,
    onSuccess: (res) => {
      if (!res.success) return handleServerActionError(res.code, res.error);
      toast.success("Đã xoá chương trình");
      refresh();
    },
    onError: () => toast.error("Có lỗi xảy ra"),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm opacity-70">
          Giá tính theo giờ Việt Nam. Món trong khung giờ được bán với giá đã set
          (topping giữ giá). Nếu nhiều khung trùng nhau, lấy giá thấp nhất.
        </p>
        <Button color="success" onClick={() => setDraft(emptyDraft())}>
          Thêm chương trình
        </Button>
      </div>

      {error && <div className="alert alert-error">{error.message}</div>}

      <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
        <table className="table">
          <thead>
            <tr>
              <th>Chương trình</th>
              <th>Khung giờ</th>
              <th>Món áp dụng</th>
              <th>Bật</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isPending && (
              <tr>
                <td colSpan={5} className="text-center">
                  <span className="loading loading-spinner" />
                </td>
              </tr>
            )}
            {data?.programs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center opacity-60">
                  Chưa có chương trình nào
                </td>
              </tr>
            )}
            {data?.programs.map((p) => (
              <tr key={p.id} className={p.isActive ? "" : "opacity-60"}>
                <td className="font-medium">{p.name}</td>
                <td>
                  {p.slots.map((s, i) => (
                    <div key={i} className="whitespace-nowrap">
                      {sortDays(s.daysOfWeek).map(dayLabel).join(", ")} ·{" "}
                      {minuteToHHmm(s.startMinute)}–{minuteToHHmm(s.endMinute)} ·{" "}
                      <b>{formatCurrency(s.price)}</b>
                    </div>
                  ))}
                </td>
                <td className="max-w-xs">
                  {p.products.map((x) => x.title).join(", ")}
                </td>
                <td>
                  <Switch
                    checked={p.isActive}
                    disabled={toggle.isPending}
                    onChange={(e) =>
                      toggle.mutate({ id: p.id, isActive: e.target.checked })
                    }
                  />
                </td>
                <td className="whitespace-nowrap text-right">
                  <Button variant="outline" onClick={() => setDraft(toDraft(p))}>
                    Sửa
                  </Button>{" "}
                  <Button
                    variant="outline"
                    color="error"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (confirm(`Xoá chương trình "${p.name}"?`)) remove.mutate(p.id);
                    }}
                  >
                    Xoá
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft && (
        <PriceProgramForm
          draft={draft}
          products={data?.productOptions ?? []}
          onClose={() => setDraft(null)}
          onSaved={() => {
            setDraft(null);
            refresh();
          }}
        />
      )}
    </div>
  );
};

const PriceProgramForm = ({
  draft: initial,
  products,
  onClose,
  onSaved,
}: {
  draft: Draft;
  products: ProductOption[];
  onClose(): void;
  onSaved(): void;
}) => {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const save = useMutation({
    mutationFn: savePriceProgramAction,
    onSuccess: (res) => {
      if (!res.success) return handleServerActionError(res.code, res.error);
      toast.success("Đã lưu chương trình");
      onSaved();
    },
    onError: () => toast.error("Có lỗi xảy ra"),
  });

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.categoryId !== null) map.set(String(p.categoryId), p.categoryName);
    });
    return [...map.entries()];
  }, [products]);

  const visibleProducts = products.filter(
    (p) =>
      (p.isActive || draft.productIds.includes(p.id)) &&
      (!categoryFilter || String(p.categoryId) === categoryFilter),
  );
  const selected = new Set(draft.productIds);
  const selectedProducts = products.filter((p) => selected.has(p.id));

  const setSlot = (index: number, patch: Partial<SlotDraft>) =>
    setDraft((d) => ({
      ...d,
      slots: d.slots.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  const toggleProduct = (id: number, checked: boolean) =>
    setDraft((d) => ({
      ...d,
      productIds: checked
        ? [...new Set([...d.productIds, id])]
        : d.productIds.filter((x) => x !== id),
    }));
  const selectAllVisible = (checked: boolean) =>
    setDraft((d) => {
      const ids = visibleProducts.map((p) => p.id);
      return {
        ...d,
        productIds: checked
          ? [...new Set([...d.productIds, ...ids])]
          : d.productIds.filter((x) => !ids.includes(x)),
      };
    });

  // Cảnh báo (không chặn): giá khung ≥ giá gốc của món → món đó không được giảm
  const warnings = draft.slots.flatMap((s, i) => {
    const price = Number(s.price);
    if (!price) return [];
    const notCheaper = selectedProducts.filter((p) => price >= p.price);
    return notCheaper.length
      ? [
          `Khung ${i + 1}: giá ${formatCurrency(price)} không thấp hơn giá gốc của ${notCheaper
            .map((p) => p.title)
            .join(", ")} → các món này giữ giá gốc.`,
        ]
      : [];
  });

  const onSubmit = () => {
    const payload = {
      name: draft.name,
      isActive: draft.isActive,
      productIds: draft.productIds,
      slots: draft.slots.map((s) => ({
        daysOfWeek: s.daysOfWeek,
        startMinute: hhmmToMinute(s.start) ?? -1,
        endMinute: hhmmToMinute(s.end) ?? -1,
        price: s.price.trim() === "" ? NaN : Number(s.price),
      })),
    };
    const parsed = priceProgramSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors([
        ...new Set(
          parsed.error.issues.map((issue) => {
            const slot = issue.path[0] === "slots" ? `Khung ${Number(issue.path[1]) + 1}: ` : "";
            const field = issue.path[2];
            if (field === "startMinute" || field === "endMinute") {
              return `${slot}${issue.message.includes("sau") ? issue.message : "Giờ không hợp lệ (HH:mm)"}`;
            }
            return `${slot}${issue.message}`;
          }),
        ),
      ]);
      return;
    }
    setErrors([]);
    save.mutate({ id: draft.id, data: parsed.data });
  };

  return (
    <Modal isOpen onClose={onClose} className="w-full max-w-3xl">
      <div className="bg-base-100 rounded-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold">
          {draft.id ? "Sửa chương trình giá" : "Thêm chương trình giá"}
        </h3>

        <div className="flex gap-4 items-end">
          <label className="flex-1 flex flex-col gap-1">
            <span className="text-sm font-medium">Tên chương trình</span>
            <input
              className="input input-sm w-full"
              value={draft.name}
              placeholder="VD: Happy Hour Classic Cocktail"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 pb-1">
            <Switch
              checked={draft.isActive}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
            />
            <span className="text-sm">Đang bật</span>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Khung giờ (giờ Việt Nam)</span>
          {draft.slots.map((s, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-base-300 p-3">
              <div className="flex gap-1">
                {DAYS.map((d) => (
                  <label key={d.value} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={s.daysOfWeek.includes(d.value)}
                      onChange={(e) =>
                        setSlot(i, {
                          daysOfWeek: e.target.checked
                            ? [...s.daysOfWeek, d.value]
                            : s.daysOfWeek.filter((x) => x !== d.value),
                        })
                      }
                    />
                    {d.label}
                  </label>
                ))}
              </div>
              <input
                type="time"
                className="input input-sm w-28"
                value={s.start}
                onChange={(e) => setSlot(i, { start: e.target.value })}
              />
              <span>→</span>
              <input
                type="time"
                className="input input-sm w-28"
                value={s.end === "24:00" ? "23:59" : s.end}
                onChange={(e) =>
                  setSlot(i, { end: e.target.value === "23:59" ? "24:00" : e.target.value })
                }
              />
              <input
                type="number"
                min={0}
                step={1000}
                className="input input-sm w-32"
                placeholder="Giá"
                value={s.price}
                onChange={(e) => setSlot(i, { price: e.target.value })}
              />
              {draft.slots.length > 1 && (
                <Button
                  variant="outline"
                  color="error"
                  size="xs"
                  onClick={() =>
                    setDraft({ ...draft, slots: draft.slots.filter((_, j) => j !== i) })
                  }
                >
                  Xoá
                </Button>
              )}
            </div>
          ))}
          <p className="text-xs opacity-60">
            Giờ kết thúc không tính (VD 16:00 → 21:00: 21:00 trở về giá gốc). Chọn
            23:59 để áp tới hết ngày.
          </p>
          <Button
            variant="dash"
            className="self-start"
            onClick={() => setDraft({ ...draft, slots: [...draft.slots, emptySlot()] })}
          >
            + Thêm khung giờ
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
              Món áp dụng ({draft.productIds.length})
            </span>
            <select
              className="select select-sm w-48"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={visibleProducts.length > 0 && visibleProducts.every((p) => selected.has(p.id))}
              onChange={(e) => selectAllVisible(e.target.checked)}
            />
            Chọn tất cả món đang hiển thị
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-60 overflow-y-auto rounded-xl border border-base-300 p-3">
            {visibleProducts.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-xs"
                  checked={selected.has(p.id)}
                  onChange={(e) => toggleProduct(p.id, e.target.checked)}
                />
                <span className={p.isActive ? "" : "opacity-50"}>{p.title}</span>
                <span className="opacity-60 ml-auto">{formatCurrency(p.price)}</span>
              </label>
            ))}
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="alert alert-warning text-sm flex flex-col items-start">
            {warnings.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        )}
        {errors.length > 0 && (
          <div className="alert alert-error text-sm flex flex-col items-start">
            {errors.map((e) => (
              <span key={e}>{e}</span>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button color="success" disabled={save.isPending} onClick={onSubmit}>
            {save.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PricePrograms;
