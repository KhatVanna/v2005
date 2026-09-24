import type { AuthUser } from "@/types/auth";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "products" | "orders" | "customers" | "reports" | "settings" | "users";
  roles: Array<"super-admin" | "admin" | "staff">;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    roles: ["super-admin", "admin", "staff"],
  },
  {
    href: "/products",
    label: "Products",
    icon: "products",
    roles: ["super-admin", "admin", "staff"],
  },
  {
    href: "/orders",
    label: "Orders",
    icon: "orders",
    roles: ["super-admin", "admin", "staff"],
  },
  {
    href: "/customers",
    label: "Customers",
    icon: "customers",
    roles: ["super-admin", "admin", "staff"],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: "reports",
    roles: ["super-admin", "admin"],
  },
  {
    href: "/users",
    label: "Users & Roles",
    icon: "users",
    roles: ["super-admin"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: "settings",
    roles: ["super-admin"],
  },
];

export function userRoleSlugs(user: AuthUser | null | undefined) {
  return new Set(user?.roles?.map((role) => role.slug) ?? []);
}

export function canAccessNavItem(user: AuthUser | null | undefined, item: AdminNavItem) {
  const roles = userRoleSlugs(user);
  return item.roles.some((role) => roles.has(role));
}

export function getNavForUser(user: AuthUser | null | undefined) {
  return ADMIN_NAV.filter((item) => canAccessNavItem(user, item));
}

export function primaryRoleLabel(user: AuthUser | null | undefined) {
  return user?.roles?.map((role) => role.name).join(", ") || "Staff";
}
