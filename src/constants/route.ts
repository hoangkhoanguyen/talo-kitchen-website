import queryString from "query-string";

export const ADMIN_ROUTE = {
  root: "/admin",
  dashboard: "/admin/dashboard",
  products: "/admin/products",
  product: "/admin/products/[id]",
  productCreate: "/admin/products/create",
  categories: "/admin/categories",
  reservations: "/admin/reservations",
  reservation: "/admin/reservations/[id]",
  orders: "/admin/orders",
  order: "/admin/orders/[id]",
  settings: "/admin/settings/[setting_type]/[key]",
  refreshTokenApi: "/admin/api/auth/refresh-token",
  imagesApi: "/admin/api/images",
  categoriesApi: "/admin/api/categories",
  productsApi: "/admin/api/products",
  allProductApi: "/admin/api/products/all",
  ordersApi: "/admin/api/orders",
  reservationsApi: "/admin/api/reservations",
  login: "/admin/login",
  register: "/admin/register",
} as const;

export const WEB_ROUTE = {
  root: "/",
  home: "/",
  // menu: "/menu",
  menu: "/menu/[category]",
  dish: "/dish/[slug]",
  reservation: "/reservation",
  contact: "/contact",
  cart: "/cart",
  checkout: "/checkout",
  productsByIdsApi: "/api/products/ids",
  productQuickApi: "/api/products/quick/[id]",
} as const;

export const ROUTES = {
  admin: ADMIN_ROUTE,
  web: WEB_ROUTE,
} as const;

type Routes = typeof ROUTES;
type Namespace = keyof Routes;

/** reuseable helper to extract params from template strings */
type ExtractParams<S extends string> =
  S extends `${infer _Start}[${infer P}]${infer Rest}`
    ? P | ExtractParams<Rest>
    : S extends `${infer _Start}:${infer P}/${infer Rest}`
    ? P | ExtractParams<`/${Rest}`>
    : S extends `${infer _Start}:${infer P}`
    ? P
    : never;

type TemplateOf<
  N extends Namespace,
  K extends keyof Routes[N],
> = Routes[N][K] extends string ? Routes[N][K] : never;
type ParamsForRoute<
  N extends Namespace,
  K extends keyof Routes[N],
> = ExtractParams<TemplateOf<N, K>> extends never
  ? never
  : Record<ExtractParams<TemplateOf<N, K>>, string | number>;

const PARAM_REGEX = /\[([^\]]+)\]|:([A-Za-z0-9_]+)/g;

/**
 * Generic generator for any namespace+key.
 * If route requires params, the third argument is required (enforced by types).
 */
export function generateRoute<N extends Namespace, K extends keyof Routes[N]>(
  namespace: N,
  key: K,
  ...args: ParamsForRoute<N, K> extends never
    ? []
    : [params: ParamsForRoute<N, K>]
): string {
  const template = ROUTES[namespace][key] as string;
  const params = (args[0] ?? {}) as Record<string, string | number | undefined>;

  return template.replace(PARAM_REGEX, (_, p1, p2) => {
    const name = (p1 ?? p2) as string;
    const value = params[name];
    if (value === undefined) {
      throw new Error(
        `Missing route param "${name}" for template "${template}"`,
      );
    }
    return encodeURIComponent(String(value));
  });
}

/* Convenience, typed helpers that reuse generateRoute */
export const adminRoutes = {
  root: () => ADMIN_ROUTE.root,
  dashboard: () => ADMIN_ROUTE.dashboard,
  // món ăn
  products: () => ADMIN_ROUTE.products,
  product: (id?: string | number) =>
    typeof id === "undefined"
      ? ADMIN_ROUTE.product
      : generateRoute("admin", "product", { id }),
  productCreate: () => ADMIN_ROUTE.productCreate,
  // danh mục
  categories: () => ADMIN_ROUTE.categories,
  // đặt bàn
  reservations: () => ADMIN_ROUTE.reservations,
  reservation: (id?: string | number) =>
    typeof id === "undefined"
      ? ADMIN_ROUTE.reservations
      : generateRoute("admin", "reservation", { id }),
  // đặt món
  orders: () => ADMIN_ROUTE.orders,
  order: (id?: string | number) =>
    typeof id === "undefined"
      ? ADMIN_ROUTE.order
      : generateRoute("admin", "order", { id }),
  imagesApi: () => ADMIN_ROUTE.imagesApi,
  categoriesApi: (query?: any) =>
    query
      ? `${ADMIN_ROUTE.categoriesApi}?${queryString.stringify(query, {
          arrayFormat: "comma",
          skipEmptyString: true,
          skipNull: true,
        })}`
      : ADMIN_ROUTE.categoriesApi,
  productsApi: (query: any) =>
    `${ADMIN_ROUTE.productsApi}?${queryString.stringify(query, {
      arrayFormat: "comma",
      skipEmptyString: true,
      skipNull: true,
    })}`,
  allProductsApi: () => ADMIN_ROUTE.allProductApi,
  ordersApi: (query: any) =>
    `${ADMIN_ROUTE.ordersApi}?${queryString.stringify(query, {
      arrayFormat: "comma",
      skipEmptyString: true,
      skipNull: true,
    })}`,
  reservationApi: (query: any) =>
    `${ADMIN_ROUTE.reservationsApi}?${queryString.stringify(query, {
      arrayFormat: "comma",
      skipEmptyString: true,
      skipNull: true,
    })}`,
  settings: (setting_type: string, key?: string) =>
    typeof key === "undefined"
      ? generateRoute("admin", "settings", { setting_type, key: "" }).slice(
          0,
          -1,
        )
      : generateRoute("admin", "settings", { key, setting_type }),
  login: () => ADMIN_ROUTE.login,
  register: () => ADMIN_ROUTE.register,
  refreshTokenApi: () => ADMIN_ROUTE.refreshTokenApi,
};

export const webRoutes = {
  root: () => WEB_ROUTE.root,
  home: () => WEB_ROUTE.home,
  menu: (category: string) => generateRoute("web", "menu", { category }),
  dish: (slug: string) => generateRoute("web", "dish", { slug }),
  reservation: () => WEB_ROUTE.reservation,
  contact: () => WEB_ROUTE.contact,
  cart: () => WEB_ROUTE.cart,
  productsByIdsApi: (query: any) =>
    `${WEB_ROUTE.productsByIdsApi}?${queryString.stringify(query, {
      arrayFormat: "comma",
      skipEmptyString: true,
      skipNull: true,
    })}`,
  checkout: () => WEB_ROUTE.checkout,
  productQuickApi: (id: string | number) =>
    generateRoute("web", "productQuickApi", { id }),
};
