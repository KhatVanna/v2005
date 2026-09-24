<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function __construct(private readonly CloudinaryService $cloudinary) {}

    public function cloudinarySignature(Request $request): JsonResponse
    {
        $user = $request->user();
        if (
            ! $user
            || (
                ! $user->hasPermission('products.create')
                && ! $user->hasPermission('products.update')
            )
        ) {
            abort(403, 'You do not have permission to perform this action.');
        }

        try {
            return ApiResponse::success(
                $this->cloudinary->signedUploadParams(),
                'Cloudinary upload signature created'
            );
        } catch (\Throwable $exception) {
            return ApiResponse::error($exception->getMessage(), 500);
        }
    }
}
