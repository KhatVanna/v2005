<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Versioned cache keys for the public catalog so admin edits publish instantly
 * without needing a tag-aware cache driver.
 */
final class CatalogCache
{
    private const VERSION_KEY = 'catalog:cache-version';

    public static function key(string $suffix): string
    {
        return 'catalog:v'.self::version().':'.$suffix;
    }

    public static function version(): int
    {
        return (int) Cache::rememberForever(self::VERSION_KEY, fn () => 1);
    }

    public static function bust(): void
    {
        Cache::forever(self::VERSION_KEY, self::version() + 1);
    }

    /**
     * Store only JSON-safe arrays (no Carbon / Collection objects).
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public static function serialize(array $payload): array
    {
        return json_decode(json_encode($payload, JSON_THROW_ON_ERROR), true, 512, JSON_THROW_ON_ERROR);
    }
}
