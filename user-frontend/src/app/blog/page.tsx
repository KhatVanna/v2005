import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { fetchBlogPosts } from "@/lib/blog-api";

export const metadata: Metadata = {
  title: "Blog & News",
  description: "Technology insights and product guides from V2005.",
};

type BlogPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const catalog = await fetchBlogPosts({ page, perPage: 12 });
  const currentPage = Math.min(page, catalog.lastPage);

  function buildHref(nextPage: number) {
    return nextPage > 1 ? `/blog?page=${nextPage}` : "/blog";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <ScrollReveal>
        <nav className="mb-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Blog & News</span>
        </nav>
      </ScrollReveal>

      <ScrollReveal delay={40}>
        <h1 className="text-3xl font-semibold tracking-tight text-navy">Blog & News</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Tech insights and product guides — knowledge that moves you forward.
          {catalog.total > 0
            ? ` ${catalog.total.toLocaleString()} articles · Page ${currentPage} of ${catalog.lastPage}`
            : ""}
        </p>
      </ScrollReveal>

      {catalog.items.length === 0 ? (
        <ScrollReveal delay={90} className="mt-10">
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="text-lg font-medium">Articles coming soon</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Blog posts will appear here after seeding the catalog API.
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.items.map((post, index) => (
              <ScrollReveal key={post.id} delay={(index % 3) * 80}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      {post.category ? <span>{post.category}</span> : null}
                      {post.publishedAt ? (
                        <>
                          <span aria-hidden>·</span>
                          <time dateTime={post.publishedAt}>
                            {new Date(post.publishedAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </time>
                        </>
                      ) : null}
                    </div>
                    <h2 className="mt-2 text-lg font-semibold leading-snug text-navy group-hover:text-primary">
                      {post.title}
                    </h2>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <p className="mt-auto pt-4 text-xs text-muted-foreground">
                      By {post.authorName}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          {catalog.lastPage > 1 ? (
            <ScrollReveal className="mt-10">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {currentPage > 1 ? (
                  <Link
                    href={buildHref(currentPage - 1)}
                    className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm text-muted-foreground opacity-50">
                    Previous
                  </span>
                )}
                <span className="px-3 text-sm text-muted-foreground">
                  Page {currentPage} / {catalog.lastPage}
                </span>
                {currentPage < catalog.lastPage ? (
                  <Link
                    href={buildHref(currentPage + 1)}
                    className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm text-muted-foreground opacity-50">
                    Next
                  </span>
                )}
              </div>
            </ScrollReveal>
          ) : null}
        </>
      )}
    </div>
  );
}
