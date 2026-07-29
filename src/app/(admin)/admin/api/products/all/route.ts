import { withError } from "@/providers/withError";
import { withAuth } from "@/providers/withAuth";
import { getAllProducts } from "@/services/products";
import { NextResponse } from "next/server";
import { AccessTokenPayload } from "@/lib/auth";

async function getAllProductsApi(payload: AccessTokenPayload) {
  const allProducts = await getAllProducts();

  return NextResponse.json({ allProducts });
}

export const GET = withError(withAuth(getAllProductsApi));
