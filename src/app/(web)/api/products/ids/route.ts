import { getRequestLocale } from "@/lib/locale";
import { withError } from "@/providers/withError";
import { getProductsDetailsByIds } from "@/services/products";
import { NextRequest, NextResponse } from "next/server";

const getProductsDetailsByIdsApi = async (request: NextRequest) => {
  const ids = request.nextUrl.searchParams.get("ids");
  const locale = getRequestLocale(request);
  const products = await getProductsDetailsByIds(
    ids ? ids.split(",").map(Number) : [],
    locale,
  ); // Chuyển đổi chuỗi ID thành mảng số

  return NextResponse.json({ products });
};

export const GET = withError(getProductsDetailsByIdsApi);
