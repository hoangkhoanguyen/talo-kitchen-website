import { withError } from "@/providers/withError";
import { getProductDetailsForQuickCartByIdCached } from "@/services/cached";
import { NextRequest, NextResponse } from "next/server";

const getProductQuickCart = async (
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const product = await getProductDetailsForQuickCartByIdCached(Number(id));

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
