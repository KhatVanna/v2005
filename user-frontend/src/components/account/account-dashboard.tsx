"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Heart,
  KeyRound,
  Loader2,
  MapPin,
  Package,
  Settings2,
  Trash2,
  UserRound,
} from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { storeApi } from "@/lib/store-api";
import { useFormatMoney } from "@/hooks/use-format-money";
import {
  getRegionLabel,
  REGION_PRESETS,
  useRegionStore,
} from "@/stores/region-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { AuthUser } from "@/types/auth";
import type { CustomerAddress, CustomerOrder } from "@/types/account";

type TabId =
  | "profile"
  | "addresses"
  | "orders"
  | "wishlist"
  | "security"
  | "preferences";

const TABS: Array<{ id: TabId; label: string; icon: typeof UserRound }> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "security", label: "Security", icon: KeyRound },
  { id: "preferences", label: "Preferences", icon: Settings2 },
];

const EMPTY_ADDRESS = {
  label: "Home",
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "KH",
  is_default: true,
};

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

function statusTone(status: string) {
  switch (status) {
    case "delivered":
    case "paid":
      return "bg-emerald-50 text-emerald-700";
    case "confirmed":
    case "processing":
    case "shipped":
      return "bg-blue-50 text-blue-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "cancelled":
    case "failed":
    case "refunded":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function AccountDashboard() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const [tab, setTab] = useState<TabId>("profile");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-navy">
            My Account
          </h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.name}. Manage your profile, orders, and preferences.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-foreground px-4 py-2.5 text-sm font-semibold"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background"
          >
            Log out
          </button>
        </div>
      </div>

      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-sm">
          <nav className="space-y-1">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    setNotice(null);
                    setError(null);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          {tab === "profile" ? (
            <ProfilePanel
              user={user}
              onSaved={(next) => {
                setUser(next);
                setNotice("Profile updated.");
              }}
              onError={setError}
            />
          ) : null}
          {tab === "addresses" ? (
            <AddressesPanel
              onNotice={setNotice}
              onError={setError}
            />
          ) : null}
          {tab === "orders" ? <OrdersPanel onError={setError} /> : null}
          {tab === "wishlist" ? <WishlistPanel /> : null}
          {tab === "security" ? (
            <SecurityPanel
              onNotice={setNotice}
              onError={setError}
            />
          ) : null}
          {tab === "preferences" ? <PreferencesPanel /> : null}
        </section>
      </div>
    </div>
  );
}

function ProfilePanel({
  user,
  onSaved,
  onError,
}: {
  user: AuthUser;
  onSaved: (user: AuthUser) => void;
  onError: (message: string | null) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? "");
  }, [user]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    onError(null);

    const { ok, payload } = await storeApi<{ user: AuthUser }>("/account/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      }),
    });

    setSaving(false);

    if (!payload.success) {
      onError(
        payload.errors?.email?.[0] ??
          payload.errors?.name?.[0] ??
          payload.message ??
          "Unable to update profile."
      );
      return;
    }
    if (!ok) {
      onError("Unable to update profile.");
      return;
    }

    onSaved(payload.data.user);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-navy">Profile details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your name, email, and phone number.
        </p>
      </div>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium">Full name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Phone</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
}

function AddressesPanel({
  onNotice,
  onError,
}: {
  onNotice: (message: string | null) => void;
  onError: (message: string | null) => void;
}) {
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_ADDRESS);

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, payload } = await storeApi<{ items: CustomerAddress[] }>(
      "/account/addresses"
    );
    setLoading(false);
    if (!ok || !payload.success) {
      onError(payload.message || "Unable to load addresses.");
      return;
    }
    setItems(payload.data.items);
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  function startCreate() {
    setEditingId(null);
    setForm({
      ...EMPTY_ADDRESS,
      full_name: user?.name ?? "",
      phone: user?.phone ?? "",
      is_default: items.length === 0,
    });
    setShowForm(true);
  }

  function startEdit(address: CustomerAddress) {
    setEditingId(address.id);
    setForm({
      label: address.label ?? "Home",
      full_name: address.full_name,
      phone: address.phone ?? "",
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state ?? "",
      postal_code: address.postal_code ?? "",
      country: address.country || "KH",
      is_default: address.is_default,
    });
    setShowForm(true);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    onError(null);

    const body = {
      ...form,
      label: form.label.trim() || null,
      phone: form.phone.trim() || null,
      line2: form.line2.trim() || null,
      state: form.state.trim() || null,
      postal_code: form.postal_code.trim() || null,
    };

    const path = editingId
      ? `/account/addresses/${editingId}`
      : "/account/addresses";
    const method = editingId ? "PUT" : "POST";

    const { ok, payload } = await storeApi<{ address: CustomerAddress }>(path, {
      method,
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!ok || !payload.success) {
      onError(payload.message || "Unable to save address.");
      return;
    }

    onNotice(editingId ? "Address updated." : "Address added.");
    setEditingId(null);
    setShowForm(false);
    setForm(EMPTY_ADDRESS);
    await load();
  }

  async function onDelete(address: CustomerAddress) {
    if (!window.confirm(`Delete address “${address.label ?? address.line1}”?`)) {
      return;
    }
    const { ok, payload } = await storeApi<null>(
      `/account/addresses/${address.id}`,
      { method: "DELETE" }
    );
    if (!ok || !payload.success) {
      onError(payload.message || "Unable to delete address.");
      return;
    }
    onNotice("Address deleted.");
    await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-navy">Addresses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage shipping and billing addresses.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Add address
        </button>
      </div>

      {loading ? (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading addresses...
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No addresses yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((address) => (
            <li
              key={address.id}
              className="rounded-xl border border-border bg-muted/30 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold">
                    {address.label ?? "Address"} · {address.full_name}
                    {address.is_default ? (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {[address.city, address.state, address.postal_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="text-muted-foreground">{address.country}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(address)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-xl border border-border bg-muted/20 p-4"
        >
          <h3 className="font-semibold">
            {editingId ? "Edit address" : "New address"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["label", "Label"],
                ["full_name", "Full name"],
                ["phone", "Phone"],
                ["line1", "Address line 1"],
                ["line2", "Address line 2"],
                ["city", "City"],
                ["state", "State / Province"],
                ["postal_code", "Postal code"],
                ["country", "Country code"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block space-y-1.5">
                <span className="text-sm font-medium">{label}</span>
                <input
                  required={["full_name", "line1", "city", "country"].includes(key)}
                  value={form[key]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </label>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  is_default: event.target.checked,
                }))
              }
            />
            Set as default address
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save address
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setShowForm(false);
                setForm(EMPTY_ADDRESS);
              }}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function OrdersPanel({ onError }: { onError: (message: string | null) => void }) {
  const formatMoney = useFormatMoney();
  const [items, setItems] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomerOrder | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const { ok, payload } = await storeApi<{
        items: CustomerOrder[];
      }>("/account/orders");
      setLoading(false);
      if (!ok || !payload.success) {
        onError(payload.message || "Unable to load orders.");
        return;
      }
      setItems(payload.data.items);
    })();
  }, [onError]);

  async function openOrder(order: CustomerOrder) {
    setDetailLoading(true);
    setSelected(order);
    const { ok, payload } = await storeApi<{ order: CustomerOrder }>(
      `/account/orders/${order.id}`
    );
    setDetailLoading(false);
    if (!ok || !payload.success) {
      onError(payload.message || "Unable to load order.");
      return;
    }
    setSelected(payload.data.order);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-navy">Order history</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your past and current orders.
        </p>
      </div>

      {loading ? (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading orders...
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">No orders yet.</p>
          <Link
            href="/products"
            className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold">{order.order_number}</td>
                  <td className="px-4 py-3 text-muted-foreground">
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
                  <td className="px-4 py-3 font-semibold">
                    {formatMoney(order.grand_total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void openOrder(order)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{selected.order_number}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(selected.placed_at ?? selected.created_at)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          {detailLoading ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading details...
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {(selected.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-muted-foreground">
                      Qty {item.quantity}
                      {item.sku ? ` · ${item.sku}` : ""}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {money(item.total_price, selected.currency)}
                  </p>
                </div>
              ))}
              <div className="border-t border-border pt-3 text-sm font-semibold">
                Total: {money(selected.grand_total, selected.currency)}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function WishlistPanel() {
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-navy">Wishlist</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Products you saved for later.
        </p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
          <Link
            href="/products"
            className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-red-600"
                aria-label={`Remove ${product.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SecurityPanel({
  onNotice,
  onError,
}: {
  onNotice: (message: string | null) => void;
  onError: (message: string | null) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    onError(null);

    const { ok, payload } = await storeApi<null>("/account/password", {
      method: "PUT",
      body: JSON.stringify({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

    setSaving(false);

    if (!payload.success) {
      onError(
        payload.errors?.current_password?.[0] ??
          payload.errors?.password?.[0] ??
          payload.message ??
          "Unable to update password."
      );
      return;
    }
    if (!ok) {
      onError("Unable to update password.");
      return;
    }

    setCurrentPassword("");
    setPassword("");
    setPasswordConfirmation("");
    onNotice("Password updated successfully.");
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-navy">Security</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Change your account password.
        </p>
      </div>
      <form className="max-w-md space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Current password</span>
          <input
            required
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">New password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Confirm new password</span>
          <input
            required
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Update password
        </button>
      </form>
    </div>
  );
}

function PreferencesPanel() {
  const regionId = useRegionStore((state) => state.regionId);
  const setRegionId = useRegionStore((state) => state.setRegionId);
  const hydrate = useRegionStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const current = useMemo(
    () => REGION_PRESETS.find((preset) => preset.id === regionId) ?? REGION_PRESETS[0],
    [regionId]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-navy">Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your region currency and language. Current: {getRegionLabel(current)}
        </p>
      </div>
      <div className="grid gap-3">
        {REGION_PRESETS.map((preset) => {
          const selected = preset.id === current.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setRegionId(preset.id)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preset.flagSrc}
                alt=""
                className="h-5 w-7 rounded-sm object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{preset.country}</span>
                <span className="block text-xs text-muted-foreground">
                  {preset.currencySymbol} · {preset.languageLabel} ({preset.language})
                </span>
              </span>
              {selected ? (
                <span className="text-xs font-semibold text-primary">Selected</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
