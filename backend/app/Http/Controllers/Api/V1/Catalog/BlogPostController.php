<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(48, max(1, (int) $request->integer('per_page', 12)));
        $page = max(1, (int) $request->integer('page', 1));

        $paginator = BlogPost::query()
            ->published()
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))
            ->orderByDesc('published_at')
            ->paginate($perPage, ['*'], 'page', $page);

        $items = collect($paginator->items())->map(fn (BlogPost $post) => $this->summary($post))->values();

        return ApiResponse::success([
            'items' => $items,
            'meta' => [
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
            ],
        ], 'Blog posts retrieved');
    }

    public function show(string $slug): JsonResponse
    {
        $post = BlogPost::query()->published()->where('slug', $slug)->first();

        if (! $post) {
            return ApiResponse::error('Blog post not found', 404);
        }

        $related = BlogPost::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->when($post->category, fn ($q) => $q->where('category', $post->category))
            ->orderByDesc('published_at')
            ->limit(4)
            ->get()
            ->map(fn (BlogPost $item) => $this->summary($item))
            ->values();

        return ApiResponse::success([
            'post' => $this->detail($post),
            'related' => $related,
        ], 'Blog post retrieved');
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(BlogPost $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'cover_image' => $post->cover_image,
            'author_name' => $post->author_name,
            'category' => $post->category,
            'published_at' => optional($post->published_at)?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detail(BlogPost $post): array
    {
        return [
            ...$this->summary($post),
            'body' => $post->body,
            'meta_title' => $post->meta_title,
            'meta_description' => $post->meta_description,
        ];
    }
}
