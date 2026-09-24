export type CustomerAddress = {
  id: number;
  label: string | null;
  full_name: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
};

export type CustomerOrder = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  currency: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  placed_at: string | null;
  created_at: string;
  items_count?: number;
  items?: Array<{
    id: number;
    product_name: string;
    sku: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  shipping_address?: Record<string, string> | null;
  billing_address?: Record<string, string> | null;
};
