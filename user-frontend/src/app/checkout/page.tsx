import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your V2005 order.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-navy">Checkout</h1>
      <p className="mt-2 text-muted-foreground">
        Full checkout with addresses and payments arrives in Phase 6.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li>1. Customer information</li>
          <li>2. Shipping address</li>
          <li>3. Delivery method</li>
          <li>4. Payment method</li>
          <li>5. Order summary</li>
        </ol>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
