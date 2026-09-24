<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreUserRequest;
use App\Http\Requests\Api\V1\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /** @var list<string> */
    private const STAFF_ROLES = ['super-admin', 'admin', 'staff'];

    public function options(Request $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'users.view');

        $roles = Role::query()
            ->with(['permissions:id,name,slug,group'])
            ->whereIn('slug', self::STAFF_ROLES)
            ->orderByRaw("CASE slug WHEN 'super-admin' THEN 1 WHEN 'admin' THEN 2 WHEN 'staff' THEN 3 ELSE 4 END")
            ->get();

        return ApiResponse::success([
            'roles' => $roles->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
                'description' => $role->description,
                'permissions' => $role->permissions
                    ->sortBy(['group', 'name'])
                    ->values()
                    ->map(fn ($permission) => [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'slug' => $permission->slug,
                        'group' => $permission->group,
                    ]),
            ])->values(),
        ], 'User options retrieved');
    }

    public function index(Request $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'users.view');

        $query = $this->staffQuery()
            ->with(['roles:id,name,slug'])
            ->latest('id');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function (Builder $builder) use ($search) {
                $builder
                    ->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        if ($role = trim((string) $request->query('role', ''))) {
            if (in_array($role, self::STAFF_ROLES, true)) {
                $query->whereHas('roles', fn (Builder $builder) => $builder->where('slug', $role));
            }
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
            'items' => UserResource::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 'Users retrieved');
    }

    public function show(Request $request, User $user): JsonResponse
    {
        $this->ensurePermission($request->user(), 'users.view');
        $this->ensureStaff($user);

        $user->load(['roles:id,name,slug']);

        return ApiResponse::success([
            'user' => new UserResource($user),
        ], 'User retrieved');
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'users.create');

        $data = $request->validated();
        $roleSlug = $data['role'];
        unset($data['role'], $data['password_confirmation']);

        $user = User::query()->create([
            ...$data,
            'is_active' => $data['is_active'] ?? true,
            'email_verified_at' => now(),
        ]);

        $this->syncStaffRole($user, $roleSlug);
        $user->load(['roles:id,name,slug']);

        return ApiResponse::success([
            'user' => new UserResource($user),
        ], 'User created', 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $actor = $request->user();
        $this->ensurePermission($actor, 'users.update');
        $this->ensureStaff($user);

        $data = $request->validated();
        $this->guardAccountChanges($actor, $user, $data);

        $roleSlug = $data['role'] ?? null;
        unset($data['role'], $data['password_confirmation']);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $user->update($data);

        if (is_string($roleSlug) && $roleSlug !== '') {
            $this->syncStaffRole($user, $roleSlug);
        }

        $user->load(['roles:id,name,slug']);

        return ApiResponse::success([
            'user' => new UserResource($user),
        ], 'User updated');
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();
        $this->ensurePermission($actor, 'users.delete');
        $this->ensureStaff($user);

        if ($actor && $actor->id === $user->id) {
            return ApiResponse::error('You cannot delete your own account.', 422);
        }

        if ($user->hasRole('super-admin') && $this->superAdminCount($user->id) === 0) {
            return ApiResponse::error('At least one Super Admin account is required.', 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return ApiResponse::success(null, 'User deleted');
    }

    private function staffQuery(): Builder
    {
        return User::query()->whereHas(
            'roles',
            fn (Builder $query) => $query->whereIn('slug', self::STAFF_ROLES)
        );
    }

    private function ensureStaff(User $user): void
    {
        if (! $user->hasAnyRole(self::STAFF_ROLES)) {
            abort(404, 'User not found.');
        }
    }

    private function ensurePermission(?User $user, string $permission): void
    {
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }

    private function syncStaffRole(User $user, string $roleSlug): void
    {
        $role = Role::query()->where('slug', $roleSlug)->firstOrFail();
        $user->roles()->sync([$role->id]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function guardAccountChanges(?User $actor, User $user, array $data): void
    {
        if ($actor && $actor->id === $user->id && array_key_exists('is_active', $data) && $data['is_active'] === false) {
            throw ValidationException::withMessages([
                'is_active' => ['You cannot deactivate your own account.'],
            ]);
        }

        $nextRole = $data['role'] ?? null;
        $leavingSuperAdmin = $user->hasRole('super-admin') && (
            (is_string($nextRole) && $nextRole !== 'super-admin')
            || (array_key_exists('is_active', $data) && $data['is_active'] === false)
        );

        if ($leavingSuperAdmin && $this->activeSuperAdminCount($user->id) === 0) {
            throw ValidationException::withMessages([
                'role' => ['At least one active Super Admin account is required.'],
            ]);
        }
    }

    private function superAdminCount(?int $exceptId = null): int
    {
        return User::query()
            ->when($exceptId, fn (Builder $query) => $query->where('id', '!=', $exceptId))
            ->whereHas('roles', fn (Builder $query) => $query->where('slug', 'super-admin'))
            ->count();
    }

    private function activeSuperAdminCount(?int $exceptId = null): int
    {
        return User::query()
            ->where('is_active', true)
            ->when($exceptId, fn (Builder $query) => $query->where('id', '!=', $exceptId))
            ->whereHas('roles', fn (Builder $query) => $query->where('slug', 'super-admin'))
            ->count();
    }
}
