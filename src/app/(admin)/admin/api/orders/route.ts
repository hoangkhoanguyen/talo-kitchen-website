import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { getAdminOrderTable } from "@/services/orders";
import { NextRequest, NextResponse } from "next/server";
import { AccessTokenPayload } from "@/lib/auth";
import z from "zod";

const schema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().positive().max(50).default(10),
  search: z.string().nullable().default(""),
  start_date: z.string().nullable().default(""),
  end_date: z.string().nullable().default(""),
  status: z
    .string()
    .nullable()
    .default("")
    .transform((val) => (val ? val.split(",") : [])),
  order_type: z
    .string()
    .nullable()
    .default("")
    .transform((val) => (val ? val.split(",") : [])),
});

async function getOrdersApi(payload: AccessTokenPayload, req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page");
  const limit = req.nextUrl.searchParams.get("limit");
  const search = req.nextUrl.searchParams.get("search");
  const start_date = req.nextUrl.searchParams.get("start_date");
  const end_date = req.nextUrl.searchParams.get("end_date");
  const status = req.nextUrl.searchParams.get("status");
  const order_type = req.nextUrl.searchParams.get("order_type");

  const { success, data: query } = schema.safeParse({
    page,
    limit,
    search,
    start_date,
    end_date,
    status,
    order_type,
  });

  if (!success)
    return NextResponse.json({
      orders: [],
      total: 0,
      page,
      limit,
      message: "error in query",
    });

  const result = await getAdminOrderTable(query);

  return NextResponse.json(result);
}

export const GET = withError(withAuth(getOrdersApi));
