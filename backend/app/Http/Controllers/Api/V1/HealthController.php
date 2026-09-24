<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $database = 'disconnected';

        try {
            DB::connection()->getPdo();
            $database = 'connected';
        } catch (\Throwable) {
            $database = 'disconnected';
        }

        return ApiResponse::success([
            'app' => config('app.name'),
            'version' => 'v1',
            'environment' => config('app.env'),
            'database' => $database,
        ], 'V2005 API is healthy');
    }
}
