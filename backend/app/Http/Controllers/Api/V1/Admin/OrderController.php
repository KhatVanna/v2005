<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'orders.view');

        $query = Order::query()
            ->with(['user:id,name,email,phone'])
            ->withCount('items')
            ->latest('id');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('order_number', 'ilike', "%{$search}%")
                    ->orWhere('customer_email', 'ilike', "%{$search}%")
                    ->orWhere('customer_phone', 'ilike', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery
                            ->where('name', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->query('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', (string) $request->query('payment_status'));
        }

        $perPage = min(max((int) $request->query('per_page', 15), 5), 50);
        $paginator = $query->paginate($perPage);

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
        $this->ensurePermission($request->user(), 'orders.view');

        $order->load([
            'user:id,name,email,phone',
            'items',
            'payments',
        ]);

        return ApiResponse::success([
            'order' => new OrderResource($order),
        ], 'Order retrieved');
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $this->ensurePermission($request->user(), 'orders.update');

        $order->update($request->validated());

        $order->load([
            'user:id,name,email,phone',
            'items',
            'payments',
        ]);
        $order->loadCount('items');

        return ApiResponse::success([
            'order' => new OrderResource($order),
        ], 'Order updated');
    }

    private function ensurePermission(?User $user, string $permission): void
    {
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }
}
