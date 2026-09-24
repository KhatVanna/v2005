import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { CatalogProduct } from "@/data/demo-catalog.types";

type ProductSectionProps = {
  title: string;
  subtitle?: string;
  products: CatalogProduct[];
  href?: string;
  ctaLabel?: string;
  staggerCards?: boolean;
};

export function ProductSection({
  title,
  subtitle,
  products,
  href = "/products",
  ctaLabel = "Show more",
  staggerCards = false,
}: ProductSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <ScrollReveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-navy">{title}</h2>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <Link
            href={href}
            className="rounded-lg border border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-foreground hover:text-background"
          >
            {ctaLabel}
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product, index) => {
          if (!staggerCards) {
            return <ProductCard key={product.id} product={product} />;
          }

          return (
            <ScrollReveal key={product.id} delay={(index % 5) * 70}>
              <ProductCard product={product} />
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
