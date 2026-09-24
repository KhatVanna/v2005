"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function LoginForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const hydrate = useAuthStore((state) => state.hydrate);
  const [mode, setMode] = useState<"login" | "register">("login");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  async function onLogin(values: LoginFormValues) {
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
        loginForm.setError("root", { message });
        return;
      }

      setUser(payload.data.user);
      router.refresh();
    } catch {
      loginForm.setError("root", {
        message: "Unable to reach the authentication server.",
      });
    }
  }

  async function onRegister(values: RegisterFormValues) {
    try {
      const response = await fetch("/api/auth/register", {
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
          payload?.errors?.password?.[0] ??
          payload?.message ??
          "Unable to create this account.";
        registerForm.setError("root", { message });
        return;
      }

      setUser(payload.data.user);
      router.refresh();
    } catch {
      registerForm.setError("root", {
        message: "Unable to reach the authentication server.",
      });
    }
  }

  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </div>
    );
  }

  if (user) {
    return <AccountDashboard />;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight text-navy">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Customer accounts only. Staff and admin must use the admin portal.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            mode === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Register
        </button>
      </div>

      {mode === "login" ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={loginForm.handleSubmit(onLogin)}
          noValidate
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email ? (
              <p className="mt-1 text-xs text-error">
                {loginForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password ? (
              <p className="mt-1 text-xs text-error">
                {loginForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          {loginForm.formState.errors.root ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-error dark:bg-red-950/40">
              {loginForm.formState.errors.root.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loginForm.formState.isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loginForm.formState.isSubmitting ? "Signing in..." : "Continue"}
          </button>
        </form>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={registerForm.handleSubmit(onRegister)}
          noValidate
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              {...registerForm.register("name")}
            />
            {registerForm.formState.errors.name ? (
              <p className="mt-1 text-xs text-error">
                {registerForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="register-email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              {...registerForm.register("email")}
            />
            {registerForm.formState.errors.email ? (
              <p className="mt-1 text-xs text-error">
                {registerForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="register-password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              {...registerForm.register("password")}
            />
            {registerForm.formState.errors.password ? (
              <p className="mt-1 text-xs text-error">
                {registerForm.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-1.5 block text-sm font-medium"
            >
              Confirm password
            </label>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              {...registerForm.register("password_confirmation")}
            />
            {registerForm.formState.errors.password_confirmation ? (
              <p className="mt-1 text-xs text-error">
                {registerForm.formState.errors.password_confirmation.message}
              </p>
            ) : null}
          </div>

          {registerForm.formState.errors.root ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-error dark:bg-red-950/40">
              {registerForm.formState.errors.root.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={registerForm.formState.isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {registerForm.formState.isSubmitting ? "Creating account..." : "Create customer account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Demo customer: customer@v2005.test / password
      </p>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        <Link href="/contact" className="underline">
          Need help?
        </Link>
      </p>
    </div>
  );
}
