import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { getAdminProductTable } from "@/services/products";
import { NextRequest, NextResponse } from "next/server";
import { AccessTokenPayload } from "@/lib/auth";
import z from "zod";

const schema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().positive().max(50).default(10),
  search: z.string().optional().nullable(),
});

async function getProductsApi(payload: AccessTokenPayload, req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page");
  const limit = req.nextUrl.searchParams.get("limit");
  const search = req.nextUrl.searchParams.get("search");
  const { success, data } = schema.safeParse({ page, limit, search });

  if (!success)
    return NextResponse.json({
      products: [],
      total: 0,
      page,
      limit,
    });

  const result = await getAdminProductTable(data);

  return NextResponse.json(result);
}

export const GET = withError(withAuth(getProductsApi));
