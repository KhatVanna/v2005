import { AuthHydrator } from "@/components/auth/auth-hydrator";
import { AdminLoginPage } from "@/components/auth/admin-login-page";

export default function AdminHomePage() {
  return (
    <AuthHydrator>
      <AdminLoginPage />
    </AuthHydrator>
  );
}
