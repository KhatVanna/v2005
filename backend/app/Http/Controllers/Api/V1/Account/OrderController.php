<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $paginator = $request->user()
            ->orders()
            ->withCount('items')
            ->latest('id')
            ->paginate(min(max((int) $request->query('per_page', 10), 5), 30));

        return ApiResponse::success([
            'items' => OrderResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 'Orders retrieved');
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if ((int) $order->user_id !== (int) $request->user()->id) {
            abort(404, 'Order not found.');
        }

        $order->load(['items', 'payments']);

        return ApiResponse::success([
            'order' => new OrderResource($order),
        ], 'Order retrieved');
    }
}
