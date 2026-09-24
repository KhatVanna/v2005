<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class CloudinaryService
{
    public function cloudName(): string
    {
        return (string) config('services.cloudinary.cloud_name');
    }

    public function apiKey(): string
    {
        return (string) config('services.cloudinary.api_key');
    }

    public function folder(): string
    {
        return (string) config('services.cloudinary.folder', 'v2005/products');
    }

    /**
     * @return array{cloud_name: string, api_key: string, timestamp: int, folder: string, signature: string, upload_url: string}
     */
    public function signedUploadParams(?string $folder = null): array
    {
        $this->assertConfigured();

        $timestamp = time();
        $folder = $folder ?: $this->folder();

        $params = [
            'folder' => $folder,
            'timestamp' => $timestamp,
        ];

        return [
            'cloud_name' => $this->cloudName(),
            'api_key' => $this->apiKey(),
            'timestamp' => $timestamp,
            'folder' => $folder,
            'signature' => $this->sign($params),
            'upload_url' => sprintf(
                'https://api.cloudinary.com/v1_1/%s/image/upload',
                $this->cloudName()
            ),
        ];
    }

    /**
     * Upload a local image file and return Cloudinary metadata.
     *
     * @return array{secure_url: string, public_id: string}
     */
    public function uploadLocalFile(string $absolutePath, string $publicId, ?string $folder = null): array
    {
        $this->assertConfigured();

        if (! is_file($absolutePath)) {
            throw new RuntimeException("Cloudinary upload source missing: {$absolutePath}");
        }

        $timestamp = time();
        $folder = $folder ?: $this->folder();
        $params = [
            'folder' => $folder,
            'overwrite' => 'true',
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ];

        $response = Http::withOptions(['verify' => (bool) config('services.cloudinary.verify_ssl', true)])
            ->asMultipart()
            ->attach('file', file_get_contents($absolutePath), basename($absolutePath))
            ->post(
                sprintf('https://api.cloudinary.com/v1_1/%s/image/upload', $this->cloudName()),
                [
                    ['name' => 'api_key', 'contents' => $this->apiKey()],
                    ['name' => 'timestamp', 'contents' => (string) $timestamp],
                    ['name' => 'folder', 'contents' => $folder],
                    ['name' => 'public_id', 'contents' => $publicId],
                    ['name' => 'overwrite', 'contents' => 'true'],
                    ['name' => 'signature', 'contents' => $this->sign($params)],
                ]
            );

        if (! $response->successful() || blank($response->json('secure_url'))) {
            throw new RuntimeException(
                'Cloudinary upload failed: '.($response->json('error.message') ?? $response->body())
            );
        }

        return [
            'secure_url' => (string) $response->json('secure_url'),
            'public_id' => (string) $response->json('public_id'),
        ];
    }

    public function destroy(?string $publicId): bool
    {
        if (! filled($publicId)) {
            return false;
        }

        $this->assertConfigured();

        $timestamp = time();
        $params = [
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ];

        $response = Http::asForm()->post(
            sprintf('https://api.cloudinary.com/v1_1/%s/image/destroy', $this->cloudName()),
            [
                ...$params,
                'api_key' => $this->apiKey(),
                'signature' => $this->sign($params),
            ]
        );

        return $response->successful() && ($response->json('result') === 'ok' || $response->json('result') === 'not found');
    }

    public function extractPublicIdFromUrl(string $url): ?string
    {
        if (! str_contains($url, 'res.cloudinary.com')) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (! is_string($path) || $path === '') {
            return null;
        }

        // /<cloud>/image/upload[/transformations]/v123/<public_id>.<ext>
        if (! preg_match('#/upload/(?:.*?/)?(?:v\d+/)?(.+)\.[a-zA-Z0-9]+$#', $path, $matches)) {
            return null;
        }

        return $matches[1];
    }

    /**
     * @param  array<string, scalar>  $params
     */
    private function sign(array $params): string
    {
        ksort($params);

        $toSign = collect($params)
            ->map(fn ($value, $key) => $key.'='.$value)
            ->implode('&');

        return sha1($toSign.(string) config('services.cloudinary.api_secret'));
    }

    private function assertConfigured(): void
    {
        if (
            blank(config('services.cloudinary.cloud_name'))
            || blank(config('services.cloudinary.api_key'))
            || blank(config('services.cloudinary.api_secret'))
        ) {
            throw new RuntimeException('Cloudinary is not configured. Set CLOUDINARY_* in backend/.env.');
        }
    }
}
