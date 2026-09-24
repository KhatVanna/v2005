"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { demoProducts } from "@/data/demo-catalog";
import { useFormatMoney } from "@/hooks/use-format-money";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function ProductDetailPage() {
  const formatMoney = useFormatMoney();
  const params = useParams<{ slug: string }>();
  const product = useMemo(
    () => demoProducts.find((item) => item.slug === params.slug),
    [params.slug]
  );
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const wishlisted = useWishlistStore((state) =>
    product ? state.items.some((item) => item.id === product.id) : false
  );
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");

  if (!product) {
    notFound();
  }

  const related = demoProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : null;

  const galleryImages =
    product.images?.length > 0 ? product.images : [product.image];

  const maxQuantity =
    typeof product.stockLeft === "number" && product.stockLeft > 0
      ? product.stockLeft
      : 999;

  const clampQuantity = (value: number) =>
    Math.min(maxQuantity, Math.max(1, Math.floor(value)));

  const applyQuantity = (value: number) => {
    const next = clampQuantity(value);
    setQuantity(next);
    setQuantityInput(String(next));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <nav className="mb-4 truncate text-xs text-muted-foreground sm:mb-6 sm:text-sm">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mb-4 sm:mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-navy sm:mt-2 sm:text-4xl">
          {product.name}
        </h1>
      </div>

      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <ProductGallery
          images={galleryImages}
          alt={product.name}
          discount={discount}
        />

        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-5">
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-2xl font-bold sm:text-3xl">{formatMoney(product.price)}</span>
              {product.compareAtPrice ? (
                <span className="text-base text-muted-foreground line-through sm:text-lg">
                  {formatMoney(product.compareAtPrice)}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${index < Math.round(product.rating ?? 0) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span>{product.rating?.toFixed(1) ?? "0.0"} rating</span>
            </div>

            {typeof product.stockLeft === "number" ? (
              <p className="mt-3 text-sm text-accent">
                {product.stockLeft > 0
                  ? `In stock — only ${product.stockLeft} left`
                  : "Out of stock"}
              </p>
            ) : null}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium" htmlFor="qty">
                Quantity
              </label>
              <div className="inline-flex items-center rounded-lg border border-border">
                <button
                  type="button"
                  className="px-3 py-2"
                  aria-label="Decrease quantity"
                  onClick={() => applyQuantity(quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  id="qty"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxQuantity}
                  value={quantityInput}
                  onChange={(event) => {
                    const raw = event.target.value;
                    setQuantityInput(raw);
                    const parsed = Number(raw);
                    if (Number.isFinite(parsed) && parsed >= 1) {
                      setQuantity(clampQuantity(parsed));
                    }
                  }}
                  onBlur={() => {
                    const parsed = Number(quantityInput);
                    applyQuantity(Number.isFinite(parsed) ? parsed : quantity);
                  }}
                  className="w-14 border-x border-border bg-transparent py-2 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  className="px-3 py-2"
                  aria-label="Increase quantity"
                  disabled={quantity >= maxQuantity}
                  onClick={() => applyQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => addItem(product, quantity)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-foreground bg-card px-4 py-3 text-sm font-semibold uppercase tracking-wide transition hover:bg-foreground hover:text-background"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>

            <button
              type="button"
              onClick={() => addItem(product, quantity)}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#FFC439] px-4 py-3 text-sm font-semibold text-[#003087] transition hover:brightness-95"
            >
              Buy Now
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-pressed={wishlisted}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition hover:bg-muted ${
                wishlisted
                  ? "font-medium text-error"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
              {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
            </button>

            <p className="mt-4 text-sm font-medium text-foreground">
              Free shipping on qualifying orders
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Shop safely
            </div>
            <p className="text-sm text-muted-foreground">
              Secure your shopping experience with trusted payment methods and easy
              returns on eligible items.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                {
                  label: "KHQR",
                  src: "/images/images_payment_method/KHQR_lcon.webp",
                },
                {
                  label: "ABA PayWay",
                  src: "/images/images_payment_method/ABA_payway_Icon.svg",
                },
              ].map((method) => (
                <span
                  key={method.label}
                  className="inline-flex h-8 items-center rounded border border-border bg-background px-2"
                  title={method.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={method.src}
                    alt={method.label}
                    className="h-5 w-auto object-contain"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12 max-w-3xl space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-navy">{product.name}</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Experience premium quality with the {product.name} from {product.brand}.
            Designed for everyday performance with a clean finish and reliable build —
            a strong pick for customers who want value without compromise.
          </p>
        </div>

        <div className="border-t border-border pt-8">
          <h3 className="text-xl font-semibold text-navy">Highlights</h3>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Trusted brand:</strong> {product.brand}
            </li>
            <li>
              <strong className="text-foreground">Customer rating:</strong>{" "}
              {product.rating?.toFixed(1) ?? "N/A"} / 5
            </li>
            <li>
              <strong className="text-foreground">Fast delivery options</strong> available at
              checkout
            </li>
            <li>
              <strong className="text-foreground">Easy returns</strong> on eligible purchases
            </li>
          </ul>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="mb-6 text-2xl font-semibold text-navy">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
