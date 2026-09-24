<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'customers.view');

        $query = $this->customerQuery()
            ->with(['roles:id,name,slug'])
            ->withCount(['orders', 'addresses'])
            ->latest('id');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where(
                'is_active',
                filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN)
            );
        }

        $perPage = min(max((int) $request->query('per_page', 15), 5), 50);
        $paginator = $query->paginate($perPage);

        return ApiResponse::success([
            'items' => CustomerResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 'Customers retrieved');
    }

    public function show(Request $request, User $customer): JsonResponse
    {
        $this->ensurePermission($request->user(), 'customers.view');
        $this->ensureCustomer($customer);

        $customer->load([
            'roles:id,name,slug',
            'addresses',
            'orders' => fn ($query) => $query->latest('id')->limit(20),
        ]);
        $customer->loadCount(['orders', 'addresses']);

        return ApiResponse::success([
            'customer' => new CustomerResource($customer),
        ], 'Customer retrieved');
    }

    public function update(UpdateCustomerRequest $request, User $customer): JsonResponse
    {
        $this->ensurePermission($request->user(), 'customers.update');
        $this->ensureCustomer($customer);

        $customer->update($request->validated());

        $customer->load([
            'roles:id,name,slug',
            'addresses',
            'orders' => fn ($query) => $query->latest('id')->limit(20),
        ]);
        $customer->loadCount(['orders', 'addresses']);

        return ApiResponse::success([
            'customer' => new CustomerResource($customer),
        ], 'Customer updated');
    }

    private function customerQuery(): Builder
    {
        return User::query()->whereHas('roles', fn (Builder $query) => $query->where('slug', 'customer'));
    }

    private function ensureCustomer(User $customer): void
    {
        if (! $customer->hasRole('customer')) {
            abort(404, 'Customer not found.');
        }
    }

    private function ensurePermission(?User $user, string $permission): void
    {
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }
}
