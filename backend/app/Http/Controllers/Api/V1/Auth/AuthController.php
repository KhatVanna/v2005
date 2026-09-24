<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** @var list<string> */
    private const STORE_ROLES = ['customer'];

    /** @var list<string> */
    private const ADMIN_ROLES = ['super-admin', 'admin', 'staff'];

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
            'phone' => $request->input('phone'),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $customerRole = Role::query()->where('slug', 'customer')->first();
        if ($customerRole) {
            $user->roles()->sync([$customerRole->id]);
        }

        $token = $user->createToken('user-frontend')->plainTextToken;

        return ApiResponse::success([
            'user' => new UserResource($user->load('roles')),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Registration successful', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email')->toString())->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated.'],
            ]);
        }

        $portal = $request->string('portal')->toString();
        $allowedRoles = $portal === 'admin' ? self::ADMIN_ROLES : self::STORE_ROLES;

        if (! $user->hasAnyRole($allowedRoles)) {
            throw ValidationException::withMessages([
                'email' => [
                    $portal === 'admin'
                        ? 'Only Super Admin, Admin, or Staff accounts can sign in here.'
                        : 'Only customer accounts can sign in to the store.',
                ],
            ]);
        }

        $tokenName = $portal === 'admin' ? 'admin-frontend' : 'user-frontend';
        $user->tokens()->where('name', $tokenName)->delete();
        $token = $user->createToken($tokenName)->plainTextToken;

        return ApiResponse::success([
            'user' => new UserResource($user->load('roles')),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 'Login successful');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'user' => new UserResource($request->user()->load('roles')),
        ], 'Authenticated user retrieved');
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return ApiResponse::success(null, 'Logged out successfully');
    }
}
