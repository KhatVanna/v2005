"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Users,
  UserCog,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { getNavForUser, primaryRoleLabel, type AdminNavItem } from "@/lib/admin-nav";
import { useAuthStore } from "@/stores/auth-store";

const ICONS = {
  dashboard: LayoutDashboard,
  products: Package,
  orders: ShoppingCart,
  customers: Users,
  reports: BarChart3,
  settings: Settings,
  users: UserCog,
} as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const logout = useAuthStore((state) => state.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f5f9]">
        <p className="text-sm text-muted-foreground">
          {!hydrated ? "Restoring session..." : "Redirecting to sign in..."}
        </p>
      </div>
    );
  }

  const navItems = getNavForUser(user);
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f0f5f9]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[#e5eaf2] bg-white shadow-[0_0_40px_rgba(15,23,42,0.04)] transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo href="/dashboard" height={40} showAdminLabel={false} />
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Home
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => (
            <SidebarLink key={item.href} item={item} active={pathname === item.href} />
          ))}
        </nav>

        <div className="mx-4 mb-5 rounded-2xl bg-gradient-to-br from-[#5d87ff] to-[#4570ea] p-4 text-white shadow-lg shadow-blue-500/20">
          <p className="text-sm font-semibold">V2005 Admin</p>
          <p className="mt-1 text-xs text-blue-100">
            Manage catalog, orders, and customers from one place.
          </p>
          <Link
            href="/products"
            className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#5d87ff]"
          >
            Open catalog
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#e5eaf2] bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <button
            type="button"
            className="rounded-xl border border-[#e5eaf2] bg-white p-2 text-slate-600 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative hidden min-w-0 flex-1 md:block md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search products, orders, customers..."
              className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#5d87ff] focus:bg-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="rounded-xl border border-[#e5eaf2] p-2.5 text-slate-500 transition hover:bg-slate-50"
              aria-label="Theme"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="relative rounded-xl border border-[#e5eaf2] p-2.5 text-slate-500 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#5d87ff]" />
            </button>

            <div className="hidden items-center gap-3 rounded-xl border border-[#e5eaf2] bg-white px-2.5 py-1.5 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5d87ff] text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0 pr-1">
                <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{primaryRoleLabel(user)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void logout().then(() => router.replace("/"))}
              className="rounded-xl bg-[#5d87ff] px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-[#4570ea]"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({ item, active }: { item: AdminNavItem; active: boolean }) {
  const Icon = ICONS[item.icon];

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-[#5d87ff] text-white shadow-md shadow-blue-500/25"
          : "text-slate-600 hover:bg-[#ecf2ff] hover:text-[#5d87ff]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}
