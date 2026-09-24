import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { fetchCategories, fetchProducts } from "@/lib/catalog-api";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse the full V2005 product catalog with filters and sorting.",
};

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.category ?? "";
  const sort = params.sort ?? "latest";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [categories, catalog] = await Promise.all([
    fetchCategories(),
    fetchProducts({
      q: query || undefined,
      category: category || undefined,
      sort,
      page,
      perPage: 20,
    }),
  ]);

  const total = catalog.total;
  const totalPages = Math.max(1, catalog.lastPage);
  const currentPage = Math.min(page, totalPages);
  const pageItems = catalog.items;
  const allCount = categories.reduce((sum, item) => sum + item.productCount, 0);

  const categoryName =
    categories.find((item) => item.slug === category)?.name ?? "All products";

  function buildHref(nextPage: number) {
    const search = new URLSearchParams();
    if (query) search.set("q", params.q ?? "");
    if (category) search.set("category", category);
    if (sort && sort !== "latest") search.set("sort", sort);
    if (nextPage > 1) search.set("page", String(nextPage));
    const value = search.toString();
    return value ? `/products?${value}` : "/products";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Products</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-navy">{categoryName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {total.toLocaleString()} product{total === 1 ? "" : "s"}
            {query ? ` matching “${params.q}”` : ""}
            {" · "}
            Page {currentPage} of {totalPages}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit space-y-6 rounded-2xl border border-border bg-card p-5">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Categories</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className={`text-sm ${!category ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  All ({allCount})
                </Link>
              </li>
              {categories.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/products?category=${item.slug}`}
                    className={`text-sm ${category === item.slug ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {item.name} ({item.productCount})
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Sort</h2>
            <ul className="space-y-2 text-sm">
              <SortLink
                label="Latest"
                href={category ? `/products?category=${category}` : "/products"}
                active={sort === "latest" || !params.sort}
              />
              <SortLink
                label="Popular"
                href={`/products?sort=popular${category ? `&category=${category}` : ""}`}
                active={sort === "popular"}
              />
              <SortLink
                label="Price: Low to High"
                href={`/products?sort=price-asc${category ? `&category=${category}` : ""}`}
                active={sort === "price-asc"}
              />
              <SortLink
                label="Price: High to Low"
                href={`/products?sort=price-desc${category ? `&category=${category}` : ""}`}
                active={sort === "price-desc"}
              />
              <SortLink
                label="Offers"
                href={`/products?sort=offers${category ? `&category=${category}` : ""}`}
                active={sort === "offers"}
              />
            </ul>
          </div>
        </aside>

        <div>
          {pageItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another search or browse all categories.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Browse all
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <PaginationLink
                  href={buildHref(currentPage - 1)}
                  disabled={currentPage <= 1}
                  label="Previous"
                />
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((pageNumber) => {
                    if (totalPages <= 7) return true;
                    return (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(pageNumber - currentPage) <= 2
                    );
                  })
                  .map((pageNumber, index, list) => {
                    const previous = list[index - 1];
                    const showEllipsis = previous && pageNumber - previous > 1;

                    return (
                      <span key={pageNumber} className="contents">
                        {showEllipsis ? (
                          <span className="px-2 text-muted-foreground">…</span>
                        ) : null}
                        <Link
                          href={buildHref(pageNumber)}
                          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium ${
                            pageNumber === currentPage
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {pageNumber}
                        </Link>
                      </span>
                    );
                  })}
                <PaginationLink
                  href={buildHref(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  label="Next"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SortLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={
          active
            ? "font-semibold text-primary"
            : "text-muted-foreground hover:text-foreground"
        }
      >
        {label}
      </Link>
    </li>
  );
}

function PaginationLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm text-muted-foreground opacity-50">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
    >
      {label}
    </Link>
  );
}
