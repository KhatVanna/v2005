"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { useWishlistStore } from "@/stores/wishlist-store";

export function WishlistView() {
  const items = useWishlistStore((state) => state.items);
  const clear = useWishlistStore((state) => state.clear);

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-lg font-medium">Your wishlist is empty</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Save products you love and revisit them anytime.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-lg border border-foreground px-5 py-2.5 text-sm font-semibold uppercase tracking-wide"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {items.length} saved {items.length === 1 ? "item" : "items"}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
