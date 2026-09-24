export type OrderAddress = {
  full_name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
};

export type OrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  options?: Record<string, unknown> | null;
};

export type OrderPayment = {
  id: number;
  provider: string;
  method: string | null;
  status: string;
  amount: number;
  currency: string;
  transaction_id: string | null;
  paid_at: string | null;
};

export type AdminOrder = {
  id: number;
  order_number: string;
  user_id: number | null;
  status: string;
  payment_status: string;
  currency: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  grand_total: number;
  customer_email: string | null;
  customer_phone: string | null;
  billing_address: OrderAddress | null;
  shipping_address: OrderAddress | null;
  notes: string | null;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
  } | null;
  items?: OrderItem[];
  payments?: OrderPayment[];
  items_count?: number;
};

export type OrdersListData = {
  items: AdminOrder[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
] as const;
