import { DB, getDb } from "@/db/drizzle";
import {
  productAddons,
  productCategories,
  productImages,
  products,
} from "@/db/schemas";
import {
  NewProductAddOnDB,
  NewProductCategoryDB,
  NewProductDB,
  NewProductImageDB,
  ProductAddOnDB,
  ProductImageDB,
  UpdateProductAddOnDB,
  UpdateProductImageDB,
  WebProduct,
} from "@/types/products";
import { eq, inArray, count, ilike, and, or, desc, ne, asc } from "drizzle-orm";
// Disabled cache imports - using direct DB calls now
// import {
//   createCachedFunction,
//   createDynamicCachedFunction,
// } from "@/lib/cache-utils";
// import { CACHE_TAGS } from "@/constants/cache";

export async function addProductCategory(categoryData: NewProductCategoryDB) {
  const db = getDb();
  const [newCategory] = await db
    .insert(productCategories)
    .values(categoryData)
    .returning();

  return newCategory;
}

export async function getAllProductCategories() {
  const db = getDb();
  return await db.select().from(productCategories);
}

export async function createProduct(productData: NewProductDB) {
  const db = getDb();
  const [newProduct] = await db
    .insert(products)
    .values({
      ...productData,
    })
    .returning();

  return newProduct;
}

export async function getAdminProductTable({
  limit = 20,
  page = 1,
  search,
}: {
  limit?: number;
  page?: number;
  search?: string | null;
}) {
  const db = getDb();
  const offset = limit * (page - 1);

  const buildWhereConditions = (fields: any, operators: any) => {
    const conditions = [];
    const { ilike, or } = operators;

    if (search) {
      conditions.push(
        or(
          ilike(fields.title, `%${search}%`),
          ilike(fields.description, `%${search}%`),
          ilike(fields.slug, `%${search}%`),
        ),
      );
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  };

  const [productsList, totalCountResult] = await Promise.all([
    db.query.products.findMany({
      where: buildWhereConditions,
      limit,
      offset,
      orderBy: [desc(products.priority), desc(products.createdAt)],
      with: {
        category: true,
        images: {
          orderBy(fields, { asc }) {
            return [asc(fields.sortOrder)];
          },
          limit: 1,
        },
      },
    }),

    search
      ? db
          .select({ count: count(products.id) })
          .from(products)
          .where(
            buildWhereConditions(products, {
              ilike,
              or,
            }),
          )
      : db.$count(products),
  ]);

  const totalCount = search
    ? (totalCountResult as { count: number }[])[0].count
    : (totalCountResult as number);

  return {
    products: productsList,
    total: totalCount,
    page,
    limit,
  };
}

export async function getAdminProductById(id: number) {
  const db = getDb();
  return await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      addons: true,
      images: {
        orderBy: [asc(productImages.sortOrder)],
      },
    },
  });
}

export async function getAdminRelatedProductsByIds(ids: number[]) {
  const db = getDb();
  return await db.query.products.findMany({
    where: inArray(products.id, ids),
    columns: {
      id: true,
      title: true,
      isActive: true,
    },
    orderBy: [desc(products.priority), desc(products.createdAt)],
  });
}

export async function getAdminProductDetailsById(id: number) {
  const product = await getAdminProductById(id);

  if (!product) return undefined;

  const relatedProducts = await getAdminRelatedProductsByIds(
    product.relatedProductIds,
  );

  return {
    ...product,
    relatedProducts,
  };
}

export async function addProductAddons(data: NewProductAddOnDB[], tx?: DB) {
  const executor = tx ?? getDb();
  return await executor.insert(productAddons).values(data).returning();
}

export async function updateProductAddon(
  id: number,
  data: UpdateProductAddOnDB,
  tx?: DB,
) {
  const executor = tx ?? getDb();
  const [updated] = await executor
    .update(productAddons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productAddons.id, id))
    .returning();
  return updated;
}

export async function updateProductAddons(
  addons: (Partial<UpdateProductAddOnDB> & { id: number })[],
  tx?: DB,
) {
  const executor = tx ?? getDb();
  const updated: ProductAddOnDB[] = [];

  for (const addon of addons) {
    // Fetch current addon
    const current = await executor.query.productAddons.findFirst({
      where: eq(productAddons.id, addon.id!),
      columns: {
        name: true,
        price: true,
        isActive: true,
        sortOrder: true,
      },
    });
    // Only update if data has changed
    if (
      current &&
      Object.keys(current).some(
        (key) =>
          addon[key as keyof UpdateProductAddOnDB] !==
          current[key as keyof typeof current],
      )
    ) {
      const result = await updateProductAddon(addon.id, addon, executor);
      if (result) updated.push(result);
    }
  }
  return updated;
}

export async function addProductImages(
  newImages: NewProductImageDB[],
  tx?: DB,
) {
  const executor = tx ?? getDb();

  return executor.insert(productImages).values(newImages).returning({
    id: productImages.id,
    url: productImages.url,
    altText: productImages.altText,
    isPrimary: productImages.isPrimary,
    sortOrder: productImages.sortOrder,
  });
}

export async function getAllProducts() {
  const db = getDb();
  return await db.query.products.findMany({
    columns: {
      id: true,
      slug: true,
      title: true,
      isActive: true,
      updatedAt: true,
    },
    orderBy: [desc(products.priority), desc(products.createdAt)],
  });
}

export async function updateProductImage(
  id: number,
  data: UpdateProductImageDB,
  tx?: DB,
) {
  const executor = tx ?? getDb();
  return await executor
    .update(productImages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(productImages.id, id))
    .returning();
}

export async function deleteProductImage(id: number) {
  const db = getDb();
  const [deletedImage] = await db
    .delete(productImages)
    .where(eq(productImages.id, id))
    .returning();
  return deletedImage;
}

export async function deleteProductImages(ids: number[]) {
  // // handle primary
  // const primaryImage = await db.query.productImages.findFirst({
  //   where: inArray(productImages.id, ids) && eq(productImages.isPrimary, true),
  // });
  // // check xem có primary image ko
  // // nếu có thì gắn primary cho image có sort nhỏ nhất
  // if (primaryImage) {
  //   // tìm image của product đó mà ko nằm trong ds định xóa và có sort order nhỏ nhất
  //   const minSortOrderImage = await db.query.productImages.findFirst({
  //     where:
  //       eq(productImages.productId, primaryImage.productId) &&
  //       notInArray(productImages.id, ids),
  //     orderBy: [productImages.sortOrder],
  //   });

  // update image đó thành primary
  //   if (minSortOrderImage) {
  //     await db
  //       .update(productImages)
  //       .set({ isPrimary: true })
  //       .where(eq(productImages.id, minSortOrderImage.id));
  //   }
  // }
  const db = getDb();

  return await db.delete(productImages).where(inArray(productImages.id, ids));
}

export async function updateProductImages(
  images: (Partial<UpdateProductImageDB> & { id: number })[],
  tx?: DB,
) {
  const executor = tx ?? getDb();
  const updated: ProductImageDB[] = [];

  for (const image of images) {
    // Fetch current image
    const current = await executor.query.productImages.findFirst({
      where: eq(productImages.id, image.id!),
      columns: {
        url: true,
        altText: true,
        isPrimary: true,
        sortOrder: true,
      },
    });
    // Only update if data has changed
    if (
      current &&
      Object.keys(current).some(
        (key) =>
          image[key as keyof UpdateProductImageDB] !==
          current[key as keyof typeof current],
      )
    ) {
      const [result] = await updateProductImage(image.id, image, executor);
      if (result) updated.push(result);
    }
  }
  return updated;
}

export async function updateProductById({
  id,
  productData,
  newAddons,
  oldAddons,
  newImages,
  oldImages,
}: {
  id: number;
  productData: Partial<NewProductDB>;
  newAddons: NewProductAddOnDB[];
  oldAddons: (UpdateProductAddOnDB & { id: number })[];
  newImages: NewProductImageDB[];
  oldImages: (UpdateProductImageDB & { id: number })[];
}) {
  const db = getDb();
  return await db.transaction(async (tx) => {
    await Promise.all([
      // update addons
      newAddons.length > 0
        ? addProductAddons(newAddons, tx)
        : Promise.resolve([]),
      oldAddons.length > 0
        ? updateProductAddons(oldAddons, tx)
        : Promise.resolve([]),
      // update images
      newImages.length > 0
        ? addProductImages(newImages, tx)
        : Promise.resolve([]),
      oldImages.length > 0
        ? updateProductImages(oldImages, tx)
        : Promise.resolve([]),
    ]);

    // update product
    const [updatedProduct] = await tx
      .update(products)
      .set({
        ...productData,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    return updatedProduct;
  });
}

export async function isExistingSlug(slug: string) {
  const db = getDb();
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    columns: {
      id: true,
    },
  });

  return !!product;
}

// === CATEGORY SERVICES ===

/**
 * Lấy danh sách category có phân trang và search
 */
export async function getAdminCategoriesTable({
  limit = 20,
  page = 1,
  search,
  isActive,
}: {
  limit?: number;
  page?: number;
  search?: string | null;
  isActive?: boolean | null;
}) {
  const db = getDb();
  const offset = limit * (page - 1);

  const buildWhereConditions = (fields: any, operators: any) => {
    const conditions = [];
    const { ilike, eq, and, or } = operators;

    if (search) {
      conditions.push(
        or(
          ilike(fields.name, `%${search}%`),
          ilike(fields.description, `%${search}%`),
        ),
      );
    }

    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(fields.isActive, isActive));
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  };

  const [categoriesList, [{ count: totalCount }]] = await Promise.all([
    db.query.productCategories.findMany({
      where: buildWhereConditions,
      limit,
      offset,
      orderBy: [desc(productCategories.createdAt)],
    }),
    db
      .select({ count: count(productCategories.id) })
      .from(productCategories)
      .where(
        buildWhereConditions(productCategories, {
          ilike,
          eq,
          and,
          or,
        }),
      ),
  ]);

  return {
    categories: categoriesList,
    total: totalCount,
    page,
    limit,
  };
}

/**
 * Lấy chi tiết category kèm danh sách sản phẩm
 */
export async function getCategoryWithProducts(id: number) {
  const db = getDb();

  const category = await db.query.productCategories.findFirst({
    where: eq(productCategories.id, id),
    with: {
      products: {
        with: {
          images: {
            orderBy: [asc(productImages.sortOrder)],
            limit: 1,
          },
        },
        orderBy: [desc(products.createdAt)],
      },
    },
  });

  return category;
}

/**
 * Update category
 */
export async function updateProductCategory(
  id: number,
  categoryData: Partial<NewProductCategoryDB>,
) {
  const db = getDb();

  const [updatedCategory] = await db
    .update(productCategories)
    .set({
      ...categoryData,
      updatedAt: new Date(),
    })
    .where(eq(productCategories.id, id))
    .returning();

  return updatedCategory;
}

/**
 * Kiểm tra xem slug category có tồn tại không
 */
export async function isExistingCategorySlug(slug: string, excludeId?: number) {
  const db = getDb();

  const conditions = [eq(productCategories.slug, slug)];

  if (excludeId) {
    conditions.push(ne(productCategories.id, excludeId));
  }

  const category = await db.query.productCategories.findFirst({
    where: and(...conditions),
    columns: {
      id: true,
    },
  });

  return !!category;
}

/**
 * Kiểm tra xem name category có tồn tại không
 */
export async function isExistingCategoryName(name: string, excludeId?: number) {
  const db = getDb();

  const conditions = [eq(productCategories.name, name)];

  if (excludeId) {
    conditions.push(ne(productCategories.id, excludeId));
  }

  const category = await db.query.productCategories.findFirst({
    where: and(...conditions),
    columns: {
      id: true,
    },
  });

  return !!category;
}

/**
 * Lấy danh sách sản phẩm theo category slug
 */
export async function getProductsByCategorySlug(
  categorySlug: string,
): Promise<WebProduct[]> {
  const db = getDb();

  if (categorySlug === "all") {
    // Lấy tất cả sản phẩm active
    const productsList = await db.query.products.findMany({
      where: eq(products.isActive, true),
      columns: {
        id: true,
        title: true,
        slug: true,
        subDescription: true,
        price: true,
      },
      with: {
        images: {
          columns: {
            url: true,
          },
          orderBy: [asc(productImages.sortOrder)],
          limit: 1,
        },
        category: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: [desc(products.priority), desc(products.createdAt)],
    });

    // Format data for product cards
    const formattedProducts: WebProduct[] = productsList.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      subDescription: product.subDescription || "",
      price: product.price,
      imageUrl: product.images[0]?.url || "",
      category: product.category?.name || "",
    }));

    return formattedProducts;
  }

  // Tìm category theo slug
  const category = await db.query.productCategories.findFirst({
    where: and(
      eq(productCategories.slug, categorySlug),
      eq(productCategories.isActive, true),
    ),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!category) return [];

  // Lấy tất cả sản phẩm active của category
  const productsList = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, category.id),
      eq(products.isActive, true),
    ),
    columns: {
      id: true,
      title: true,
      slug: true,
      subDescription: true,
      price: true,
    },
    with: {
      images: {
        columns: {
          url: true,
        },
        orderBy: [asc(productImages.sortOrder)],
        limit: 1,
      },
    },
    orderBy: [desc(products.priority), desc(products.createdAt)],
  });

  // Format data for product cards
  const formattedProducts: WebProduct[] = productsList.map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    subDescription: product.subDescription || "",
    price: product.price,
    imageUrl: product.images[0]?.url || "",
    category: category.name,
  }));

  return formattedProducts;
}

/**
 * Lấy thông tin product theo slug cho việc hiển thị card
 */
export async function getProductBySlug(slug: string) {
  const db = getDb();

  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    columns: {
      id: true,
      title: true,
      slug: true,
      subDescription: true,
      price: true,
    },
    with: {
      images: {
        columns: {
          url: true,
        },
        orderBy: [asc(productImages.sortOrder)],
        limit: 1,
      },
      category: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) return null;

  // Format data for product card
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    subDescription: product.subDescription || "",
    price: product.price,
    imageUrl: product.images[0]?.url || "",
    category: product.category.name,
  };
}

export async function getProductDetailsBySlug(slug: string) {
  const db = getDb();

  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    columns: {
      id: true,
      title: true,
      description: true,
      slug: true,
      subDescription: true,
      price: true,
      allergenInfo: true,
      relatedProductIds: true,
    },
    with: {
      category: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: [asc(productImages.sortOrder)],
      },
      addons: {
        where: eq(productAddons.isActive, true),
        orderBy: [asc(productAddons.sortOrder)],
      },
    },
  });

  return product;
}

export async function getMultipleProductsByIds(ids: number[]) {
  if (!ids.length) return []; // Tránh query không cần thiết
  const db = getDb();
  return await db.query.products.findMany({
    where: and(eq(products.isActive, true), inArray(products.id, ids)),
    columns: {
      id: true,
      title: true,
      slug: true,
      subDescription: true,
      price: true,
    },
    with: {
      images: {
        columns: {
          url: true,
        },
        orderBy: [asc(productImages.sortOrder)],
        limit: 1,
      },
      category: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [desc(products.priority), desc(products.createdAt)],
  });
}

export async function getProductsDetailsByIds(ids: number[]): Promise<
  (Pick<
    WebProduct,
    "id" | "category" | "imageUrl" | "price" | "slug" | "title"
  > & {
    addons: Pick<ProductAddOnDB, "id" | "name" | "price">[];
  })[]
> {
  if (!ids.length) return []; // Tránh query không cần thiết

  const db = getDb();

  const productList = await db.query.products.findMany({
    where: and(eq(products.isActive, true), inArray(products.id, ids)),
    columns: {
      id: true,
      title: true,
      price: true,
      slug: true,
    },
    with: {
      images: {
        columns: {
          url: true,
          altText: true,
        },
        orderBy: [asc(productImages.sortOrder)],
        limit: 1,
      },
      category: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      addons: {
        where(fields, operators) {
          const { eq } = operators;
          return eq(fields.isActive, true);
        },
        orderBy: [asc(productAddons.sortOrder)],
        columns: {
          id: true,
          name: true,
          price: true,
        },
      },
    },
  });

  return productList.map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    imageUrl: product.images[0]?.url || "",
    category: product.category?.name || "",
    addons: product.addons,
  }));
}

// ==================== CACHED VERSIONS (DISABLED) ====================
// Note: These cached functions are disabled to simplify the system
// All functions now use direct database calls for real-time data

/*
export const getAllProductCategoriesCached = createCachedFunction(
  getAllProductCategories,
  ["products", "categories", "all"],
  [CACHE_TAGS.CATEGORIES.ALL],
);

export const getProductBySlugCached = createDynamicCachedFunction(
  getProductBySlug,
  (slug) => ["products", "item", "slug", slug],
  (slug) => [CACHE_TAGS.PRODUCTS.BY_SLUG(slug)],
);

export const getProductDetailsBySlugCached = createDynamicCachedFunction(
  getProductDetailsBySlug,
  (slug) => ["products", "details", "slug", slug],
  (slug) => [CACHE_TAGS.PRODUCTS.BY_SLUG(slug)],
);

export const getProductsByCategorySlugCached = createDynamicCachedFunction(
  getProductsByCategorySlug,
  (categorySlug) => ["products", "category", categorySlug],
  (categorySlug) => [
    CACHE_TAGS.PRODUCTS.BY_CATEGORY_SLUG(categorySlug),
    CACHE_TAGS.PRODUCTS.LIST,
  ],
);

export const getAllProductsCached = createCachedFunction(
  getAllProducts,
  ["products", "all"],
  [CACHE_TAGS.PRODUCTS.ALL],
);

export const getMultipleProductsByIdsCached = createDynamicCachedFunction(
  getMultipleProductsByIds,
  (ids) => ["products", "multiple", ids.sort().join(",")],
  () => [CACHE_TAGS.PRODUCTS.ALL],
);

export const getProductsDetailsByIdsCached = createDynamicCachedFunction(
  getProductsDetailsByIds,
  (ids) => ["products", "details", "multiple", ids.sort().join(",")],
  () => [CACHE_TAGS.PRODUCTS.ALL],
);

// ==================== ADMIN CACHED VERSIONS (DISABLED) ====================

export const getAdminProductTableCached = createDynamicCachedFunction(
  getAdminProductTable,
  (params) => [
    "admin",
    "products",
    "table",
    (params.limit || 20).toString(),
    (params.page || 1).toString(),
    params.search || "null",
  ],
  () => [CACHE_TAGS.PRODUCTS.ADMIN_LIST, CACHE_TAGS.CATEGORIES.ALL],
);

export const getAdminProductByIdCached = createDynamicCachedFunction(
  getAdminProductById,
  (id) => ["admin", "products", "item", id.toString()],
  (id) => [CACHE_TAGS.PRODUCTS.BY_ID(id)],
);

export const getAdminProductDetailsByIdCached = createDynamicCachedFunction(
  getAdminProductDetailsById,
  (id) => ["admin", "products", "details", id.toString()],
  (id) => [CACHE_TAGS.PRODUCTS.BY_ID(id)],
);

export const getCategoryWithProductsCached = createDynamicCachedFunction(
  getCategoryWithProducts,
  (id) => ["admin", "categories", "with-products", id.toString()],
  (id) => [
    CACHE_TAGS.CATEGORIES.BY_ID(id),
    CACHE_TAGS.PRODUCTS.BY_CATEGORY(id),
  ],
);
*/

// Helper function to check if product exists
export async function checkProductExists(id: number) {
  const db = getDb();
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    columns: {
      id: true,
    },
  });

  return !!product;
}

// Pure update function for product status
export async function updateProductStatus(id: number, isActive: boolean) {
  const db = getDb();
  const [updatedProduct] = await db
    .update(products)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();

  return updatedProduct;
}

export async function getProductDetailsForQuickCartById(id: number) {
  const db = getDb();

  const product = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.isActive, true)),
    columns: {
      id: true,
      title: true,
      price: true,
      allergenInfo: true,
    },
    with: {
      addons: {
        where: eq(productAddons.isActive, true),
        orderBy: [asc(productAddons.sortOrder)],
        columns: {
          id: true,
          name: true,
          price: true,
        },
      },
      category: {
        columns: {
          name: true,
        },
      },
      images: {
        columns: {
          url: true,
        },
        orderBy: [asc(productImages.sortOrder)],
        limit: 1,
      },
    },
  });

  return product;
}
