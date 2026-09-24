"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { getNavForUser } from "@/lib/admin-nav";
import { useAuthStore } from "@/stores/auth-store";

const STAT_CARDS = [
  {
    label: "Products",
    value: "1,248",
    href: "/products",
    icon: Package,
    tone: "bg-[#ecf2ff] text-[#5d87ff]",
  },
  {
    label: "Orders",
    value: "386",
    href: "/orders",
    icon: ShoppingCart,
    tone: "bg-[#fdede8] text-[#fa896b]",
  },
  {
    label: "Revenue",
    value: "$48.2k",
    href: "/reports",
    icon: Wallet,
    tone: "bg-[#e6fffa] text-[#13deb9]",
  },
  {
    label: "Customers",
    value: "2,914",
    href: "/customers",
    icon: Users,
    tone: "bg-[#e8f7ff] text-[#49bfff]",
  },
  {
    label: "Low Stock",
    value: "27",
    href: "/products",
    icon: ShoppingBag,
    tone: "bg-[#fef5e5] text-[#ffae1f]",
  },
  {
    label: "Reports",
    value: "12",
    href: "/reports",
    icon: BarChart3,
    tone: "bg-[#f2ecff] text-[#8b5cf6]",
  },
] as const;

const REVENUE_BARS = [
  { label: "Jan", sales: 42, profit: 28 },
  { label: "Feb", sales: 55, profit: 34 },
  { label: "Mar", sales: 38, profit: 24 },
  { label: "Apr", sales: 68, profit: 40 },
  { label: "May", sales: 50, profit: 32 },
  { label: "Jun", sales: 74, profit: 46 },
  { label: "Jul", sales: 58, profit: 36 },
];

const TRANSACTIONS = [
  {
    time: "09:30",
    title: "Payment received from Alice Nguyen",
    detail: "$385.90",
    tone: "bg-[#13deb9]",
  },
  {
    time: "10:00",
    title: "New order recorded",
    detail: "#V2005-100248",
    tone: "bg-[#5d87ff]",
  },
  {
    time: "12:00",
    title: "Refund processed for Michael",
    detail: "$64.95",
    tone: "bg-[#fa896b]",
  },
  {
    time: "14:20",
    title: "New sale recorded",
    detail: "#V2005-100249",
    tone: "bg-[#5d87ff]",
  },
  {
    time: "16:45",
    title: "Payment completed",
    detail: "$129.00",
    tone: "bg-[#13deb9]",
  },
];

const PRODUCT_ROWS = [
  {
    id: "1",
    sku: "SKU-1001",
    name: "Wireless Noise Cancelling Headphones",
    status: "High",
    statusTone: "bg-[#fdede8] text-[#fa896b]",
    sales: "$12.8K",
  },
  {
    id: "2",
    sku: "SKU-2044",
    name: "Smart Kitchen Scale Pro",
    status: "Medium",
    statusTone: "bg-[#fef5e5] text-[#ffae1f]",
    sales: "$9.3K",
  },
  {
    id: "3",
    sku: "SKU-3110",
    name: "Travel Backpack 30L",
    status: "Low",
    statusTone: "bg-[#e6fffa] text-[#13deb9]",
    sales: "$4.8K",
  },
  {
    id: "4",
    sku: "SKU-4188",
    name: "USB-C Hub Multiport Adapter",
    status: "Critical",
    statusTone: "bg-[#f2ecff] text-[#8b5cf6]",
    sales: "$3.9K",
  },
  {
    id: "5",
    sku: "SKU-5202",
    name: "Kids STEM Robot Kit",
    status: "High",
    statusTone: "bg-[#fdede8] text-[#fa896b]",
    sales: "$7.1K",
  },
];

export function DashboardOverview() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name?.split(" ")[0] ?? "Admin";
  const navHrefs = new Set(getNavForUser(user).map((item) => item.href));
  const visibleStats = STAT_CARDS.filter((stat) => navHrefs.has(stat.href));

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#ecf2ff] via-[#f5f8ff] to-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
              Welcome back! {firstName} 👋
            </h1>
            <p className="mt-2 text-base text-slate-500">
              Check your store reports, orders, and catalog performance.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5d87ff] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20"
              >
                View orders
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center rounded-xl border border-[#d7e3ff] bg-white px-4 py-2.5 text-sm font-semibold text-[#5d87ff]"
              >
                Open reports
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Today
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">$2,480</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#13deb9]">
                <TrendingUp className="h-3.5 w-3.5" />
                +12%
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Orders
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">48</p>
              <p className="mt-1 text-xs text-slate-500">Awaiting fulfillment</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {visibleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={`${stat.label}-${stat.href}`}
              href={stat.href}
              className="rounded-2xl border border-white bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${stat.tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">{stat.value}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] xl:col-span-7">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Revenue Updates</h2>
              <p className="text-sm text-slate-500">Overview of sales vs profit</p>
            </div>
            <select
              className="h-10 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-600 outline-none"
              defaultValue="2026"
            >
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>

          <div className="mb-4 flex items-center gap-5 text-sm">
            <span className="inline-flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#5d87ff]" /> Sales
            </span>
            <span className="inline-flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#49bfff]" /> Profit
            </span>
          </div>

          <div className="flex h-56 items-end gap-3 sm:gap-4">
            {REVENUE_BARS.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-44 w-full items-end justify-center gap-1">
                  <div
                    className="w-2.5 rounded-t-md bg-[#5d87ff] sm:w-3"
                    style={{ height: `${bar.sales}%` }}
                  />
                  <div
                    className="w-2.5 rounded-t-md bg-[#49bfff] sm:w-3"
                    style={{ height: `${bar.profit}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:col-span-5">
          <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-semibold text-slate-800">Yearly Breakup</h2>
            <div className="mt-5 flex items-center gap-6">
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#eef2f7"
                    strokeWidth="4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#5d87ff"
                    strokeWidth="4"
                    strokeDasharray="55 45"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#49bfff"
                    strokeWidth="4"
                    strokeDasharray="25 75"
                    strokeDashoffset="-55"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#ecf2ff"
                    strokeWidth="4"
                    strokeDasharray="20 80"
                    strokeDashoffset="-80"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-semibold text-slate-800">$36,358</p>
                <p className="mt-1 text-sm font-medium text-[#13deb9]">+9% last year</p>
                <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#5d87ff]" /> 2026
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#49bfff]" /> 2025
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ecf2ff]" /> 2024
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white bg-gradient-to-br from-[#5d87ff] to-[#4570ea] p-6 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Monthly Earnings</h2>
                <p className="mt-4 text-3xl font-semibold">$6,820</p>
                <p className="mt-2 text-sm text-blue-100">+9% last month</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] xl:col-span-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
          <p className="mt-1 text-sm text-slate-500">Latest store activity</p>
          <ul className="mt-6 space-y-5">
            {TRANSACTIONS.map((item) => (
              <li key={`${item.time}-${item.title}`} className="flex gap-3">
                <div className="w-12 shrink-0 text-xs font-medium text-slate-400">
                  {item.time}
                </div>
                <div className="flex gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.tone}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] xl:col-span-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Product Performance</h2>
              <p className="text-sm text-slate-500">Top catalog movers this period</p>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#5d87ff]">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#eef2f7] text-slate-400">
                  <th className="px-2 py-3 font-medium">Id</th>
                  <th className="px-2 py-3 font-medium">SKU</th>
                  <th className="px-2 py-3 font-medium">Name</th>
                  <th className="px-2 py-3 font-medium">Priority</th>
                  <th className="px-2 py-3 font-medium">Sales</th>
                </tr>
              </thead>
              <tbody>
                {PRODUCT_ROWS.map((row) => (
                  <tr key={row.id} className="border-b border-[#f5f7fb] last:border-0">
                    <td className="px-2 py-4 text-slate-500">{row.id}</td>
                    <td className="px-2 py-4 font-medium text-slate-700">{row.sku}</td>
                    <td className="px-2 py-4 text-slate-700">{row.name}</td>
                    <td className="px-2 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.statusTone}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2 py-4 font-semibold text-slate-800">{row.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
