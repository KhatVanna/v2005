<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => (float) $this->price,
            'compare_at_price' => $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            'cost_price' => $this->cost_price !== null ? (float) $this->cost_price : null,
            'stock_quantity' => (int) $this->stock_quantity,
            'track_inventory' => (bool) $this->track_inventory,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'average_rating' => (float) $this->average_rating,
            'reviews_count' => (int) $this->reviews_count,
            'sales_count' => (int) $this->sales_count,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'published_at' => $this->published_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null),
            'brand' => $this->whenLoaded('brand', fn () => $this->brand ? [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
                'slug' => $this->brand->slug,
            ] : null),
            'primary_image' => $this->whenLoaded('primaryImage', fn () => $this->primaryImage ? [
                'id' => $this->primaryImage->id,
                'path' => $this->primaryImage->path,
                'alt_text' => $this->primaryImage->alt_text,
            ] : null),
            'images' => $this->whenLoaded('images', fn () => $this->images
                ->map(fn ($image) => [
                    'id' => $image->id,
                    'path' => $image->path,
                    'alt_text' => $image->alt_text,
                    'is_primary' => (bool) $image->is_primary,
                    'sort_order' => (int) $image->sort_order,
                ])
                ->values()
                ->all()),
        ];
    }
}
