import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import {
  getAllProductCategories,
  getAdminCategoriesTable,
} from "@/services/products";
import { NextRequest, NextResponse } from "next/server";
import { AccessTokenPayload } from "@/lib/auth";
import z from "zod";

const getCategoriesQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().positive().max(50).default(20),
  search: z.string().optional().nullable(),
  isActive: z.enum(["true", "false"]).optional().nullable(),
});

const getCategoriesApi = async (
  payload: AccessTokenPayload,
  request: NextRequest,
) => {
  const page = request.nextUrl.searchParams.get("page");
  const limit = request.nextUrl.searchParams.get("limit");
  const search = request.nextUrl.searchParams.get("search");
  const isActive = request.nextUrl.searchParams.get("isActive");

  // If no pagination params, return all categories (for dropdowns, etc.)
  if (!page && !search && !isActive) {
    const categories = await getAllProductCategories();
    return NextResponse.json({ categories });
  }

  // Validate query parameters
  const { success, data, error } = getCategoriesQuerySchema.safeParse({
    page,
    limit,
    search,
    isActive,
  });

  if (!success) {
    return NextResponse.json(
      {
        categories: [],
        total: 0,
        page: 1,
        limit: 20,
        error: "Invalid query parameters",
        validationError: error,
      },
      { status: 200 },
    );
  }

  // Convert isActive from string to boolean or null
  let isActiveBool: boolean | null = null;
  if (data.isActive) {
    isActiveBool = data.isActive === "true";
  }

  // Get paginated results
  const result = await getAdminCategoriesTable({
    page: data.page,
    limit: data.limit,
    search: data.search || null,
    isActive: isActiveBool,
  });

  return NextResponse.json(result);
};

export const GET = withError(withAuth(getCategoriesApi));
