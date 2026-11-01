"use server";
import z from "zod";
import { verifyAdminAuthSimple } from "@/services/auth";
import {
  createPriceProgram,
  deletePriceProgram,
  getAdminPricePrograms,
  getPriceProgramProductOptions,
  setPriceProgramActive,
  updatePriceProgram,
} from "@/services/price-programs";
import { revalidatePricePrograms } from "@/lib/revalidate";
import { priceProgramSchema } from "@/validations/price-program";
import { ADMIN_ROUTE } from "@/constants/route";

type Failure = { success: false; error: string; code?: string };
type Result<T> = Failure | { success: true; data: T };

const UNAUTHORIZED: Failure = {
  success: false,
  error: "Không có quyền truy cập",
  code: "UNAUTHORIZED",
};
const INVALID_INPUT: Failure = {
  success: false,
  error: "Dữ liệu không hợp lệ",
  code: "INVALID_INPUT",
};
const NOT_FOUND: Failure = {
  success: false,
  error: "Chương trình không tồn tại",
  code: "NOT_FOUND",
};

async function isAuthorized() {
  const auth = await verifyAdminAuthSimple(ADMIN_ROUTE.pricePrograms);
  return auth.isValid;
}

const idSchema = z.number().int().positive();

export async function getPriceProgramsAction() {
  try {
    if (!(await isAuthorized())) return UNAUTHORIZED;
    const [programs, productOptions] = await Promise.all([
      getAdminPricePrograms(),
      getPriceProgramProductOptions(),
    ]);
    return { success: true as const, data: { programs, productOptions } };
  } catch (error) {
    console.log("Error fetching price programs:", error);
    return { success: false as const, error: "Không thể tải chương trình giá" };
  }
}

export async function savePriceProgramAction(input: {
  id?: number;
  data: z.input<typeof priceProgramSchema>;
}): Promise<Result<{ id: number }>> {
  try {
    if (!(await isAuthorized())) return UNAUTHORIZED;
    const parsed = priceProgramSchema.safeParse(input.data);
    if (!parsed.success) return INVALID_INPUT;
    if (input.id !== undefined && !idSchema.safeParse(input.id).success) {
      return INVALID_INPUT;
    }

    const result =
      input.id === undefined
        ? await createPriceProgram(parsed.data)
        : await updatePriceProgram(input.id, parsed.data);

    if (!result.ok) {
      return result.code === "NOT_FOUND"
        ? NOT_FOUND
        : { success: false, error: "Có món không tồn tại", code: result.code };
    }
    revalidatePricePrograms();
    return { success: true, data: { id: result.id } };
  } catch (error) {
    console.log("Error saving price program:", error);
    return { success: false, error: "Không thể lưu chương trình giá" };
  }
}

export async function togglePriceProgramAction(input: {
  id: number;
  isActive: boolean;
}): Promise<Result<null>> {
  try {
    if (!(await isAuthorized())) return UNAUTHORIZED;
    if (!idSchema.safeParse(input.id).success || typeof input.isActive !== "boolean") {
      return INVALID_INPUT;
    }
    if (!(await setPriceProgramActive(input.id, input.isActive))) return NOT_FOUND;
    revalidatePricePrograms();
    return { success: true, data: null };
  } catch (error) {
    console.log("Error toggling price program:", error);
    return { success: false, error: "Không thể cập nhật chương trình giá" };
  }
}

export async function deletePriceProgramAction(id: number): Promise<Result<null>> {
  try {
    if (!(await isAuthorized())) return UNAUTHORIZED;
    if (!idSchema.safeParse(id).success) return INVALID_INPUT;
    if (!(await deletePriceProgram(id))) return NOT_FOUND;
    revalidatePricePrograms();
    return { success: true, data: null };
  } catch (error) {
    console.log("Error deleting price program:", error);
    return { success: false, error: "Không thể xoá chương trình giá" };
  }
}
