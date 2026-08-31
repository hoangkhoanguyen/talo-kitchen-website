import ProductDetailsHeader from "@/components/admin/features/products/ProductDetailsHeader";
import ProductDetailsProvider from "@/components/admin/features/products/ProductDetailsProvider";
import ProductEditForm from "@/components/admin/features/products/ProductEditForm";
import ImageLibraryModalProvider from "@/components/admin/shared/image-library/ImageLibraryProvider";
import {
  mapAddonTranslationsToForm,
  mapProductTranslationsToForm,
} from "@/lib/mappings/products";
import { getAdminProductDetailsById } from "@/services/products";
import { pick } from "lodash";
import React from "react";

// export const revalidate = 60; // revalidate this page every 60 seconds

// export const dynamic = "force-dynamic";

const ProductDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id: idParam } = await params;
  const id = parseInt(idParam);

  if (isNaN(id)) return <>NoData</>;
  const product = await getAdminProductDetailsById(id);

  if (!product) return <>NoData</>;

  const convertedProduct = {
    slug: product.slug,
    categoryId: product.category.id,
    isActive: product.isActive,
    price: product.price,
    translations: mapProductTranslationsToForm(product, product.translations),
    addons: product.addons.map((item) => ({
      ...pick(item, "id", "isActive", "price"),
      translations: mapAddonTranslationsToForm(item, item.translations),
    })),
    images: product.images.map((item) => pick(item, "id", "url")),
    relatedProducts: product.relatedProducts.map((item) =>
      pick(item, "id", "title"),
    ),
    priority: product.priority,
  };

  return (
    <ProductDetailsProvider initProduct={convertedProduct} id={product.id}>
      <ImageLibraryModalProvider>
        <ProductDetailsHeader />
        <ProductEditForm />
      </ImageLibraryModalProvider>
    </ProductDetailsProvider>
  );
};

export default ProductDetailsPage;
