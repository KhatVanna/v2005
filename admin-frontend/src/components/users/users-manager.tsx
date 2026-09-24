"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { canAccessNavItem, ADMIN_NAV } from "@/lib/admin-nav";
import { useAuthStore } from "@/stores/auth-store";
import type {
  AdminStaffUser,
  StaffRoleOption,
  StaffRoleSlug,
  UserFormValues,
  UserOptionsData,
  UsersListData,
} from "@/types/user";

const EMPTY_FORM: UserFormValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  password_confirmation: "",
  role: "staff",
  is_active: true,
};

const inputClass =
  "h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none focus:border-[#5d87ff] focus:bg-white";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function roleTone(slug: string) {
  switch (slug) {
    case "super-admin":
      return "bg-[#ecf2ff] text-[#5d87ff]";
    case "admin":
      return "bg-[#e6fffa] text-[#0f766e]";
    default:
      return "bg-[#f1f5f9] text-slate-600";
  }
}

function toFormValues(user: AdminStaffUser): UserFormValues {
  const role = user.roles?.find((item) =>
    ["super-admin", "admin", "staff"].includes(item.slug)
  );

  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    password: "",
    password_confirmation: "",
    role: (role?.slug as StaffRoleSlug | undefined) ?? "staff",
    is_active: user.is_active,
  };
}

function toPayload(form: UserFormValues, editing: boolean) {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    role: form.role,
    is_active: form.is_active,
  };

  if (!editing || form.password.trim()) {
    payload.password = form.password;
    payload.password_confirmation = form.password_confirmation;
  }

  return payload;
}

export function UsersManager() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const navItem = ADMIN_NAV.find((item) => item.href === "/users");
  const allowed = navItem ? canAccessNavItem(currentUser, navItem) : false;

  const roleSlugs = useMemo(
    () => currentUser?.roles?.map((role) => role.slug) ?? [],
    [currentUser]
  );
  const canManage = roleSlugs.includes("super-admin");

  const [items, setItems] = useState<AdminStaffUser[]>([]);
  const [roles, setRoles] = useState<StaffRoleOption[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
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

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminStaffUser | null>(null);
  const [form, setForm] = useState<UserFormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser && !allowed) {
      router.replace("/dashboard");
    }
  }, [currentUser, allowed, router]);

  const loadOptions = useCallback(async () => {
    const { ok, payload } = await adminApi<UserOptionsData>("/admin/users/options");
    if (ok && payload.success) {
      setRoles(payload.data.roles);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      per_page: "15",
    });
    if (search.trim()) params.set("search", search.trim());
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter === "active") params.set("is_active", "1");
    if (statusFilter === "inactive") params.set("is_active", "0");

    const { ok, payload } = await adminApi<UsersListData>(
      `/admin/users?${params.toString()}`
    );

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to load users.");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(payload.data.items);
    setMeta(payload.data.meta);
    setLoading(false);
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    if (!allowed) return;
    void loadOptions();
  }, [allowed, loadOptions]);

  useEffect(() => {
    if (!allowed) return;
    void loadUsers();
  }, [allowed, loadUsers]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(user: AdminStaffUser) {
    setEditing(user);
    setForm(toFormValues(user));
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
    setError(null);

    const path = editing ? `/admin/users/${editing.id}` : "/admin/users";
    const method = editing ? "PUT" : "POST";

    const { ok, payload } = await adminApi<{ user: AdminStaffUser }>(path, {
      method,
      body: JSON.stringify(toPayload(form, Boolean(editing))),
    });

    setSaving(false);

    if (!payload.success) {
      setFormErrors(payload.errors ?? {});
      setError(payload.message || "Unable to save user.");
      return;
    }
    if (!ok) {
      setError("Unable to save user.");
      return;
    }

    setNotice(editing ? "User updated." : "User created.");
    closeModal();
    await loadUsers();
  }

  async function onDelete(user: AdminStaffUser) {
    if (user.id === currentUser?.id) return;
    if (
      !window.confirm(
        `Delete “${user.name}”? This removes the staff account from the admin portal.`
      )
    ) {
      return;
    }

    setDeletingId(user.id);
    setNotice(null);
    setError(null);
    const { ok, payload } = await adminApi<null>(`/admin/users/${user.id}`, {
      method: "DELETE",
    });
    setDeletingId(null);

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to delete user.");
      return;
    }

    setNotice("User deleted.");
    await loadUsers();
  }

  async function toggleActive(user: AdminStaffUser) {
    if (!canManage || user.id === currentUser?.id) return;

    setError(null);
    const { ok, payload } = await adminApi<{ user: AdminStaffUser }>(
      `/admin/users/${user.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ is_active: !user.is_active }),
      }
    );

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to update user status.");
      return;
    }

    setNotice(
      payload.data.user.is_active ? "User activated." : "User deactivated."
    );
    await loadUsers();
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-white bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="text-sm text-slate-500">You do not have access to this module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Users & Roles
          </h1>
          <p className="mt-2 text-slate-500">
            Create staff accounts, assign Super Admin, Admin, or Staff roles, and
            review what each role can access.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5d87ff] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            Add user
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
              placeholder="Search by name, email, or phone..."
              className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] pl-10 pr-3 text-sm outline-none focus:border-[#5d87ff] focus:bg-white"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => {
              setPage(1);
              setRoleFilter(event.target.value);
            }}
            className="h-11 rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm text-slate-700 outline-none lg:col-span-3"
          >
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.slug}>
                {role.name}
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
            {meta.total.toLocaleString()} users
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
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                {canManage ? (
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users...
                    </span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="px-4 py-16 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                items.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const primaryRole = user.roles?.[0];

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-[#f5f7fb] last:border-0"
                    >
                      <td className="px-4 py-4">
                        <div className="min-w-[220px]">
                          <p className="font-semibold text-slate-800">
                            {user.name}
                            {isSelf ? (
                              <span className="ml-2 text-xs font-medium text-slate-400">
                                You
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {user.phone || "—"}
                      </td>
                      <td className="px-4 py-4">
                        {primaryRole ? (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleTone(primaryRole.slug)}`}
                          >
                            {primaryRole.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {canManage && !isSelf ? (
                          <button
                            type="button"
                            onClick={() => void toggleActive(user)}
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              user.is_active
                                ? "bg-[#e6fffa] text-[#0f766e]"
                                : "bg-[#f1f5f9] text-slate-500"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </button>
                        ) : (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              user.is_active
                                ? "bg-[#e6fffa] text-[#0f766e]"
                                : "bg-[#f1f5f9] text-slate-500"
                            }`}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(user.created_at)}
                      </td>
                      {canManage ? (
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(user)}
                              className="rounded-lg border border-[#e5eaf2] p-2 text-slate-600 hover:bg-[#f6f9fc]"
                              aria-label={`Edit ${user.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void onDelete(user)}
                              disabled={deletingId === user.id || isSelf}
                              className="rounded-lg border border-[#ffd5c8] p-2 text-[#fa896b] hover:bg-[#fdede8] disabled:opacity-40"
                              aria-label={`Delete ${user.name}`}
                            >
                              {deletingId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
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

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Role permission coverage
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Super Admin has every permission. Admin and Staff keep the access
            listed below.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {roles.map((role) => {
            const groups = role.permissions.reduce<Record<string, string[]>>(
              (accumulator, permission) => {
                const key = permission.group || "general";
                accumulator[key] = accumulator[key] ?? [];
                accumulator[key].push(permission.name);
                return accumulator;
              },
              {}
            );

            return (
              <article
                key={role.id}
                className="rounded-2xl border border-white bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-800">{role.name}</h3>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleTone(role.slug)}`}
                  >
                    {role.permissions.length} permissions
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {role.description || "No description."}
                </p>
                <div className="mt-4 space-y-3">
                  {Object.keys(groups).length === 0 ? (
                    <p className="text-sm text-slate-400">No permissions assigned.</p>
                  ) : (
                    Object.entries(groups).map(([group, names]) => (
                      <div key={group}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {group}
                        </p>
                        <ul className="mt-1 space-y-1">
                          {names.map((name) => (
                            <li key={name} className="text-sm text-slate-600">
                              {name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editing ? "Edit user" : "Add user"}
                </h2>
                <p className="text-sm text-slate-500">
                  Set the account details and staff role.
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
                <Field label="Name" error={formErrors.name?.[0]}>
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
                <Field label="Email" error={formErrors.email?.[0]}>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone" error={formErrors.phone?.[0]}>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Role" error={formErrors.role?.[0]}>
                  <select
                    required
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target.value as StaffRoleSlug,
                      }))
                    }
                    className={inputClass}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.slug}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label={editing ? "New password" : "Password"}
                  error={formErrors.password?.[0]}
                >
                  <input
                    type="password"
                    required={!editing}
                    minLength={editing && !form.password ? undefined : 8}
                    value={form.password}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder={editing ? "Leave blank to keep current" : ""}
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Confirm password"
                  error={formErrors.password_confirmation?.[0]}
                >
                  <input
                    type="password"
                    required={!editing && Boolean(form.password)}
                    value={form.password_confirmation}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password_confirmation: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="flex flex-wrap gap-4 rounded-xl bg-[#f6f9fc] px-4 py-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    disabled={editing?.id === currentUser?.id}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#5d87ff]"
                  />
                  Active
                </label>
                {formErrors.is_active?.[0] ? (
                  <span className="text-xs text-[#fa896b]">
                    {formErrors.is_active[0]}
                  </span>
                ) : null}
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
                  {editing ? "Save changes" : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
