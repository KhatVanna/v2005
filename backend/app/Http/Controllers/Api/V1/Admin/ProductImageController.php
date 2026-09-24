<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Services\CloudinaryService;
use App\Support\ApiResponse;
use App\Support\CatalogCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductImageController extends Controller
{
    public function __construct(private readonly CloudinaryService $cloudinary) {}

    public function store(Request $request, Product $product): JsonResponse
    {
        $this->ensurePermission($request->user(), 'products.update');

        $data = $request->validate([
            'path' => ['required', 'string', 'max:2048'],
            'alt_text' => ['nullable', 'string', 'max:255'],
            'is_primary' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $isPrimary = array_key_exists('is_primary', $data)
            ? (bool) $data['is_primary']
            : ! $product->images()->exists();

        $image = DB::transaction(function () use ($product, $data, $isPrimary) {
            if ($isPrimary) {
                $product->images()->update(['is_primary' => false]);
            }

            return $product->images()->create([
                'path' => $data['path'],
                'alt_text' => $data['alt_text'] ?? null,
                'sort_order' => $data['sort_order'] ?? (($product->images()->max('sort_order') ?? -1) + 1),
                'is_primary' => $isPrimary,
            ]);
        });

        $product->load(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images']);

        CatalogCache::bust();

        return ApiResponse::success([
            'image' => [
                'id' => $image->id,
                'path' => $image->path,
                'alt_text' => $image->alt_text,
                'is_primary' => $image->is_primary,
                'sort_order' => $image->sort_order,
            ],
            'product' => new ProductResource($product),
        ], 'Product image attached', 201);
    }

    public function destroy(Request $request, Product $product, ProductImage $image): JsonResponse
    {
        $this->ensurePermission($request->user(), 'products.update');

        if ($image->product_id !== $product->id) {
            abort(404);
        }

        $wasPrimary = $image->is_primary;
        $publicId = $this->cloudinary->extractPublicIdFromUrl($image->path);

        $image->delete();

        if ($wasPrimary) {
            $next = $product->images()->orderBy('sort_order')->orderBy('id')->first();
            if ($next) {
                $next->update(['is_primary' => true]);
            }
        }

        if ($publicId) {
            $this->cloudinary->destroy($publicId);
        }

        $product->load(['category:id,name,slug', 'brand:id,name,slug', 'primaryImage', 'images']);

        CatalogCache::bust();

        return ApiResponse::success([
            'product' => new ProductResource($product),
        ], 'Product image deleted');
    }

    private function ensurePermission(?User $user, string $permission): void
    {
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }
}
