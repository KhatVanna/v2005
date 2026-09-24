"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessNavItem, ADMIN_NAV } from "@/lib/admin-nav";
import { useAuthStore } from "@/stores/auth-store";

type ModulePageProps = {
  href: string;
  title: string;
  description: string;
  bullets: string[];
};

export function AdminModulePage({ href, title, description, bullets }: ModulePageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const item = ADMIN_NAV.find((nav) => nav.href === href);
  const allowed = item ? canAccessNavItem(user, item) : false;

  useEffect(() => {
    if (user && !allowed) {
      router.replace("/dashboard");
    }
  }, [user, allowed, router]);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-white bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <p className="text-sm text-slate-500">You do not have access to this module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-800">{title}</h1>
        <p className="mt-2 max-w-2xl text-slate-500">{description}</p>
      </div>

      <section className="rounded-2xl border border-white bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <h2 className="text-lg font-semibold text-slate-800">What you can manage here</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-500">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5d87ff]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-xl bg-[#f6f9fc] px-4 py-3 text-sm text-slate-500">
          UI shell is ready. Connected CRUD screens will plug into the Laravel API next.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex text-sm font-semibold text-[#5d87ff] hover:underline"
        >
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
