import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSlider } from "@/components/home/hero-slider";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { TrustBar } from "@/components/home/trust-bar";
import { VideoBanner } from "@/components/home/video-banner";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { fetchProducts } from "@/lib/catalog-api";

export default async function HomePage() {
  const [featured, catalog] = await Promise.all([
    fetchProducts({ featured: true, perPage: 5, sort: "latest" }),
    fetchProducts({ perPage: 50, sort: "latest" }),
  ]);

  const topOffers =
    featured.items.length > 0
      ? featured.items
      : catalog.items.filter((product) => product.compareAtPrice).slice(0, 5);

  return (
    <>
      <HeroSlider />
      <CategoryGrid />
      <div className="bg-muted/40">
        <ProductSection
          title="Top offers"
          subtitle="Act fast — while the deal is still valid."
          products={topOffers}
          href="/products?sort=offers"
          ctaLabel="Show more"
          staggerCards
        />
      </div>
      <ProductSection
        title="Products"
        subtitle={`${catalog.total.toLocaleString()} products ready to browse.`}
        products={catalog.items}
        href="/products"
        ctaLabel="Our top picks"
        staggerCards
      />
      <ScrollReveal>
        <PromoBanner />
      </ScrollReveal>
      <ScrollReveal>
        <VideoBanner />
      </ScrollReveal>
      <ScrollReveal>
        <TrustBar />
      </ScrollReveal>
    </>
  );
}
