import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

type StoreShellProps = {
  children: React.ReactNode;
};

export function StoreShell({ children }: StoreShellProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
      <ScrollToTop />
    </>
  );
}
