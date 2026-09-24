import type { ApiResponse } from "@/types/api";
import type { CatalogCategory, CatalogProduct } from "@/data/demo-catalog.types";

type ApiProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  stock_quantity?: number;
  average_rating?: number;
  is_featured?: boolean;
  short_description?: string | null;
  description?: string | null;
  brand?: { name?: string | null } | null;
  category?: { slug?: string | null } | null;
  primary_image?: { path?: string | null } | null;
  images?: Array<{ path?: string | null }> | null;
};

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  product_count?: number;
};

function apiOrigin(): string {
  return (
    process.env.LARAVEL_API_ORIGIN ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ??
    "http://127.0.0.1:8000"
  );
}

async function catalogFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${apiOrigin()}/api/v1${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.success !== true) {
    const message =
      payload.success === false
        ? payload.message
        : `Catalog request failed (${response.status})`;
    throw new Error(message);
  }

  return payload.data;
}

export function mapApiProduct(product: ApiProduct): CatalogProduct {
  const images = (product.images ?? [])
    .map((image) => image.path)
    .filter((path): path is string => Boolean(path));
  const primary =
    product.primary_image?.path ?? images[0] ?? "/images/products/wireless-headphones.png";

  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name ?? "V2005",
    price: Number(product.price),
    compareAtPrice:
      product.compare_at_price != null ? Number(product.compare_at_price) : undefined,
    image: primary,
    images: images.length > 0 ? images : [primary],
    stockLeft: product.stock_quantity,
    rating: product.average_rating != null ? Number(product.average_rating) : undefined,
    category: product.category?.slug ?? "",
    featured: Boolean(product.is_featured),
    shortDescription: product.short_description ?? undefined,
    description: product.description ?? undefined,
  };
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  try {
    const data = await catalogFetch<{ items: ApiCategory[] }>("/catalog/categories");

    return (data.items ?? []).map((category) => ({
      id: String(category.id),
      name: category.name,
      slug: category.slug,
      image: category.image || "/images/products/wireless-headphones.png",
      productCount: Number(category.product_count ?? 0),
    }));
  } catch {
    return [];
  }
}

export async function fetchProducts(params: {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  featured?: boolean;
}): Promise<{ items: CatalogProduct[]; total: number; lastPage: number; page: number }> {
  try {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    if (params.sort) search.set("sort", params.sort);
    if (params.page) search.set("page", String(params.page));
    if (params.perPage) search.set("per_page", String(params.perPage));
    if (params.featured) search.set("featured", "1");

    const query = search.toString();
    const data = await catalogFetch<{
      items: ApiProduct[];
      meta: { total: number; last_page: number; current_page: number };
    }>(`/catalog/products${query ? `?${query}` : ""}`);

    return {
      items: (data.items ?? []).map(mapApiProduct),
      total: data.meta?.total ?? 0,
      lastPage: data.meta?.last_page ?? 1,
      page: data.meta?.current_page ?? 1,
    };
  } catch {
    return { items: [], total: 0, lastPage: 1, page: 1 };
  }
}

export async function fetchProductBySlug(
  slug: string
): Promise<{ product: CatalogProduct; related: CatalogProduct[] } | null> {
  try {
    const data = await catalogFetch<{ product: ApiProduct; related: ApiProduct[] }>(
      `/catalog/products/${encodeURIComponent(slug)}`
    );

    return {
      product: mapApiProduct(data.product),
      related: (data.related ?? []).map(mapApiProduct),
    };
  } catch {
    return null;
  }
}

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Blog & News", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
