import { AuthHydrator } from "@/components/auth/auth-hydrator";
import { AdminShell } from "@/components/layout/admin-shell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthHydrator>
      <AdminShell>{children}</AdminShell>
    </AuthHydrator>
  );
}
