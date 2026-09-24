import type { ApiResponse } from "@/types/api";

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage: string;
  authorName: string;
  category?: string;
  publishedAt?: string;
};

export type BlogPostDetail = BlogPostSummary & {
  body: string;
  metaTitle?: string;
  metaDescription?: string;
};

type ApiBlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  cover_image?: string | null;
  author_name?: string | null;
  category?: string | null;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
};

function apiOrigin(): string {
  return (
    process.env.LARAVEL_API_ORIGIN ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ??
    "http://127.0.0.1:8000"
  );
}

async function blogFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${apiOrigin()}/api/v1${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || payload.success !== true) {
    const message =
      payload.success === false
        ? payload.message
        : `Blog request failed (${response.status})`;
    throw new Error(message);
  }

  return payload.data;
}

function mapSummary(post: ApiBlogPost): BlogPostSummary {
  return {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? undefined,
    coverImage: post.cover_image || "/images/blog/blog-shopping.jpg",
    authorName: post.author_name || "V2005 Editorial",
    category: post.category ?? undefined,
    publishedAt: post.published_at ?? undefined,
  };
}

export async function fetchBlogPosts(params?: {
  page?: number;
  perPage?: number;
  category?: string;
}): Promise<{ items: BlogPostSummary[]; total: number; lastPage: number; page: number }> {
  try {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.perPage) search.set("per_page", String(params.perPage));
    if (params?.category) search.set("category", params.category);
    const query = search.toString();

    const data = await blogFetch<{
      items: ApiBlogPost[];
      meta: { total: number; last_page: number; current_page: number };
    }>(`/catalog/blog${query ? `?${query}` : ""}`);

    return {
      items: (data.items ?? []).map(mapSummary),
      total: data.meta?.total ?? 0,
      lastPage: data.meta?.last_page ?? 1,
      page: data.meta?.current_page ?? 1,
    };
  } catch {
    return { items: [], total: 0, lastPage: 1, page: 1 };
  }
}

export async function fetchBlogPostBySlug(
  slug: string
): Promise<{ post: BlogPostDetail; related: BlogPostSummary[] } | null> {
  try {
    const response = await fetch(
      `${apiOrigin()}/api/v1/catalog/blog/${encodeURIComponent(slug)}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      }
    );

    if (response.status === 404) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<{
      post: ApiBlogPost;
      related: ApiBlogPost[];
    }>;

    if (!response.ok || payload.success !== true || !payload.data?.post) {
      throw new Error(
        payload.success === false
          ? payload.message
          : `Blog request failed (${response.status})`
      );
    }

    const post = payload.data.post;

    return {
      post: {
        ...mapSummary(post),
        body: post.body || "",
        metaTitle: post.meta_title ?? undefined,
        metaDescription: post.meta_description ?? undefined,
      },
      related: (payload.data.related ?? []).map(mapSummary),
    };
  } catch (error) {
    console.error(`fetchBlogPostBySlug(${slug}) failed`, error);
    throw error;
  }
}
