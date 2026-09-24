import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { fetchProductBySlug } from "@/lib/catalog-api";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchProductBySlug(slug);

  if (!result) {
    return { title: "Product not found" };
  }

  return {
    title: result.product.name,
    description: result.product.shortDescription ?? result.product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const result = await fetchProductBySlug(slug);

  if (!result) {
    notFound();
  }

  return <ProductDetailView product={result.product} related={result.related} />;
}
