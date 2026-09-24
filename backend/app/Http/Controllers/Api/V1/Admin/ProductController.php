<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreProductRequest;
use App\Http\Requests\Api\V1\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function options(Request $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'products.view');

        return ApiResponse::success([
            'categories' => Category::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'brands' => Brand::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
        ], 'Catalog options retrieved');
    }

    public function index(Request $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'products.view');

        $query = Product::query()
            ->with(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage'])
            ->latest('id');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'ilike', "%{$search}%")
                    ->orWhere('sku', 'ilike', "%{$search}%")
                    ->orWhere('slug', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->query('category_id'));
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', (int) $request->query('brand_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('is_featured')) {
            $query->where('is_featured', filter_var($request->query('is_featured'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min(max((int) $request->query('per_page', 15), 5), 50);
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

    public function show(Request $request, Product $product): JsonResponse
    {
        $this->ensurePermission($request->user(), 'products.view');

        $product->load(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage']);

        return ApiResponse::success([
            'product' => new ProductResource($product),
        ], 'Product retrieved');
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'products.create');

        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);
        $data['track_inventory'] = $data['track_inventory'] ?? true;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['is_featured'] = $data['is_featured'] ?? false;
        $data['published_at'] = $data['published_at'] ?? now();

        $product = Product::query()->create($data);

        Inventory::query()->create([
            'product_id' => $product->id,
            'quantity' => $product->stock_quantity,
            'reserved_quantity' => 0,
            'low_stock_threshold' => 5,
            'warehouse' => 'main',
        ]);

        $product->load(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage']);

        return ApiResponse::success([
            'product' => new ProductResource($product),
        ], 'Product created', 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->ensurePermission($request->user(), 'products.update');

        $data = $request->validated();

        if (array_key_exists('slug', $data) && filled($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['slug'], $product->id);
        } elseif (array_key_exists('name', $data) && blank($product->slug)) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);

        if (array_key_exists('stock_quantity', $data)) {
            $inventory = $product->inventory()->first();
            if ($inventory) {
                $inventory->update(['quantity' => $product->stock_quantity]);
            } else {
                Inventory::query()->create([
                    'product_id' => $product->id,
                    'quantity' => $product->stock_quantity,
                    'reserved_quantity' => 0,
                    'low_stock_threshold' => 5,
                    'warehouse' => 'main',
                ]);
            }
        }

        $product->load(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage']);

        return ApiResponse::success([
            'product' => new ProductResource($product),
        ], 'Product updated');
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->ensurePermission($request->user(), 'products.delete');

        $product->delete();

        return ApiResponse::success(null, 'Product deleted');
    }

    private function ensurePermission(?User $user, string $permission): void
    {
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'product';
        $slug = $base;
        $counter = 1;

        while (
            Product::query()
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
