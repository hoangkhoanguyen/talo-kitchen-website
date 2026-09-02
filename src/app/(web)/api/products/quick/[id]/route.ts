import { getRequestLocale } from "@/lib/locale";
import { withError } from "@/providers/withError";
import { getProductDetailsForQuickCartByIdCached } from "@/services/cached";
import { NextRequest, NextResponse } from "next/server";

const getProductQuickCart = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const locale = getRequestLocale(request);

  const product = await getProductDetailsForQuickCartByIdCached(
    Number(id),
    locale,
  );

  return NextResponse.json({
    product: product
      ? {
          ...product,
          category: product.category.name,
        }
      : null,
  });
};

export const GET = withError(getProductQuickCart);
