"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useAuthStore } from "@/stores/auth-store";
import type { SettingGroup, SettingItem, SettingsData } from "@/types/settings";

function canManageSettings(roleSlugs: string[]) {
  return roleSlugs.includes("super-admin");
}

export function SettingsManager() {
  const user = useAuthStore((state) => state.user);
  const roleSlugs = useMemo(
    () => user?.roles?.map((role) => role.slug) ?? [],
    [user]
  );
  const canManage = canManageSettings(roleSlugs);

  const [groups, setGroups] = useState<SettingGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState("general");
  const [values, setValues] = useState<Record<string, string | number | boolean>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const hydrate = useCallback((payloadGroups: SettingGroup[]) => {
    setGroups(payloadGroups);
    const next: Record<string, string | number | boolean> = {};
    for (const group of payloadGroups) {
      for (const setting of group.settings) {
        next[setting.key] = setting.value;
      }
    }
    setValues(next);
    if (payloadGroups.length > 0) {
      setActiveGroup((current) =>
        payloadGroups.some((group) => group.id === current)
          ? current
          : payloadGroups[0].id
      );
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { ok, payload } = await adminApi<SettingsData>("/admin/settings");

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to load settings.");
      setLoading(false);
      return;
    }

    hydrate(payload.data.groups);
    setLoading(false);
  }, [hydrate]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const currentGroup = groups.find((group) => group.id === activeGroup);

  function updateValue(setting: SettingItem, raw: string | boolean) {
    if (setting.type === "boolean") {
      setValues((current) => ({ ...current, [setting.key]: Boolean(raw) }));
      return;
    }

    if (setting.type === "number") {
      setValues((current) => ({
        ...current,
        [setting.key]: raw === "" ? "" : Number(raw),
      }));
      return;
    }

    setValues((current) => ({ ...current, [setting.key]: String(raw) }));
  }

  async function onSave() {
    if (!canManage) return;

    setSaving(true);
    setNotice(null);
    setError(null);

    const settings = Object.entries(values).map(([key, value]) => ({
      key,
      value: value === "" ? null : value,
    }));

    const { ok, payload } = await adminApi<SettingsData>("/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ settings }),
    });

    setSaving(false);

    if (!ok || !payload.success) {
      setError(payload.message || "Unable to save settings.");
      return;
    }

    hydrate(payload.data.groups);
    setNotice("Settings saved successfully.");
  }

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-white bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="mt-2 text-slate-500">
          Only Super Admin can manage store settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
            Settings
          </h1>
          <p className="mt-2 text-slate-500">
            Configure store profile, checkout, notifications, and system options.
          </p>
        </div>
        <button
          type="button"
          disabled={saving || loading}
          onClick={() => void onSave()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5d87ff] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </button>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Sections
          </p>
          <div className="space-y-1">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setActiveGroup(group.id)}
                className={`flex w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  activeGroup === group.id
                    ? "bg-[#5d87ff] text-white shadow-md shadow-blue-500/20"
                    : "text-slate-600 hover:bg-[#ecf2ff] hover:text-[#5d87ff]"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-white bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading settings...
            </div>
          ) : !currentGroup ? (
            <p className="py-16 text-center text-slate-500">No settings found.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {currentGroup.label}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update values below, then click Save changes.
                </p>
              </div>

              <div className="space-y-5">
                {currentGroup.settings.map((setting) => (
                  <div
                    key={setting.key}
                    className="rounded-xl border border-[#eef2f7] bg-[#f6f9fc] p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800">{setting.label}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {setting.description}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          Key: {setting.key}
                        </p>
                      </div>

                      <div className="w-full sm:max-w-xs">
                        {setting.type === "boolean" ? (
                          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={Boolean(values[setting.key])}
                              onChange={(event) =>
                                updateValue(setting, event.target.checked)
                              }
                              className="h-4 w-4 rounded border-slate-300 text-[#5d87ff]"
                            />
                            Enabled
                          </label>
                        ) : (
                          <input
                            type={setting.type === "number" ? "number" : "text"}
                            step={setting.type === "number" ? "0.01" : undefined}
                            value={
                              values[setting.key] === undefined
                                ? ""
                                : String(values[setting.key])
                            }
                            onChange={(event) =>
                              updateValue(setting, event.target.value)
                            }
                            className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-white px-3 text-sm outline-none focus:border-[#5d87ff]"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
