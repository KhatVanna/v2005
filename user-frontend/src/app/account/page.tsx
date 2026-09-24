import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your V2005 customer account, orders, and addresses.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-10 sm:px-6 sm:py-14">
      <LoginForm />
    </div>
  );
}
