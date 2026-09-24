<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Account\StoreAddressRequest;
use App\Http\Requests\Api\V1\Account\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->addresses()
            ->latest('id')
            ->get();

        return ApiResponse::success([
            'items' => AddressResource::collection($addresses),
        ], 'Addresses retrieved');
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $makeDefault = (bool) ($data['is_default'] ?? false);

        $address = DB::transaction(function () use ($user, $data, $makeDefault) {
            if ($makeDefault || $user->addresses()->count() === 0) {
                $user->addresses()->update(['is_default' => false]);
                $data['is_default'] = true;
            }

            return $user->addresses()->create($data);
        });

        return ApiResponse::success([
            'address' => new AddressResource($address),
        ], 'Address created', 201);
    }

    public function update(UpdateAddressRequest $request, Address $address): JsonResponse
    {
        $this->ensureOwned($request, $address);

        $data = $request->validated();

        $address = DB::transaction(function () use ($request, $address, $data) {
            if (array_key_exists('is_default', $data) && $data['is_default']) {
                $request->user()->addresses()->update(['is_default' => false]);
            }

            $address->update($data);

            return $address->fresh();
        });

        return ApiResponse::success([
            'address' => new AddressResource($address),
        ], 'Address updated');
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->ensureOwned($request, $address);

        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            $next = $request->user()->addresses()->latest('id')->first();
            if ($next) {
                $next->update(['is_default' => true]);
            }
        }

        return ApiResponse::success(null, 'Address deleted');
    }

    private function ensureOwned(Request $request, Address $address): void
    {
        if ((int) $address->user_id !== (int) $request->user()->id) {
            abort(404, 'Address not found.');
        }
    }
}
