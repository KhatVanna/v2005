"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AdminLoginPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        const message =
          payload?.errors?.email?.[0] ??
          payload?.message ??
          "Unable to sign in with these credentials.";
        setError("root", { message });
        return;
      }

      setUser(payload.data.user);
      router.replace("/dashboard");
    } catch {
      setError("root", { message: "Unable to reach the authentication server." });
    }
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f5f9]">
      <header className="border-b border-[#e5eaf2] bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo height={44} />
          <span className="text-sm text-slate-400">Staff access only</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <section className="mx-auto w-full max-w-md rounded-2xl border border-white bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-500">
            Super Admin, Admin, and Staff only. Customer accounts cannot sign in here.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm outline-none focus:border-[#5d87ff] focus:bg-white"
                {...register("email")}
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-[#fa896b]">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-11 w-full rounded-xl border border-[#e5eaf2] bg-[#f6f9fc] px-3 text-sm outline-none focus:border-[#5d87ff] focus:bg-white"
                {...register("password")}
              />
              {errors.password ? (
                <p className="mt-1 text-xs text-[#fa896b]">{errors.password.message}</p>
              ) : null}
            </div>

            {errors.root ? (
              <p className="rounded-xl bg-[#fdede8] px-3 py-2 text-sm text-[#fa896b]">
                {errors.root.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#5d87ff] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 space-y-1 text-center text-xs text-slate-400">
            <p>admin@v2005.test / password</p>
            <p>manager@v2005.test / password</p>
            <p>staff@v2005.test / password</p>
          </div>
        </section>
      </main>
    </div>
  );
}
