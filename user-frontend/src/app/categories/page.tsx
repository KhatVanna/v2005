import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchCategories } from "@/lib/catalog-api";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse V2005 product categories.",
};

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Categories</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight text-navy">Categories</h1>
      <p className="mt-2 text-muted-foreground">
        Find the right collection for everyday life and premium upgrades.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-contain p-4 transition duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.productCount} products
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
