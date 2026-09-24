"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useAuthStore } from "@/stores/auth-store";
import type {
  AdminProduct,
  CatalogOption,
  CatalogOptionsData,
  ProductFormValues,
  ProductsListData,
} from "@/types/product";

const EMPTY_FORM: ProductFormValues = {
  category_id: "",
  brand_id: "",
  name: "",
  slug: "",
  sku: "",
  short_description: "",
  description: "",
  price: "",
  compare_at_price: "",
  cost_price: "",
  stock_quantity: "0",
  track_inventory: true,
  is_active: true,
  is_featured: false,
  meta_title: "",
  meta_description: "",
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function canManageCatalog(roleSlugs: string[]) {
  return roleSlugs.includes("super-admin") || roleSlugs.includes("admin");
}

function toFormValues(product: AdminProduct): ProductFormValues {
  return {
    category_id: product.category_id?.toString() ?? "",
    brand_id: product.brand_id?.toString() ?? "",
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    price: String(product.price),
    compare_at_price:
      product.compare_at_price !== null ? String(product.compare_at_price) : "",
    cost_price: product.cost_price !== null ? String(product.cost_price) : "",
    stock_quantity: String(product.stock_quantity),
    track_inventory: product.track_inventory,
    is_active: product.is_active,
    is_featured: product.is_featured,
    meta_title: product.meta_title ?? "",
    meta_description: product.meta_description ?? "",
  };
}

function toPayload(form: ProductFormValues) {
  return {
    category_id: form.category_id ? Number(form.category_id) : null,
    brand_id: form.brand_id ? Number(form.brand_id) : null,
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    sku: form.sku.trim(),
    short_description: form.short_description.trim() || null,
    description: form.description.trim() || null,
    price: Number(form.price),
    compare_at_price: form.compare_at_price
      ? Number(form.compare_at_price)
      : null,
    cost_price: form.cost_price ? Number(form.cost_price) : null,
    stock_quantity: Number(form.stock_quantity),
    track_inventory: form.track_inventory,
    is_active: form.is_active,
    is_featured: form.is_featured,
    meta_title: form.meta_title.trim() || null,
    meta_description: form.meta_description.trim() || null,
  };
}

export function ProductsManager() {
  const user = useAuthStore((state) => state.user);
  const roleSlugs = useMemo(
    () => user?.roles?.map((role) => role.slug) ?? [],
    [user]
  );
  const canManage = canManageCatalog(roleSlugs);

  const [items, setItems] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CatalogOption[]>([]);
  const [brands, setBrands] = useState<CatalogOption[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadOptions = useCallback(async () => {
    const { ok, payload } = await adminApi<CatalogOptionsData>(
      "/admin/catalog/options"
    );
    if (ok && payload.success) {
      setCategories(payload.data.categories);
      setBrands(payload.data.brands);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      per_page: "15",
    });
    if (search.trim()) params.set("search", search.trim());
    if (categoryFilter) params.set("category_id", categoryFilter);
    if (statusFilter === "active") params.set("is_active", "1");
    if (statusFilter === "inactive") params.set("is_active", "0");

    const { ok, payload } = await adminApi<ProductsListData>(
      `/admin/products?${params.toString()}`
    );

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to load products.");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(payload.data.items);
    setMeta(payload.data.meta);
    setLoading(false);
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(product: AdminProduct) {
    setEditing(product);
    setForm(toFormValues(product));
    setFormErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setFormErrors({});
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormErrors({});
    setNotice(null);

    const body = toPayload(form);
    const path = editing
      ? `/admin/products/${editing.id}`
      : "/admin/products";
    const method = editing ? "PUT" : "POST";

    const { ok, payload } = await adminApi<{ product: AdminProduct }>(path, {
      method,
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!ok || !payload.success) {
      setFormErrors(payload.errors ?? {});
      setError(payload.message || "Unable to save product.");
      return;
    }

    setNotice(editing ? "Product updated." : "Product created.");
    closeModal();
    await loadProducts();
  }

  async function onDelete(product: AdminProduct) {
    if (
      !window.confirm(
        `Delete “${product.name}”? This soft-deletes the product from the catalog.`
      )
    ) {
      return;
    }

    setDeletingId(product.id);
    setNotice(null);
    const { ok, payload } = await adminApi<null>(`/admin/products/${product.id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to delete product.");
      return;
    }

    setNotice("Product deleted.");
    await loadProducts();
  }

  async function toggleActive(product: AdminProduct) {
    if (!canManage) return;

    const { ok, payload } = await adminApi<{ product: AdminProduct }>(
      `/admin/products/${product.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_active: !product.is_active }),
      }
    );

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to update product status.");
      return;
    }

    setNotice(
      payload.data.product.is_active
        ? "Product published."
        : "Product unpublished."
    );
    await loadProducts();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Products
          </h1>
          <p className="mt-2 text-slate-500">
            Manage the V2005 catalog, inventory levels, pricing, and visibility.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5d87ff] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Add product
          </button>
        ) : null}
      </div>

      <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by name, SKU, or slug..."
              className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] pl-10 pr-3 text-sm outline-none focus:border-[#5d87ff] focus:bg-white"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(event) => {
              setPage(1);
              setCategoryFilter(event.target.value);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-3"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as typeof statusFilter);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-2"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex items-center rounded-xl bg-[#f6f9fc] px-3 text-sm text-slate-500 lg:col-span-2">
            {meta.total.toLocaleString()} products
          </div>
        </div>
      </section>

      {notice ? (
        <div className="rounded-xl border border-[#c9f7ef] bg-[#e6fffa] px-4 py-3 text-sm text-[#0f766e]">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-[#ffd5c8] bg-[#fdede8] px-4 py-3 text-sm text-[#c2410c]">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#eef2f7] text-slate-400">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                {canManage ? (
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canManage ? 8 : 7}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading products...
                    </span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 8 : 7}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                items.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#f5f7fb] last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="min-w-[220px]">
                        <p className="font-semibold text-slate-800">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-400">{product.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {product.sku}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {money(product.price)}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <span
                        className={
                          product.stock_quantity <= 5
                            ? "font-semibold text-[#fa896b]"
                            : ""
                        }
                      >
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {canManage ? (
                        <button
                          type="button"
                          onClick={() => void toggleActive(product)}
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.is_active
                              ? "bg-[#e6fffa] text-[#0f766e]"
                              : "bg-[#f1f5f9] text-slate-500"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </button>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.is_active
                              ? "bg-[#e6fffa] text-[#0f766e]"
                              : "bg-[#f1f5f9] text-slate-500"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {product.is_featured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d87ff]">
                          <Check className="h-3.5 w-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No</span>
                      )}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="rounded-lg border border-[#e5eaf2] p-2 text-slate-600 hover:bg-[#f6f9fc]"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDelete(product)}
                            disabled={deletingId === product.id}
                            className="rounded-lg border border-[#ffd5c8] p-2 text-[#fa896b] hover:bg-[#fdede8] disabled:opacity-50"
                            aria-label={`Delete ${product.name}`}
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#eef2f7] px-4 py-3">
          <p className="text-sm text-slate-500">
            Page {meta.current_page} of {meta.last_page}
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
              disabled={page >= meta.last_page || loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-[#e5eaf2] px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editing ? "Edit product" : "Add product"}
                </h2>
                <p className="text-sm text-slate-500">
                  Fill in catalog details, pricing, and stock.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Name"
                  error={formErrors.name?.[0]}
                >
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="SKU" error={formErrors.sku?.[0]}>
                  <input
                    required
                    value={form.sku}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sku: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Slug" error={formErrors.slug?.[0]}>
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value,
                      }))
                    }
                    placeholder="Auto-generated if empty"
                    className={inputClass}
                  />
                </Field>
                <Field label="Price" error={formErrors.price?.[0]}>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Compare at price"
                  error={formErrors.compare_at_price?.[0]}
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compare_at_price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        compare_at_price: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Cost price" error={formErrors.cost_price?.[0]}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cost_price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        cost_price: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Stock quantity"
                  error={formErrors.stock_quantity?.[0]}
                >
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock_quantity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        stock_quantity: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Category" error={formErrors.category_id?.[0]}>
                  <select
                    value={form.category_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category_id: event.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Brand" error={formErrors.brand_id?.[0]}>
                  <select
                    value={form.brand_id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        brand_id: event.target.value,
                      }))
                    }
                    className={inputClass}
                  >
                    <option value="">No brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                label="Short description"
                error={formErrors.short_description?.[0]}
              >
                <textarea
                  rows={2}
                  value={form.short_description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      short_description: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Description" error={formErrors.description?.[0]}>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Meta title" error={formErrors.meta_title?.[0]}>
                  <input
                    value={form.meta_title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        meta_title: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Meta description"
                  error={formErrors.meta_description?.[0]}
                >
                  <input
                    value={form.meta_description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        meta_description: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="flex flex-wrap gap-4 rounded-xl bg-[#f6f9fc] px-4 py-3">
                <Toggle
                  label="Active"
                  checked={form.is_active}
                  onChange={(checked) =>
                    setForm((current) => ({ ...current, is_active: checked }))
                  }
                />
                <Toggle
                  label="Featured"
                  checked={form.is_featured}
                  onChange={(checked) =>
                    setForm((current) => ({ ...current, is_featured: checked }))
                  }
                />
                <Toggle
                  label="Track inventory"
                  checked={form.track_inventory}
                  onChange={(checked) =>
                    setForm((current) => ({
                      ...current,
                      track_inventory: checked,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#eef2f7] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#e5eaf2] px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5d87ff] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editing ? "Save changes" : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none focus:border-[#5d87ff] focus:bg-white";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? <span className="block text-xs text-[#fa896b]">{error}</span> : null}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#5d87ff]"
      />
      {label}
    </label>
  );
}
