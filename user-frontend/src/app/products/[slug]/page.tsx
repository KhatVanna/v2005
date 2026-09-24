import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { fetchProductBySlug } from "@/lib/catalog-api";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const result = await fetchProductBySlug(slug);
    if (!result) {
      return { title: "Product not found" };
    }

    return {
      title: result.product.name,
      description: result.product.shortDescription ?? result.product.description,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let result: Awaited<ReturnType<typeof fetchProductBySlug>> = null;

  try {
    result = await fetchProductBySlug(slug);
  } catch {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Product temporarily unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We could not load this product right now. Please refresh in a moment.
        </p>
        <a
          href="/products"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to shop
        </a>
      </div>
    );
  }

  if (!result) {
    notFound();
  }

  return <ProductDetailView product={result.product} related={result.related} />;
}
