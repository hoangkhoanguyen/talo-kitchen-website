"use server";

import { checkCartLength, getCartProductsByIds } from "@/services/cart";
import { ProductAddOnDB, WebProduct } from "@/types/products";
import type { Locale } from "@/types/configs";

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
  locale,
}: {
  ids: number[];
  locale: Locale;
}): Promise<
  (Pick<
    WebProduct,
    "id" | "category" | "imageUrl" | "price" | "slug" | "title"
  > & {
    addons: Pick<ProductAddOnDB, "id" | "name" | "price">[];
  })[]
> {
  try {
    return getCartProductsByIds(ids, locale);
  } catch (error) {
    console.error("Error getting cart products by IDs:", error);
    return [];
  }
}
