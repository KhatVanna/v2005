<?php

namespace App\Http\Requests\Api\V1\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                'required',
                'string',
                Rule::in([
                    'pending',
                    'confirmed',
                    'processing',
                    'shipped',
                    'delivered',
                    'cancelled',
                    'refunded',
                ]),
            ],
            'payment_status' => [
                'sometimes',
                'required',
                'string',
                Rule::in([
                    'pending',
                    'paid',
                    'failed',
                    'refunded',
                    'partially_refunded',
                ]),
            ],
            'notes' => ['nullable', 'string'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
        ];
    }
}
