"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { type CatalogProduct } from "@/data/demo-catalog.types";
import { useFormatMoney } from "@/hooks/use-format-money";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const formatMoney = useFormatMoney();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const wishlisted = useWishlistStore((state) =>
    state.items.some((item) => item.id === product.id)
  );
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-3 transition duration-500 group-hover:scale-105"
          />
        </Link>

        {discount ? (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
            -{discount}%
          </span>
        ) : null}

        <button
          type="button"
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          aria-pressed={wishlisted}
          onClick={(event) => {
            event.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white ${
            wishlisted ? "text-error" : "text-navy hover:text-error"
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold text-foreground transition hover:text-primary"
        >
          {product.name}
        </Link>

        {typeof product.stockLeft === "number" && product.stockLeft <= 15 ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-accent dark:bg-orange-950/40">
            <span className="h-1.5 w-1.5 rounded-full bg-error" />
            Only {product.stockLeft} left
          </span>
        ) : (
          <span className="h-6" />
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold text-foreground">
            {formatMoney(product.price)}
          </span>
          {product.compareAtPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatMoney(product.compareAtPrice)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => addItem(product)}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-foreground bg-card px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-foreground transition hover:bg-foreground hover:text-background"
        >
          + Cart
        </button>
      </div>
    </article>
  );
}
