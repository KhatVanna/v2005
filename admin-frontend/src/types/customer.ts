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

export type CustomerOrderSummary = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: number;
  currency: string;
  placed_at: string | null;
  created_at: string;
};

export type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at?: string;
  orders_count?: number;
  addresses_count?: number;
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  addresses?: CustomerAddress[];
  orders?: CustomerOrderSummary[];
};

export type CustomersListData = {
  items: AdminCustomer[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
