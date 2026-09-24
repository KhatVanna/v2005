import Image from "next/image";
import Link from "next/link";
import { demoCategories } from "@/data/demo-catalog";

export function CategoryGrid() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Browse
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-navy">Categories</h2>
        </div>
        <Link
          href="/categories"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demoCategories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group relative min-h-48 overflow-hidden rounded-2xl"
          >
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="(max-width: 1024px) 50vw, 33vw"
              className="object-contain p-6 transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <p className="mt-1 text-sm text-white/80">{category.productCount} products</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
