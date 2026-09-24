export type DemoProduct = {
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
};

export type DemoCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
};
