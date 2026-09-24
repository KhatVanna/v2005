<?php

namespace App\Http\Requests\Api\V1\Admin;

use App\Support\StoreSettings;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $keys = array_keys(StoreSettings::definitions());

        return [
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', Rule::in($keys)],
            'settings.*.value' => ['nullable'],
        ];
    }
}
