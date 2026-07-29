"use server";

import { checkCartLength, getCartProductsByIds } from "@/services/cart";
import { ProductAddOnDB, WebProduct } from "@/types/products";

export async function checkCartLengthAction({
  productIds,
}: {
  productIds: number[];
}) {
  try {
    return checkCartLength({ productIds });
  } catch (error) {
    console.error("Error checking cart length:", error);
    return 0;
  }
}

export async function getCartProductsByIdsAction({
  ids,
}: {
  ids: number[];
}): Promise<
  (Pick<
    WebProduct,
    "id" | "category" | "imageUrl" | "price" | "slug" | "title"
  > & {
    addons: Pick<ProductAddOnDB, "id" | "name" | "price">[];
  })[]
> {
  try {
    return getCartProductsByIds(ids);
  } catch (error) {
    console.error("Error getting cart products by IDs:", error);
    return [];
  }
}
