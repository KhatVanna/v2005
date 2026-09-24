"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Search, X } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useAuthStore } from "@/stores/auth-store";
import type { AdminCustomer, CustomersListData } from "@/types/customer";

function money(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function canUpdateCustomers(roleSlugs: string[]) {
  return roleSlugs.includes("super-admin") || roleSlugs.includes("admin");
}

function statusTone(status: string) {
  switch (status) {
    case "delivered":
    case "paid":
      return "bg-[#e6fffa] text-[#0f766e]";
    case "confirmed":
    case "processing":
    case "shipped":
      return "bg-[#ecf2ff] text-[#5d87ff]";
    case "pending":
      return "bg-[#fef5e5] text-[#b45309]";
    case "cancelled":
    case "failed":
    case "refunded":
      return "bg-[#fdede8] text-[#c2410c]";
    default:
      return "bg-[#f1f5f9] text-slate-500";
  }
}

export function CustomersManager() {
  const user = useAuthStore((state) => state.user);
  const roleSlugs = useMemo(
    () => user?.roles?.map((role) => role.slug) ?? [],
    [user]
  );
  const canUpdate = canUpdateCustomers(roleSlugs);

  const [items, setItems] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
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

  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      per_page: "15",
    });
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter === "active") params.set("is_active", "1");
    if (statusFilter === "inactive") params.set("is_active", "0");

    const { ok, payload } = await adminApi<CustomersListData>(
      `/admin/customers?${params.toString()}`
    );

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to load customers.");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(payload.data.items);
    setMeta(payload.data.meta);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  async function openDetail(customer: AdminCustomer) {
    setDetailLoading(true);
    setSelected(customer);
    setEditName(customer.name);
    setEditEmail(customer.email);
    setEditPhone(customer.phone ?? "");
    setEditActive(customer.is_active);
    setFormErrors({});

    const { ok, payload } = await adminApi<{ customer: AdminCustomer }>(
      `/admin/customers/${customer.id}`
    );

    setDetailLoading(false);

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to load customer details.");
      return;
    }

    setSelected(payload.data.customer);
    setEditName(payload.data.customer.name);
    setEditEmail(payload.data.customer.email);
    setEditPhone(payload.data.customer.phone ?? "");
    setEditActive(payload.data.customer.is_active);
  }

  function closeDetail() {
    setSelected(null);
    setFormErrors({});
  }

  async function saveCustomer() {
    if (!selected || !canUpdate) return;

    setSaving(true);
    setNotice(null);
    setFormErrors({});

    const { ok, payload } = await adminApi<{ customer: AdminCustomer }>(
      `/admin/customers/${selected.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim() || null,
          is_active: editActive,
        }),
      }
    );

    setSaving(false);

    if (!ok || !payload.success) {
      setFormErrors(payload.errors ?? {});
      setError(payload.message || "Unable to update customer.");
      return;
    }

    setSelected(payload.data.customer);
    setNotice(`Customer ${payload.data.customer.name} updated.`);
    await loadCustomers();
  }

  async function toggleActive(customer: AdminCustomer) {
    if (!canUpdate) return;

    const { ok, payload } = await adminApi<{ customer: AdminCustomer }>(
      `/admin/customers/${customer.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_active: !customer.is_active }),
      }
    );

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to update customer status.");
      return;
    }

    setNotice(
      payload.data.customer.is_active
        ? "Customer activated."
        : "Customer deactivated."
    );
    await loadCustomers();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
          Customers
        </h1>
        <p className="mt-2 text-slate-500">
          View storefront customer accounts, addresses, and order history.
        </p>
      </div>

      <section className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-7">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by name, email, or phone..."
              className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] pl-10 pr-3 text-sm outline-none focus:border-[#5d87ff] focus:bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as typeof statusFilter);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-3"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex items-center rounded-xl bg-[#f6f9fc] px-3 text-sm text-slate-500 lg:col-span-2">
            {meta.total.toLocaleString()} customers
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
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Addresses</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading customers...
                    </span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                items.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-[#f5f7fb] last:border-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800">{customer.name}</p>
                      <p className="text-xs text-slate-400">{customer.email}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {customer.phone ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {customer.orders_count ?? 0}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {customer.addresses_count ?? 0}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      {canUpdate ? (
                        <button
                          type="button"
                          onClick={() => void toggleActive(customer)}
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            customer.is_active
                              ? "bg-[#e6fffa] text-[#0f766e]"
                              : "bg-[#f1f5f9] text-slate-500"
                          }`}
                        >
                          {customer.is_active ? "Active" : "Inactive"}
                        </button>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            customer.is_active
                              ? "bg-[#e6fffa] text-[#0f766e]"
                              : "bg-[#f1f5f9] text-slate-500"
                          }`}
                        >
                          {customer.is_active ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => void openDetail(customer)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5eaf2] px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#f6f9fc]"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </div>
                    </td>
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

      {selected ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {selected.name}
                </h2>
                <p className="text-sm text-slate-500">{selected.email}</p>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 px-5 py-16 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading customer details...
              </div>
            ) : (
              <div className="space-y-6 px-5 py-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard
                    label="Orders"
                    value={String(selected.orders_count ?? selected.orders?.length ?? 0)}
                  />
                  <InfoCard
                    label="Addresses"
                    value={String(
                      selected.addresses_count ?? selected.addresses?.length ?? 0
                    )}
                  />
                  <InfoCard
                    label="Joined"
                    value={formatDate(selected.created_at)}
                  />
                  <InfoCard
                    label="Status"
                    value={selected.is_active ? "Active" : "Inactive"}
                  />
                </div>

                <div className="rounded-xl border border-[#eef2f7] bg-[#f6f9fc] p-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Account details
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Name</span>
                      <input
                        value={editName}
                        disabled={!canUpdate}
                        onChange={(event) => setEditName(event.target.value)}
                        className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-white px-3 text-sm outline-none disabled:opacity-60"
                      />
                      {formErrors.name?.[0] ? (
                        <span className="text-xs text-[#fa896b]">
                          {formErrors.name[0]}
                        </span>
                      ) : null}
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Email</span>
                      <input
                        type="email"
                        value={editEmail}
                        disabled={!canUpdate}
                        onChange={(event) => setEditEmail(event.target.value)}
                        className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-white px-3 text-sm outline-none disabled:opacity-60"
                      />
                      {formErrors.email?.[0] ? (
                        <span className="text-xs text-[#fa896b]">
                          {formErrors.email[0]}
                        </span>
                      ) : null}
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Phone</span>
                      <input
                        value={editPhone}
                        disabled={!canUpdate}
                        onChange={(event) => setEditPhone(event.target.value)}
                        className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-white px-3 text-sm outline-none disabled:opacity-60"
                      />
                    </label>
                    <label className="flex items-center gap-2 pt-7 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={editActive}
                        disabled={!canUpdate}
                        onChange={(event) => setEditActive(event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#5d87ff]"
                      />
                      Active account
                    </label>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#eef2f7]">
                  <div className="border-b border-[#eef2f7] bg-[#f6f9fc] px-4 py-3 text-sm font-semibold text-slate-700">
                    Addresses
                  </div>
                  {(selected.addresses ?? []).length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-slate-500">
                      No addresses on file.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[#f5f7fb]">
                      {selected.addresses?.map((address) => (
                        <li key={address.id} className="px-4 py-3 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-800">
                                {address.label ?? "Address"} · {address.full_name}
                              </p>
                              <p className="mt-1 text-slate-600">
                                {address.line1}
                                {address.line2 ? `, ${address.line2}` : ""}
                              </p>
                              <p className="text-slate-600">
                                {[address.city, address.state, address.postal_code]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                              <p className="text-slate-500">{address.country}</p>
                            </div>
                            {address.is_default ? (
                              <span className="rounded-full bg-[#ecf2ff] px-2.5 py-1 text-xs font-semibold text-[#5d87ff]">
                                Default
                              </span>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-[#eef2f7]">
                  <div className="border-b border-[#eef2f7] bg-[#f6f9fc] px-4 py-3 text-sm font-semibold text-slate-700">
                    Recent orders
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#eef2f7] text-slate-400">
                          <th className="px-4 py-3 font-medium">Order</th>
                          <th className="px-4 py-3 font-medium">Placed</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Payment</th>
                          <th className="px-4 py-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selected.orders ?? []).length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-8 text-center text-slate-500"
                            >
                              No orders yet.
                            </td>
                          </tr>
                        ) : (
                          selected.orders?.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-[#f5f7fb] last:border-0"
                            >
                              <td className="px-4 py-3 font-medium text-slate-700">
                                {order.order_number}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {formatDate(order.placed_at ?? order.created_at)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone(order.status)}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone(order.payment_status)}`}
                                >
                                  {order.payment_status}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {money(order.grand_total, order.currency)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#eef2f7] pt-4">
                  <button
                    type="button"
                    onClick={closeDetail}
                    className="rounded-xl border border-[#e5eaf2] px-4 py-2.5 text-sm font-semibold text-slate-600"
                  >
                    Close
                  </button>
                  {canUpdate ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void saveCustomer()}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#5d87ff] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Save changes
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#eef2f7] bg-[#f6f9fc] px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}
