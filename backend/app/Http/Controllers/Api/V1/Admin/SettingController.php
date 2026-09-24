<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\UpdateSettingsRequest;
use App\Models\Setting;
use App\Models\User;
use App\Support\ApiResponse;
use App\Support\StoreSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'settings.manage');

        return ApiResponse::success([
            'groups' => $this->groupedSettings(),
        ], 'Settings retrieved');
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'settings.manage');

        $definitions = StoreSettings::definitions();

        DB::transaction(function () use ($request, $definitions) {
            foreach ($request->validated('settings') as $row) {
                $key = $row['key'];
                $definition = $definitions[$key];
                $serialized = StoreSettings::serializeValue(
                    $definition['type'],
                    $row['value'] ?? null
                );

                Setting::query()->updateOrCreate(
                    ['key' => $key],
                    [
                        'group' => $definition['group'],
                        'type' => $definition['type'],
                        'value' => $serialized,
                    ]
                );
            }
        });

        return ApiResponse::success([
            'groups' => $this->groupedSettings(),
        ], 'Settings updated');
    }

    /**
     * @return list<array{id: string, label: string, settings: list<array<string, mixed>>}>
     */
    private function groupedSettings(): array
    {
        $stored = Setting::query()->get()->keyBy('key');
        $groups = [
            'general' => 'General',
            'checkout' => 'Checkout & shipping',
            'notifications' => 'Notifications',
            'system' => 'System',
        ];

        $payload = [];

        foreach ($groups as $groupId => $label) {
            $items = [];

            foreach (StoreSettings::definitions() as $key => $definition) {
                if ($definition['group'] !== $groupId) {
                    continue;
                }

                $record = $stored->get($key);
                $rawValue = $record?->value;
                $value = $record
                    ? StoreSettings::castValue($definition['type'], $rawValue)
                    : $definition['default'];

                $items[] = [
                    'key' => $key,
                    'group' => $definition['group'],
                    'type' => $definition['type'],
                    'label' => $definition['label'],
                    'description' => $definition['description'],
                    'value' => $value,
                    'default' => $definition['default'],
                ];
            }

            $payload[] = [
                'id' => $groupId,
                'label' => $label,
                'settings' => $items,
            ];
        }

        return $payload;
    }

    private function ensurePermission(?User $user, string $permission): void
    {
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }
}
