<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->where('is_active', true)
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images']);

        if ($search = trim((string) $request->query('q', $request->query('search', '')))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'ilike', "%{$search}%")
                    ->orWhere('sku', 'ilike', "%{$search}%")
                    ->orWhereHas('brand', fn ($brand) => $brand->where('name', 'ilike', "%{$search}%"));
            });
        }

        if ($category = trim((string) $request->query('category', ''))) {
            $query->whereHas('category', fn ($builder) => $builder->where('slug', $category));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $sort = (string) $request->query('sort', 'latest');

        match ($sort) {
            'price-asc' => $query->orderBy('price')->orderByDesc('id'),
            'price-desc' => $query->orderByDesc('price')->orderByDesc('id'),
            'popular' => $query->orderByDesc('average_rating')->orderByDesc('reviews_count')->orderByDesc('id'),
            'offers' => $query->whereNotNull('compare_at_price')->orderByDesc('id'),
            default => $query->latest('published_at')->latest('id'),
        };

        $perPage = min(max((int) $request->query('per_page', 20), 1), 50);
        $paginator = $query->paginate($perPage);

        return ApiResponse::success([
            'items' => ProductResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 'Products retrieved');
    }

    public function show(string $slug): JsonResponse
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
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images'])
            ->latest('id')
            ->limit(4)
            ->get();

        return ApiResponse::success([
            'product' => new ProductResource($product),
            'related' => ProductResource::collection($related),
        ], 'Product retrieved');
    }
}
