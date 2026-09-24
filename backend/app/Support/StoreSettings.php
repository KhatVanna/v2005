<?php

namespace App\Support;

class StoreSettings
{
    /**
     * @return array<string, array{group: string, type: string, label: string, description: string, default: mixed}>
     */
    public static function definitions(): array
    {
        return [
            'store_name' => [
                'group' => 'general',
                'type' => 'string',
                'label' => 'Store name',
                'description' => 'Public name shown across V2005.',
                'default' => 'V2005',
            ],
            'store_tagline' => [
                'group' => 'general',
                'type' => 'string',
                'label' => 'Store tagline',
                'description' => 'Short supporting line for branding.',
                'default' => 'Modern e-commerce marketplace',
            ],
            'support_email' => [
                'group' => 'general',
                'type' => 'string',
                'label' => 'Support email',
                'description' => 'Customer support contact email.',
                'default' => 'support@v2005.test',
            ],
            'support_phone' => [
                'group' => 'general',
                'type' => 'string',
                'label' => 'Support phone',
                'description' => 'Customer support phone number.',
                'default' => '+1 000 000 0000',
            ],
            'currency' => [
                'group' => 'general',
                'type' => 'string',
                'label' => 'Currency',
                'description' => 'Default store currency code.',
                'default' => 'USD',
            ],
            'timezone' => [
                'group' => 'general',
                'type' => 'string',
                'label' => 'Timezone',
                'description' => 'Store operational timezone.',
                'default' => 'UTC',
            ],
            'shipping_flat_rate' => [
                'group' => 'checkout',
                'type' => 'number',
                'label' => 'Flat shipping rate',
                'description' => 'Default shipping fee charged at checkout.',
                'default' => 9.99,
            ],
            'free_shipping_threshold' => [
                'group' => 'checkout',
                'type' => 'number',
                'label' => 'Free shipping threshold',
                'description' => 'Order total required for free shipping.',
                'default' => 100,
            ],
            'tax_rate' => [
                'group' => 'checkout',
                'type' => 'number',
                'label' => 'Tax rate (%)',
                'description' => 'Default sales tax percentage.',
                'default' => 8.5,
            ],
            'guest_checkout' => [
                'group' => 'checkout',
                'type' => 'boolean',
                'label' => 'Allow guest checkout',
                'description' => 'Let customers checkout without an account.',
                'default' => true,
            ],
            'order_email_enabled' => [
                'group' => 'notifications',
                'type' => 'boolean',
                'label' => 'Order emails',
                'description' => 'Send email notifications for new orders.',
                'default' => true,
            ],
            'low_stock_email_enabled' => [
                'group' => 'notifications',
                'type' => 'boolean',
                'label' => 'Low stock emails',
                'description' => 'Notify admins when stock is low.',
                'default' => true,
            ],
            'low_stock_threshold' => [
                'group' => 'notifications',
                'type' => 'number',
                'label' => 'Low stock threshold',
                'description' => 'Inventory quantity that triggers low-stock alerts.',
                'default' => 5,
            ],
            'maintenance_mode' => [
                'group' => 'system',
                'type' => 'boolean',
                'label' => 'Maintenance mode',
                'description' => 'Temporarily disable storefront shopping.',
                'default' => false,
            ],
            'allow_registration' => [
                'group' => 'system',
                'type' => 'boolean',
                'label' => 'Allow customer registration',
                'description' => 'Enable new customer sign-ups on the storefront.',
                'default' => true,
            ],
        ];
    }

    public static function castValue(string $type, mixed $value): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'number' => is_numeric($value) ? (float) $value : 0,
            'json' => is_string($value) ? json_decode($value, true) : $value,
            default => $value === null ? '' : (string) $value,
        };
    }

    public static function serializeValue(string $type, mixed $value): string
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            'number' => (string) (is_numeric($value) ? $value : 0),
            'json' => json_encode($value) ?: 'null',
            default => (string) ($value ?? ''),
        };
    }
}
