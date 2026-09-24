<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\BlogPost */
class BlogPostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'body' => $this->when(
                $request->routeIs('catalog.blog.show') || $request->boolean('full'),
                $this->body
            ),
            'cover_image' => $this->cover_image,
            'author_name' => $this->author_name,
            'category' => $this->category,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'published_at' => optional($this->published_at)?->toIso8601String(),
        ];
    }
}
