"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Loader2,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  Wallet,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { canAccessNavItem, ADMIN_NAV } from "@/lib/admin-nav";
import { useAuthStore } from "@/stores/auth-store";
import type { CatalogOptionsData, CatalogOption } from "@/types/product";
import type {
  ProductReportData,
  ProductReportRow,
  ReportPeriod,
  ReportSort,
} from "@/types/report";

const PERIODS: Array<{ value: ReportPeriod; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last 12 months" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDay(value: string | null) {
  if (!value) return "All time";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function csvCell(value: string | number | null) {
  const text = value === null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function ProductReports() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const navItem = ADMIN_NAV.find((item) => item.href === "/reports");
  const allowed = navItem ? canAccessNavItem(user, navItem) : false;

  const [categories, setCategories] = useState<CatalogOption[]>([]);
  const [brands, setBrands] = useState<CatalogOption[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<ReportPeriod>("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [status, setStatus] = useState("all");
  const [sales, setSales] = useState("all");
  const [sort, setSort] = useState<ReportSort>("revenue");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [report, setReport] = useState<ProductReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !allowed) {
      router.replace("/dashboard");
    }
  }, [user, allowed, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadOptions = useCallback(async () => {
    const { ok, payload } = await adminApi<CatalogOptionsData>(
      "/admin/catalog/options"
    );
    if (ok && payload.success) {
      setCategories(payload.data.categories);
      setBrands(payload.data.brands);
    }
  }, []);

  const buildParams = useCallback(
    (pageNumber: number, perPage: number) => {
      const params = new URLSearchParams({
        page: String(pageNumber),
        per_page: String(perPage),
        period,
        status,
        sales,
        sort,
        direction,
      });
      if (query) params.set("search", query);
      if (categoryId) params.set("category_id", categoryId);
      if (brandId) params.set("brand_id", brandId);
      if (period === "custom") {
        if (from) params.set("from", from);
        if (to) params.set("to", to);
      }
      return params;
    },
    [period, status, sales, sort, direction, query, categoryId, brandId, from, to]
  );

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { ok, payload } = await adminApi<ProductReportData>(
      `/admin/reports/products?${buildParams(page, 15).toString()}`
    );

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to load product reports.");
      setLoading(false);
      return;
    }

    setReport(payload.data);
    setLoading(false);
  }, [buildParams, page]);

  useEffect(() => {
    if (!allowed) return;
    void loadOptions();
  }, [allowed, loadOptions]);

  useEffect(() => {
    if (!allowed) return;
    void loadReport();
  }, [allowed, loadReport]);

  const maxRevenue = useMemo(() => {
    const peak = Math.max(...(report?.trend.map((point) => point.revenue) ?? [0]));
    return peak > 0 ? peak : 1;
  }, [report]);

  const maxCategory = useMemo(() => {
    const peak = Math.max(
      ...(report?.categories.map((item) => item.revenue) ?? [0])
    );
    return peak > 0 ? peak : 1;
  }, [report]);

  function changeSort(next: ReportSort) {
    setPage(1);
    if (sort === next) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSort(next);
    setDirection(next === "name" ? "asc" : "desc");
  }

  async function exportCsv() {
    setExporting(true);
    setError(null);

    const rows: ProductReportRow[] = [];
    let current = 1;
    let last = 1;

    try {
      do {
        const { ok, payload } = await adminApi<ProductReportData>(
          `/admin/reports/products?${buildParams(current, 100).toString()}`
        );
        if (!ok || !payload.success) {
          setError(payload.message || "Unable to export the product report.");
          setExporting(false);
          return;
        }
        rows.push(...payload.data.items);
        last = payload.data.meta.last_page;
        current += 1;
      } while (current <= last);

      const header = [
        "Name",
        "SKU",
        "Category",
        "Brand",
        "Price",
        "Cost",
        "Stock",
        "Status",
        "Units sold",
        "Orders",
        "Revenue",
        "Margin",
      ];
      const body = rows.map((row) =>
        [
          row.name,
          row.sku,
          row.category ?? "",
          row.brand ?? "",
          row.price,
          row.cost_price ?? "",
          row.stock_quantity,
          row.is_active ? "Active" : "Inactive",
          row.units_sold,
          row.orders_count,
          row.revenue,
          row.margin ?? "",
        ]
          .map(csvCell)
          .join(",")
      );
      const blob = new Blob([[header.join(","), ...body].join("\n")], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `product-report-${report?.range.from ?? "all"}-to-${report?.range.to ?? "now"}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-white bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="text-sm text-slate-500">You do not have access to this module.</p>
      </div>
    );
  }

  const summary = report?.summary;
  const stats = [
    {
      label: "Product revenue",
      value: summary ? money(summary.revenue) : "—",
      hint: summary ? `${summary.orders_count.toLocaleString()} orders` : "In selected period",
      icon: Wallet,
      tone: "bg-[#e6fffa] text-[#13deb9]",
    },
    {
      label: "Units sold",
      value: summary ? summary.units_sold.toLocaleString() : "—",
      hint: summary ? `${money(summary.average_order_value)} avg order` : "Paid and open orders",
      icon: ShoppingCart,
      tone: "bg-[#ecf2ff] text-[#5d87ff]",
    },
    {
      label: "Gross margin",
      value: summary ? (summary.margin === null ? "—" : money(summary.margin)) : "—",
      hint: summary?.margin === null ? "Set cost prices to calculate" : "Revenue minus unit cost",
      icon: TrendingUp,
      tone: "bg-[#e8f7ff] text-[#49bfff]",
    },
    {
      label: "Active products",
      value: summary ? summary.active_count.toLocaleString() : "—",
      hint: summary ? `${summary.product_count.toLocaleString()} matching filters` : "Catalog",
      icon: Package,
      tone: "bg-[#f2ecff] text-[#8b5cf6]",
    },
    {
      label: "Low stock",
      value: summary ? summary.low_stock_count.toLocaleString() : "—",
      hint: "1–5 units left",
      icon: AlertTriangle,
      tone: "bg-[#fef5e5] text-[#ffae1f]",
    },
    {
      label: "Out of stock",
      value: summary ? summary.out_of_stock_count.toLocaleString() : "—",
      hint: "Tracked inventory at zero",
      icon: Boxes,
      tone: "bg-[#fdede8] text-[#fa896b]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Product reports
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Sales, margin, and stock for the catalog
            {report?.range
              ? report.range.from
                ? ` · ${formatDay(report.range.from)} – ${formatDay(report.range.to)}`
                : " · All time"
              : ""}
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => void exportCsv()}
          disabled={exporting || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5d87ff] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 disabled:opacity-60"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Export CSV
        </button>
      </div>

      <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or SKU..."
              className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] pl-10 pr-3 text-sm outline-none focus:border-[#5d87ff] focus:bg-white"
            />
          </div>
          <select
            value={period}
            onChange={(event) => {
              setPage(1);
              setPeriod(event.target.value as ReportPeriod);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-2"
          >
            {PERIODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(event) => {
              setPage(1);
              setCategoryId(event.target.value);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-2"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={brandId}
            onChange={(event) => {
              setPage(1);
              setBrandId(event.target.value);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-2"
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-2"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="low_stock">Low stock</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
          {period === "custom" ? (
            <>
              <input
                type="date"
                value={from}
                onChange={(event) => {
                  setPage(1);
                  setFrom(event.target.value);
                }}
                className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-2"
              />
              <input
                type="date"
                value={to}
                onChange={(event) => {
                  setPage(1);
                  setTo(event.target.value);
                }}
                className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-2"
              />
            </>
          ) : null}
          <select
            value={sales}
            onChange={(event) => {
              setPage(1);
              setSales(event.target.value);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-3"
          >
            <option value="all">All products</option>
            <option value="with">With sales in period</option>
            <option value="without">No sales in period</option>
          </select>
          <div className="flex items-center rounded-xl bg-[#f6f9fc] px-3 text-sm text-slate-500 lg:col-span-3">
            {(report?.meta.total ?? 0).toLocaleString()} products
            {loading ? " · updating..." : ""}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-[#ffd5c8] bg-[#fdede8] px-4 py-3 text-sm text-[#c2410c]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-white bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${stat.tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] xl:col-span-7">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Sales trend</h2>
            <p className="text-sm text-slate-500">Product revenue in the selected period</p>
          </div>
          {report && report.trend.length > 0 ? (
            <div className="overflow-x-auto">
              <div
                className="flex h-56 min-w-full items-end gap-2"
                style={{ minWidth: `${Math.max(report.trend.length * 28, 320)}px` }}
              >
                {report.trend.map((point, index) => (
                  <div
                    key={`${point.label}-${index}`}
                    className="flex min-w-6 flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex h-44 w-full items-end justify-center">
                      <div
                        title={`${point.label}: ${money(point.revenue)} · ${point.units} units`}
                        className="w-3 rounded-t-md bg-[#5d87ff]"
                        style={{
                          height: `${Math.max((point.revenue / maxRevenue) * 100, point.revenue > 0 ? 6 : 0)}%`,
                        }}
                      />
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-slate-400">
                      {point.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">
              {loading ? "Loading sales trend..." : "No product sales in this period."}
            </p>
          )}
        </div>

        <div className="grid gap-6 xl:col-span-5">
          <BreakdownCard
            title="Categories"
            rows={report?.categories ?? []}
            maxRevenue={maxCategory}
            loading={loading}
          />
          <BreakdownCard
            title="Brands"
            rows={report?.brands ?? []}
            maxRevenue={Math.max(...(report?.brands.map((item) => item.revenue) ?? [0]), 1)}
            loading={loading}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#eef2f7] text-slate-400">
                <SortHeader label="Product" column="name" sort={sort} direction={direction} onSort={changeSort} />
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <SortHeader label="Price" column="price" sort={sort} direction={direction} onSort={changeSort} />
                <SortHeader label="Stock" column="stock" sort={sort} direction={direction} onSort={changeSort} />
                <SortHeader label="Units" column="units" sort={sort} direction={direction} onSort={changeSort} />
                <SortHeader label="Orders" column="orders" sort={sort} direction={direction} onSort={changeSort} />
                <SortHeader label="Revenue" column="revenue" sort={sort} direction={direction} onSort={changeSort} />
                <SortHeader label="Margin" column="margin" sort={sort} direction={direction} onSort={changeSort} />
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && !report ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading product report...
                    </span>
                  </td>
                </tr>
              ) : (report?.items.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-slate-500">
                    No products match these filters.
                  </td>
                </tr>
              ) : (
                report?.items.map((product) => (
                  <tr key={product.id} className="border-b border-[#f5f7fb] last:border-0">
                    <td className="px-4 py-4">
                      <p className="min-w-45 font-semibold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.brand ?? "No brand"}</p>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">{product.sku}</td>
                    <td className="px-4 py-4 text-slate-600">{product.category ?? "—"}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{money(product.price)}</td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          product.stock_quantity <= 0
                            ? "font-semibold text-[#fa896b]"
                            : product.stock_quantity <= 5
                              ? "font-semibold text-[#ffae1f]"
                              : "text-slate-700"
                        }
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{product.units_sold.toLocaleString()}</td>
                    <td className="px-4 py-4 text-slate-700">{product.orders_count.toLocaleString()}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">{money(product.revenue)}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {product.margin === null ? "—" : money(product.margin)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          product.is_active
                            ? "bg-[#e6fffa] text-[#0f766e]"
                            : "bg-[#f1f5f9] text-slate-500"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#eef2f7] px-4 py-3">
          <p className="text-sm text-slate-500">
            Page {report?.meta.current_page ?? 1} of {report?.meta.last_page ?? 1}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-[#e5eaf2] px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= (report?.meta.last_page ?? 1) || loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-[#e5eaf2] px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
  maxRevenue,
  loading,
}: {
  title: string;
  rows: ProductReportData["categories"];
  maxRevenue: number;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="py-6 text-sm text-slate-500">
            {loading ? "Loading..." : `No ${title.toLowerCase()} to show.`}
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.name}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-700">{row.name}</span>
                <span className="shrink-0 text-slate-500">{money(row.revenue)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#f6f9fc]">
                <div
                  className="h-full rounded-full bg-[#5d87ff]"
                  style={{ width: `${Math.max((row.revenue / maxRevenue) * 100, row.revenue > 0 ? 4 : 0)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {row.units.toLocaleString()} units · {row.products.toLocaleString()} products
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SortHeader({
  label,
  column,
  sort,
  direction,
  onSort,
}: {
  label: string;
  column: ReportSort;
  sort: ReportSort;
  direction: "asc" | "desc";
  onSort: (column: ReportSort) => void;
}) {
  const active = sort === column;
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 ${active ? "text-[#5d87ff]" : "text-slate-400"}`}
      >
        {label}
        <span className="text-[10px]">{active ? (direction === "asc" ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );
}
