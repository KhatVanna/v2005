export type ReportPeriod = "7d" | "30d" | "90d" | "365d" | "all" | "custom";

export type ReportSort =
  | "revenue"
  | "units"
  | "orders"
  | "stock"
  | "price"
  | "name"
  | "margin";

export type ProductReportRow = {
  id: number;
  name: string;
  sku: string;
  category: string | null;
  brand: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  units_sold: number;
  revenue: number;
  orders_count: number;
  margin: number | null;
};

export type ReportBreakdown = {
  name: string;
  products: number;
  units: number;
  revenue: number;
};

export type ProductReportData = {
  range: {
    period: string;
    from: string | null;
    to: string | null;
  };
  summary: {
    product_count: number;
    active_count: number;
    low_stock_count: number;
    out_of_stock_count: number;
    units_sold: number;
    revenue: number;
    orders_count: number;
    average_order_value: number;
    margin: number | null;
  };
  trend: Array<{
    label: string;
    revenue: number;
    units: number;
  }>;
  categories: ReportBreakdown[];
  brands: ReportBreakdown[];
  items: ProductReportRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
