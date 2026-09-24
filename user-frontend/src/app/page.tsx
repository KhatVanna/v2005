import { CategoryGrid } from "@/components/home/category-grid";
import { HeroSlider } from "@/components/home/hero-slider";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { TrustBar } from "@/components/home/trust-bar";
import { VideoBanner } from "@/components/home/video-banner";
import { demoProducts } from "@/data/demo-catalog";

export default function HomePage() {
  const topOffers = demoProducts.filter((product) => product.featured).slice(0, 5);
  const products = demoProducts.slice(0, 50);

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
        />
      </div>
      <ProductSection
        title="Products"
        subtitle={`${demoProducts.length.toLocaleString()} products ready to browse.`}
        products={products}
        href="/products"
        ctaLabel="Our top picks"
      />
      <PromoBanner />
      <VideoBanner />
      <TrustBar />
    </>
  );
}
