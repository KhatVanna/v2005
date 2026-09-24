<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $superAdminRole = Role::query()->where('slug', 'super-admin')->firstOrFail();
        $adminRole = Role::query()->where('slug', 'admin')->firstOrFail();
        $staffRole = Role::query()->where('slug', 'staff')->firstOrFail();
        $customerRole = Role::query()->where('slug', 'customer')->firstOrFail();

        $superAdmin = User::query()->updateOrCreate(
            ['email' => 'admin@v2005.test'],
            [
                'name' => 'V2005 Super Admin',
                'password' => Hash::make('password'),
                'phone' => '+10000000001',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->roles()->syncWithoutDetaching([$superAdminRole->id]);

        $admin = User::query()->updateOrCreate(
            ['email' => 'manager@v2005.test'],
            [
                'name' => 'V2005 Admin',
                'password' => Hash::make('password'),
                'phone' => '+10000000002',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        $staff = User::query()->updateOrCreate(
            ['email' => 'staff@v2005.test'],
            [
                'name' => 'V2005 Staff',
                'password' => Hash::make('password'),
                'phone' => '+10000000004',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $staff->roles()->syncWithoutDetaching([$staffRole->id]);

        $customer = User::query()->updateOrCreate(
            ['email' => 'customer@v2005.test'],
            [
                'name' => 'Demo Customer',
                'password' => Hash::make('password'),
                'phone' => '+10000000003',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $customer->roles()->syncWithoutDetaching([$customerRole->id]);

        Address::query()->updateOrCreate(
            [
                'user_id' => $customer->id,
                'label' => 'Home',
            ],
            [
                'full_name' => 'Demo Customer',
                'phone' => '+10000000003',
                'line1' => '123 Market Street',
                'city' => 'San Francisco',
                'state' => 'CA',
                'postal_code' => '94105',
                'country' => 'US',
                'is_default' => true,
            ]
        );

        Wishlist::query()->updateOrCreate(
            [
                'user_id' => $customer->id,
                'name' => 'Default',
            ]
        );

        $this->call(CatalogSeeder::class);
        $this->call(BlogSeeder::class);

        $product = Product::query()->first();

        if ($product) {
            $order = Order::query()->updateOrCreate(
                ['order_number' => 'V2005-100001'],
                [
                    'user_id' => $customer->id,
                    'status' => 'confirmed',
                    'payment_status' => 'paid',
                    'currency' => 'USD',
                    'subtotal' => $product->price,
                    'discount_total' => 0,
                    'shipping_total' => 0,
                    'tax_total' => 0,
                    'grand_total' => $product->price,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone,
                    'billing_address' => [
                        'full_name' => 'Demo Customer',
                        'line1' => '123 Market Street',
                        'city' => 'San Francisco',
                        'country' => 'US',
                    ],
                    'shipping_address' => [
                        'full_name' => 'Demo Customer',
                        'line1' => '123 Market Street',
                        'city' => 'San Francisco',
                        'country' => 'US',
                    ],
                    'placed_at' => now()->subDays(2),
                ]
            );

            OrderItem::query()->updateOrCreate(
                [
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                ],
                [
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => 1,
                    'unit_price' => $product->price,
                    'total_price' => $product->price,
                ]
            );

            Payment::query()->updateOrCreate(
                [
                    'order_id' => $order->id,
                    'provider' => 'manual',
                ],
                [
                    'method' => 'card',
                    'status' => 'paid',
                    'amount' => $product->price,
                    'currency' => 'USD',
                    'transaction_id' => 'txn_demo_001',
                    'paid_at' => now()->subDays(2),
                ]
            );
        }

        $this->call(SalesHistorySeeder::class);
    }
}
