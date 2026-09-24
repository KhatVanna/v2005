"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Minus, Plus, Trash2, X } from "lucide-react";
import { useFormatMoney } from "@/hooks/use-format-money";
import { useCartStore } from "@/stores/cart-store";

function CartItemQuantity({
  productId,
  quantity,
  maxQuantity,
}: {
  productId: string;
  quantity: number;
  maxQuantity: number;
}) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const [quantityInput, setQuantityInput] = useState(String(quantity));

  useEffect(() => {
    setQuantityInput(String(quantity));
  }, [quantity]);

  const clampQuantity = (value: number) =>
    Math.min(maxQuantity, Math.max(1, Math.floor(value)));

  const applyQuantity = (value: number) => {
    const next = clampQuantity(value);
    updateQuantity(productId, next);
    setQuantityInput(String(next));
  };

  return (
    <div className="inline-flex items-center rounded-md border border-border">
      <button
        type="button"
        className="px-2 py-1"
        aria-label="Decrease quantity"
        onClick={() => updateQuantity(productId, quantity - 1)}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={maxQuantity}
        aria-label="Quantity"
        value={quantityInput}
        onChange={(event) => {
          const raw = event.target.value;
          setQuantityInput(raw);
          const parsed = Number(raw);
          if (Number.isFinite(parsed) && parsed >= 1) {
            updateQuantity(productId, clampQuantity(parsed));
          }
        }}
        onBlur={() => {
          const parsed = Number(quantityInput);
          applyQuantity(Number.isFinite(parsed) ? parsed : quantity);
        }}
        className="w-10 border-x border-border bg-transparent py-1 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        className="px-2 py-1"
        aria-label="Increase quantity"
        disabled={quantity >= maxQuantity}
        onClick={() => applyQuantity(quantity + 1)}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function CartDrawer() {
  const formatMoney = useFormatMoney();
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close cart overlay"
        onClick={closeCart}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-muted-foreground">Your cart is empty :(</p>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-lg border border-foreground px-5 py-2.5 text-sm font-semibold uppercase tracking-wide"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.product.id} className="flex gap-3 border-b border-border pb-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatMoney(item.product.price)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <CartItemQuantity
                        productId={item.product.id}
                        quantity={item.quantity}
                        maxQuantity={
                          typeof item.product.stockLeft === "number" &&
                          item.product.stockLeft > 0
                            ? item.product.stockLeft
                            : 999
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="ml-auto text-muted-foreground hover:text-error"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="border-t border-border px-5 py-5">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated total</span>
              <span className="text-lg font-bold">{formatMoney(subtotal)}</span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Tax included. Shipping and discounts calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold uppercase tracking-wide text-background"
            >
              <Lock className="h-4 w-4" />
              Checkout
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
