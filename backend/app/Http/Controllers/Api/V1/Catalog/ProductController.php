<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use App\Support\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    private const LIST_TTL = 300;

    private const DETAIL_TTL = 600;

    public function index(Request $request): JsonResponse
    {
        $params = [
            'q' => trim((string) $request->query('q', $request->query('search', ''))),
            'category' => trim((string) $request->query('category', '')),
            'featured' => $request->boolean('featured'),
            'sort' => (string) $request->query('sort', 'latest'),
            'page' => max((int) $request->query('page', 1), 1),
            'per_page' => min(max((int) $request->query('per_page', 20), 1), 50),
        ];

        $payload = Cache::remember(
            CatalogCache::key('products:'.md5(serialize($params))),
            self::LIST_TTL,
            fn () => CatalogCache::serialize($this->listPayload($params))
        );

        return ApiResponse::success($payload, 'Products retrieved');
    }

    public function show(string $slug): JsonResponse
    {
        $payload = Cache::remember(
            CatalogCache::key('product:'.$slug),
            self::DETAIL_TTL,
            fn () => CatalogCache::serialize($this->detailPayload($slug))
        );

        return ApiResponse::success($payload, 'Product retrieved');
    }

    /**
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    private function listPayload(array $params): array
    {
        // Gallery images are only needed on the detail page; skipping them here
        // avoids a large extra round trip to Neon for every listing request.
        $query = Product::query()
            ->where('is_active', true)
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage']);

        if ($params['q'] !== '') {
            $search = $params['q'];

            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'ilike', "%{$search}%")
                    ->orWhere('sku', 'ilike', "%{$search}%")
                    ->orWhereHas('brand', fn ($brand) => $brand->where('name', 'ilike', "%{$search}%"));
            });
        }

        if ($params['category'] !== '') {
            $query->whereHas('category', fn ($builder) => $builder->where('slug', $params['category']));
        }

        if ($params['featured']) {
            $query->where('is_featured', true);
        }

        match ($params['sort']) {
            'price-asc' => $query->orderBy('price')->orderByDesc('id'),
            'price-desc' => $query->orderByDesc('price')->orderByDesc('id'),
            'popular' => $query->orderByDesc('average_rating')->orderByDesc('reviews_count')->orderByDesc('id'),
            'offers' => $query->whereNotNull('compare_at_price')->orderByDesc('id'),
            default => $query->latest('published_at')->latest('id'),
        };

        $paginator = $query->paginate($params['per_page'], ['*'], 'page', $params['page']);

        return [
            'items' => ProductResource::collection($paginator->items())->resolve(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function detailPayload(string $slug): array
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
            ->firstOrFail();

        $related = Product::query()
            ->where('is_active', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage'])
            ->latest('id')
            ->limit(4)
            ->get();

        return [
            'product' => (new ProductResource($product))->resolve(),
            'related' => ProductResource::collection($related)->resolve(),
        ];
    }
}
