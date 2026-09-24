<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalesHistorySeeder extends Seeder
{
    private const ORDER_COUNT = 160;

    public function run(): void
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'name', 'sku', 'price']);

        $customer = User::query()->where('email', 'customer@v2005.test')->first();

        if ($products->isEmpty() || ! $customer) {
            return;
        }

        $count = $products->count();
        $statuses = ['confirmed', 'processing', 'shipped', 'delivered', 'pending'];

        DB::transaction(function () use ($products, $customer, $count, $statuses) {
            for ($i = 1; $i <= self::ORDER_COUNT; $i++) {
                $placedAt = now()
                    ->subDays($i % 90)
                    ->setTime(8 + ($i % 12), ($i * 7) % 60);

                $lineCount = 1 + ($i % 3);
                $lines = [];

                for ($n = 0; $n < $lineCount; $n++) {
                    $product = $products[($i * 17 + $n * 13) % $count];
                    $quantity = 1 + (($i + $n) % 3);
                    $unitPrice = (float) $product->price;
                    $key = $product->id;

                    if (! isset($lines[$key])) {
                        $lines[$key] = [
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'sku' => $product->sku,
                            'quantity' => 0,
                            'unit_price' => $unitPrice,
                            'total_price' => 0,
                        ];
                    }

                    $lines[$key]['quantity'] += $quantity;
                    $lines[$key]['total_price'] = round($lines[$key]['quantity'] * $unitPrice, 2);
                }

                $subtotal = round(collect($lines)->sum('total_price'), 2);
                $status = $statuses[$i % count($statuses)];

                $order = Order::query()->updateOrCreate(
                    ['order_number' => sprintf('V2005-R-%04d', $i)],
                    [
                        'user_id' => $customer->id,
                        'status' => $status,
                        'payment_status' => $status === 'pending' ? 'pending' : 'paid',
                        'currency' => 'USD',
                        'subtotal' => $subtotal,
                        'discount_total' => 0,
                        'shipping_total' => 0,
                        'tax_total' => 0,
                        'grand_total' => $subtotal,
                        'customer_email' => $customer->email,
                        'customer_phone' => $customer->phone,
                        'billing_address' => [
                            'full_name' => $customer->name,
                            'line1' => '123 Market Street',
                            'city' => 'San Francisco',
                            'country' => 'US',
                        ],
                        'shipping_address' => [
                            'full_name' => $customer->name,
                            'line1' => '123 Market Street',
                            'city' => 'San Francisco',
                            'country' => 'US',
                        ],
                        'placed_at' => $placedAt,
                    ]
                );

                $order->items()->delete();
                $order->items()->createMany(array_values($lines));

                Payment::query()->updateOrCreate(
                    [
                        'order_id' => $order->id,
                        'provider' => 'report-seed',
                    ],
                    [
                        'method' => 'card',
                        'status' => $status === 'pending' ? 'pending' : 'paid',
                        'amount' => $subtotal,
                        'currency' => 'USD',
                        'transaction_id' => sprintf('txn_report_%04d', $i),
                        'paid_at' => $status === 'pending' ? null : $placedAt,
                    ]
                );
            }
        });

        DB::statement('UPDATE products SET sales_count = 0');
        DB::statement('
            UPDATE products
            SET sales_count = agg.qty
            FROM (
                SELECT product_id, SUM(quantity)::integer AS qty
                FROM order_items
                WHERE product_id IS NOT NULL
                GROUP BY product_id
            ) AS agg
            WHERE products.id = agg.product_id
        ');
    }
}
