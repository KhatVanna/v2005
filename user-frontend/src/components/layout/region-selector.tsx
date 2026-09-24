"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  getRegionLabel,
  REGION_PRESETS,
  useRegionStore,
} from "@/stores/region-store";

export function RegionSelector({
  className = "",
}: {
  className?: string;
}) {
  const regionId = useRegionStore((state) => state.regionId);
  const hydrated = useRegionStore((state) => state.hydrated);
  const hydrate = useRegionStore((state) => state.hydrate);
  const setRegionId = useRegionStore((state) => state.setRegionId);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    REGION_PRESETS.find((preset) => preset.id === regionId) ?? REGION_PRESETS[0];

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.flagSrc}
          alt={current.country}
          className="h-3.5 w-5 rounded-xs object-cover"
        />
        <span>{hydrated ? getRegionLabel(current) : "Cambodia (USD $, EN)"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Region, currency, and language"
          className="absolute bottom-full right-0 z-50 mb-2 w-72 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/40"
        >
          <div className="border-b border-zinc-800 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Region settings
            </p>
          </div>
          <ul className="max-h-72 overflow-y-auto p-1.5">
            {REGION_PRESETS.map((preset) => {
              const selected = preset.id === current.id;
              return (
                <li key={preset.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setRegionId(preset.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      selected
                        ? "bg-[#5d87ff]/15 text-white"
                        : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.flagSrc}
                      alt=""
                      className="mt-0.5 h-4 w-6 rounded-sm object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {preset.country}
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-400">
                        {preset.currencySymbol} · {preset.languageLabel} (
                        {preset.language})
                      </span>
                    </span>
                    {selected ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5d87ff]" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
