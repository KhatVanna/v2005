<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\ApiResponse;
use App\Support\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    private const TTL = 600;

    public function index(): JsonResponse
    {
        $items = Cache::remember(CatalogCache::key('categories'), self::TTL, function () {
            return CatalogCache::serialize([
                'items' => Category::query()
                    ->where('is_active', true)
                    ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug', 'image', 'description', 'sort_order'])
                    ->map(fn (Category $category) => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'image' => $category->image,
                        'description' => $category->description,
                        'product_count' => (int) $category->products_count,
                    ])
                    ->values()
                    ->all(),
            ])['items'];
        });

        return ApiResponse::success(['items' => $items], 'Categories retrieved');
    }
}
