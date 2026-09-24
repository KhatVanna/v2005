import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog & News",
  description: "Technology insights and updates from V2005.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Blog & News</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight text-navy">Blog & News</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Tech insights and product guides — knowledge that moves you forward.
      </p>
      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-lg font-medium">Articles coming soon</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This section will connect to the CMS/content API in a later phase.
        </p>
      </div>
    </div>
  );
}
