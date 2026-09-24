export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  stockLeft?: number;
  rating?: number;
  category: string;
  featured?: boolean;
  shortDescription?: string;
  description?: string;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
};

/** @deprecated Use CatalogProduct */
export type DemoProduct = CatalogProduct;
/** @deprecated Use CatalogCategory */
export type DemoCategory = CatalogCategory;
