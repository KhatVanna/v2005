"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Headphones,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { navLinks } from "@/data/demo-catalog";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );
  const wishlistCount = wishlistItems.length;

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="bg-linear-to-r from-[#0F172A] via-[#1D4ED8] to-[#2563EB] text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-1.5 text-[11px] sm:px-6 sm:py-2 sm:text-sm">
          <p className="min-w-0 flex-1 truncate">
            From everyday essentials to premium upgrades — everything in one place.
          </p>
          <div className="hidden shrink-0 items-center gap-4 md:flex">
            <a href="tel:+10000000000" className="hover:underline">
              Tel: +1 (000) 000-0000
            </a>
            <Link href="/account" className="inline-flex items-center gap-1.5 hover:underline">
              <User className="h-3.5 w-3.5" />
              My Account
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-white/30 px-2.5 py-1"
            >
              USD $ · EN
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3 lg:gap-6">
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="shrink-0 sm:hidden">
            <Logo height={32} />
          </span>
          <span className="hidden shrink-0 sm:inline-flex">
            <Logo height={42} />
          </span>

          <form
            action="/products"
            className="hidden min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-border bg-background md:flex"
            onSubmit={(event) => {
              if (!query.trim()) {
                event.preventDefault();
              }
            }}
          >
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>
            <select
              name="category"
              defaultValue="all"
              className="h-11 max-w-[8.5rem] shrink-0 border-r border-border bg-muted/50 px-3 text-sm text-muted-foreground outline-none"
            >
              <option value="all">All</option>
              <option value="smartphones-accessories">Smartphones</option>
              <option value="kitchen-household">Kitchen</option>
              <option value="toys-gaming">Gaming</option>
              <option value="computers-accessories">Computers</option>
            </select>
            <input
              id="site-search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search our store..."
              className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center bg-primary text-primary-foreground transition hover:opacity-90"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
            <a
              href="tel:+10000000000"
              className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm xl:flex"
            >
              <Headphones className="h-5 w-5 text-primary" />
              <span className="leading-tight">
                <span className="block text-xs text-muted-foreground">Customer Support</span>
                <span className="font-medium">+1 (000) 000-0000</span>
              </span>
            </a>

            <ThemeToggle />

            <Link
              href="/wishlist"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition hover:bg-muted sm:h-10 sm:w-10"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>

            <Link
              href="/account"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-foreground transition hover:bg-muted sm:inline-flex sm:h-10 sm:w-10"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition hover:bg-muted sm:h-10 sm:w-10"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <form
          action="/products"
          className="flex items-center gap-2 border-t border-border px-3 py-2 md:hidden"
        >
          <input
            name="q"
            placeholder="Search products..."
            className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <nav className="hidden bg-linear-to-r from-[#0F172A] to-[#2563EB] lg:block">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center gap-8 px-6 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium uppercase tracking-wide text-white/90 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {mobileOpen ? (
        <div className="fixed inset-0 z-60 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(88vw,20rem)] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <Logo height={36} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
              >
                My Account
              </Link>
            </nav>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
