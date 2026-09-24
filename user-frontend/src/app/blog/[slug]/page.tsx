import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { fetchBlogPostBySlug } from "@/lib/blog-api";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await fetchBlogPostBySlug(slug);
    if (!data) return { title: "Article" };
    return {
      title: data.post.metaTitle || data.post.title,
      description: data.post.metaDescription || data.post.excerpt,
    };
  } catch {
    return { title: "Article" };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const data = await fetchBlogPostBySlug(slug);

  if (!data) {
    notFound();
  }

  const { post, related } = data;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <ScrollReveal>
        <nav className="mb-4 truncate text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-foreground">
            Blog & News
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{post.title}</span>
        </nav>
      </ScrollReveal>

      <article className="mx-auto max-w-3xl">
        <ScrollReveal delay={40}>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            {post.category ? <span>{post.category}</span> : null}
            {post.publishedAt ? (
              <>
                <span aria-hidden>·</span>
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            ) : null}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">By {post.authorName}</p>
        </ScrollReveal>

        <ScrollReveal delay={90} className="mt-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </ScrollReveal>

        {post.excerpt ? (
          <ScrollReveal delay={120}>
            <p className="mt-8 text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
          </ScrollReveal>
        ) : null}

        <ScrollReveal delay={160}>
          <div
            className="prose prose-slate mt-8 max-w-none text-sm leading-7 text-foreground sm:text-base sm:leading-8 [&_p]:mb-4 [&_strong]:text-navy"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />
        </ScrollReveal>
      </article>

      {related.length > 0 ? (
        <section className="mx-auto mt-16 max-w-5xl">
          <ScrollReveal>
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-navy">
              More articles
            </h2>
          </ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item, index) => (
              <ScrollReveal key={item.id} delay={(index % 4) * 70}>
                <Link
                  href={`/blog/${item.slug}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                  <div className="relative aspect-[16/10] bg-muted">
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="25vw"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold text-navy group-hover:text-primary">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
