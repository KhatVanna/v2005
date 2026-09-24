export type StaffRoleSlug = "super-admin" | "admin" | "staff";

export type AdminRole = {
  id: number;
  name: string;
  slug: StaffRoleSlug;
};

export type RolePermission = {
  id: number;
  name: string;
  slug: string;
  group: string | null;
};

export type StaffRoleOption = AdminRole & {
  description: string | null;
  permissions: RolePermission[];
};

export type AdminStaffUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  roles?: AdminRole[];
  created_at: string;
};

export type UserFormValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: StaffRoleSlug | "";
  is_active: boolean;
};

export type UsersListData = {
  items: AdminStaffUser[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type UserOptionsData = {
  roles: StaffRoleOption[];
};
