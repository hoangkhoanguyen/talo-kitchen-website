import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { getNewOrdersSince } from "@/services/orders";
import { NextRequest, NextResponse } from "next/server";
import { AccessTokenPayload } from "@/lib/auth";

async function getNewOrdersApi(
  _payload: AccessTokenPayload,
  req: NextRequest,
) {
  const sinceParam = req.nextUrl.searchParams.get("since");
  const since =
    sinceParam !== null &&
    sinceParam !== "" &&
    !Number.isNaN(Number(sinceParam))
      ? Number(sinceParam)
      : null;

  const result = await getNewOrdersSince(since);

  return NextResponse.json(result);
}

export const GET = withError(withAuth(getNewOrdersApi));
