import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { getAdminReservationTable } from "@/services/reservations";
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
  reservation_type: z
    .string()
    .nullable()
    .default("")
    .transform((val) => (val ? val.split(",") : [])),
});

async function getReservationsApi(
  payload: AccessTokenPayload,
  req: NextRequest,
) {
  const page = req.nextUrl.searchParams.get("page");
  const limit = req.nextUrl.searchParams.get("limit");
  const search = req.nextUrl.searchParams.get("search");
  const start_date = req.nextUrl.searchParams.get("start_date");
  const end_date = req.nextUrl.searchParams.get("end_date");
  const status = req.nextUrl.searchParams.get("status");
  const reservation_type = req.nextUrl.searchParams.get("reservation_type");

  const { success, data: query } = schema.safeParse({
    page,
    limit,
    search,
    start_date,
    end_date,
    status,
    reservation_type,
  });

  if (!success)
    return NextResponse.json({
      reservations: [],
      total: 0,
      page,
      limit,
      message: "error in query",
    });

  const result = await getAdminReservationTable(query);

  return NextResponse.json(result);
}

export const GET = withError(withAuth(getReservationsApi));
