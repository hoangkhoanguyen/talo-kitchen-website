import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, type DB } from "@/db/drizzle";
import {
  priceProgramProducts,
  pricePrograms,
  priceProgramSlots,
  products,
} from "@/db/schemas";
import { CACHE_TAGS } from "@/constants/cache";
import { createCachedFunction } from "@/lib/cache";
import type { PriceProgramRule } from "@/lib/pricing";
import type {
  AdminPriceProgram,
  PriceProgramInput,
} from "@/types/price-programs";

/**
 * Cấu hình các chương trình ĐANG BẬT (không phụ thuộc thời gian).
 * Đọc trực tiếp DB — dùng trong transaction đặt đơn / sửa đơn.
 */
export async function getActivePriceRules(db: DB = getDb()): Promise<PriceProgramRule[]> {
  const rows = await db.query.pricePrograms.findMany({
    where: eq(pricePrograms.isActive, true),
    columns: { id: true },
    with: {
      slots: {
        columns: { daysOfWeek: true, startMinute: true, endMinute: true, price: true },
      },
      products: { columns: { productId: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    slots: r.slots,
    productIds: r.products.map((p) => p.productId),
  }));
}

/**
 * Bản cache cho trang web. An toàn để cache vì chỉ là CẤU HÌNH;
 * "đang trong khung giờ hay không" được tính sau, lúc request.
 */
export const getActivePriceRulesCached = createCachedFunction(
  () => getActivePriceRules(),
  ["price-programs", "active"],
  [CACHE_TAGS.PRICE_PROGRAMS.ACTIVE],
);

/* ------------------------------ Admin ------------------------------ */

export async function getAdminPricePrograms(): Promise<AdminPriceProgram[]> {
  const rows = await getDb().query.pricePrograms.findMany({
    with: {
      slots: { orderBy: [asc(priceProgramSlots.id)] },
      products: {
        with: { product: { columns: { id: true, title: true, price: true } } },
      },
    },
    orderBy: [desc(pricePrograms.createdAt)],
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    isActive: r.isActive,
    slots: r.slots.map(({ daysOfWeek, startMinute, endMinute, price }) => ({
      daysOfWeek,
      startMinute,
      endMinute,
      price,
    })),
    products: r.products.map((p) => p.product),
  }));
}

/** Id sản phẩm không tồn tại trong DB (để báo lỗi khi lưu). */
async function findMissingProductIds(db: DB, ids: number[]) {
  if (!ids.length) return [];
  const found = await db
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.id, ids));
  const set = new Set(found.map((f) => f.id));
  return ids.filter((id) => !set.has(id));
}

async function writeChildren(db: DB, programId: number, input: PriceProgramInput) {
  await db.insert(priceProgramSlots).values(
    input.slots.map((s) => ({
      programId,
      daysOfWeek: [...new Set(s.daysOfWeek)].sort(),
      startMinute: s.startMinute,
      endMinute: s.endMinute,
      price: s.price,
    })),
  );
  await db
    .insert(priceProgramProducts)
    .values([...new Set(input.productIds)].map((productId) => ({ programId, productId })));
}

export type SavePriceProgramResult =
  | { ok: true; id: number }
  | { ok: false; code: "NOT_FOUND" | "PRODUCT_NOT_FOUND" };

export async function createPriceProgram(
  input: PriceProgramInput,
): Promise<SavePriceProgramResult> {
  return getDb().transaction(async (tx) => {
    if ((await findMissingProductIds(tx, input.productIds)).length) {
      return { ok: false, code: "PRODUCT_NOT_FOUND" } as const;
    }
    const [program] = await tx
      .insert(pricePrograms)
      .values({ name: input.name, isActive: input.isActive })
      .returning({ id: pricePrograms.id });
    await writeChildren(tx, program.id, input);
    return { ok: true, id: program.id } as const;
  });
}

/** Sửa = ghi đè toàn bộ khung giờ + danh sách món (đơn giản, ít dữ liệu). */
export async function updatePriceProgram(
  id: number,
  input: PriceProgramInput,
): Promise<SavePriceProgramResult> {
  return getDb().transaction(async (tx) => {
    if ((await findMissingProductIds(tx, input.productIds)).length) {
      return { ok: false, code: "PRODUCT_NOT_FOUND" } as const;
    }
    const updated = await tx
      .update(pricePrograms)
      .set({ name: input.name, isActive: input.isActive, updatedAt: new Date() })
      .where(eq(pricePrograms.id, id))
      .returning({ id: pricePrograms.id });
    if (!updated.length) return { ok: false, code: "NOT_FOUND" } as const;
    await tx.delete(priceProgramSlots).where(eq(priceProgramSlots.programId, id));
    await tx.delete(priceProgramProducts).where(eq(priceProgramProducts.programId, id));
    await writeChildren(tx, id, input);
    return { ok: true, id } as const;
  });
}

export async function setPriceProgramActive(id: number, isActive: boolean) {
  const rows = await getDb()
    .update(pricePrograms)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(pricePrograms.id, id))
    .returning({ id: pricePrograms.id });
  return rows.length > 0;
}

export async function deletePriceProgram(id: number) {
  const rows = await getDb()
    .delete(pricePrograms)
    .where(eq(pricePrograms.id, id))
    .returning({ id: pricePrograms.id });
  return rows.length > 0;
}

/** Danh sách món (kèm danh mục, giá gốc) cho bộ chọn món trong form. */
export async function getPriceProgramProductOptions() {
  const rows = await getDb().query.products.findMany({
    columns: { id: true, title: true, price: true, isActive: true },
    with: { category: { columns: { id: true, name: true } } },
    orderBy: [desc(products.priority), desc(products.createdAt)],
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    price: r.price,
    isActive: r.isActive,
    categoryId: r.category?.id ?? null,
    categoryName: r.category?.name ?? "",
  }));
}
