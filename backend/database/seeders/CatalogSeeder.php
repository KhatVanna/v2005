<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    private const PRODUCT_COUNT = 1000;

    private const IMAGE_BY_NAME = [
        'Wireless Noise-Cancelling Headphones' => '/images/products/wireless-headphones.png',
        'Magnetic Wireless Charger 15W' => '/images/products/wireless-charger.png',
        'Portable Power Bank 10000mAh PD' => '/images/products/power-bank.png',
        'Smartwatch IP67 Fitness Edition' => '/images/products/smartwatch.png',
        'Bluetooth Earbuds Pro' => '/images/products/bluetooth-earbuds-pro.png',
        'USB-C Fast Charge Cable 2m' => '/images/products/usb-c-fast-charge-cable-2m.png',
        'Phone Tripod Stand Mini' => '/images/products/phone-tripod-stand-mini.png',
        'MagSafe Car Mount' => '/images/products/magsafe-car-mount.png',
        'Screen Protector Glass Pack' => '/images/products/screen-protector-glass-pack.png',
        'Silicone Phone Case Clear' => '/images/products/silicone-phone-case-clear.png',
        'Compact Air Fryer 9L Digital Touch' => '/images/products/air-fryer-9l.png',
        'Dual Zone Air Fryer 23L XXL' => '/images/products/air-fryer-23l.png',
        'Electric Kettle Stainless 1.7L' => '/images/products/electric-kettle-stainless-1-7l.png',
        'Blender Pro Glass Jug' => '/images/products/blender-pro-glass-jug.png',
        'Toaster 2-Slice Premium' => '/images/products/toaster-2-slice-premium.png',
        'Coffee Maker Drip 12 Cup' => '/images/products/coffee-maker-drip-12-cup.png',
        'Hand Mixer Compact' => '/images/products/hand-mixer-compact.png',
        'Nonstick Pan Set 3pc' => '/images/products/nonstick-pan-set-3pc.png',
        'Digital Kitchen Scale' => '/images/products/digital-kitchen-scale.png',
        'Vacuum Sealer Home' => '/images/products/vacuum-sealer-home.png',
        'Urban Electric Scooter Pro' => '/images/products/electric-scooter.png',
        'Pro Wireless Gaming Controller' => '/images/products/gaming-controller.png',
        'RGB Mechanical Keyboard' => '/images/products/rgb-mechanical-keyboard.png',
        'Gaming Mouse Pad XL' => '/images/products/gaming-mouse-pad-xl.png',
        'VR Headset Comfort Strap' => '/images/products/vr-headset-comfort-strap.png',
        'Building Blocks Creative Set' => '/images/products/building-blocks-creative-set.png',
        'Remote Control Race Car' => '/images/products/remote-control-race-car.png',
        'Puzzle Board 1000 Pieces' => '/images/products/puzzle-board-1000-pieces.png',
        'Drone Mini Camera Edition' => '/images/products/drone-mini-camera-edition.png',
        'Arcade Stick Retro' => '/images/products/arcade-stick-retro.png',
        'RPET Roll-Top Everyday Backpack' => '/images/products/rolltop-backpack.png',
        'Stainless Sports Bottle 750ml' => '/images/products/sports-bottle.png',
        'Laptop Sleeve 15 Inch' => '/images/products/laptop-sleeve-15-inch.png',
        'Travel Duffel Bag 40L' => '/images/products/travel-duffel-bag-40l.png',
        'Crossbody City Sling' => '/images/products/crossbody-city-sling.png',
        'Hiking Daypack 25L' => '/images/products/hiking-daypack-25l.png',
        'Drawstring Sport Bag' => '/images/products/drawstring-sport-bag.png',
        'Camera Shoulder Bag' => '/images/products/camera-shoulder-bag.png',
        'Weekender Canvas Bag' => '/images/products/weekender-canvas-bag.png',
        'Insulated Lunch Tote' => '/images/products/insulated-lunch-tote.png',
        'Ergonomic Vertical Wireless Mouse' => '/images/products/vertical-mouse.png',
        'USB-C Hub 4-Port Multiport Adapter' => '/images/products/usb-c-hub.png',
        'Laptop Stand Aluminum' => '/images/products/laptop-stand-aluminum.png',
        'Wireless Keyboard Compact' => '/images/products/wireless-keyboard-compact.png',
        'Monitor Light Bar' => '/images/products/monitor-light-bar.png',
        'Webcam Full HD 1080p' => '/images/products/webcam-full-hd-1080p.png',
        'External SSD Enclosure' => '/images/products/external-ssd-enclosure.png',
        'Desk Cable Organizer' => '/images/products/desk-cable-organizer.png',
        'USB Microphone Condenser' => '/images/products/usb-microphone-condenser.png',
        'Portable Monitor 15.6' => '/images/products/portable-monitor-15-6.png',
        'Flash Deal Wireless Buds' => '/images/products/flash-deal-wireless-buds.png',
        'Limited Bundle Charge Kit' => '/images/products/limited-bundle-charge-kit.png',
        'Weekend Special Backpack' => '/images/products/weekend-special-backpack.png',
        'Clearance Desk Essentials Set' => '/images/products/clearance-desk-essentials-set.png',
        'Promo Smart Band Lite' => '/images/products/promo-smart-band-lite.png',
        'Bundle Home Starter Kit' => '/images/products/bundle-home-starter-kit.png',
        'Seasonal Travel Pack' => '/images/products/seasonal-travel-pack.png',
        'Value Power Adapter Duo' => '/images/products/value-power-adapter-duo.png',
        'Deal of the Week Speaker' => '/images/products/deal-of-the-week-speaker.png',
        'Member Exclusive Mouse' => '/images/products/member-exclusive-mouse.png',
    ];

    private const BRANDS = [
        'Auralis', 'HomeForge', 'ChargeLab', 'VoltRide', 'DeskForm', 'PlayPulse',
        'TrailCarry', 'HydroDay', 'PulseTrack', 'NovaKit', 'BrightLoom', 'CoreNest',
    ];

    public function run(): void
    {
        $categories = [
            ['name' => 'Top Offers', 'slug' => 'top-offers'],
            ['name' => 'Smartphones & Accessories', 'slug' => 'smartphones-accessories'],
            ['name' => 'Kitchen & Household', 'slug' => 'kitchen-household'],
            ['name' => 'Toys & Gaming', 'slug' => 'toys-gaming'],
            ['name' => 'Bags & Backpacks', 'slug' => 'bags-backpacks'],
            ['name' => 'Computers & Accessories', 'slug' => 'computers-accessories'],
        ];

        $categoryIds = [];
        foreach ($categories as $index => $category) {
            $model = Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['name'].' products at V2005',
                    'image' => array_values(self::IMAGE_BY_NAME)[$index % count(self::IMAGE_BY_NAME)],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]
            );
            $categoryIds[$category['slug']] = $model->id;
        }

        $brandIds = [];
        foreach (self::BRANDS as $brandName) {
            $model = Brand::query()->updateOrCreate(
                ['slug' => Str::slug($brandName)],
                [
                    'name' => $brandName,
                    'description' => $brandName.' official catalog',
                    'is_active' => true,
                ]
            );
            $brandIds[] = $model->id;
        }

        $templates = [
            'smartphones-accessories' => [
                'names' => [
                    'Wireless Noise-Cancelling Headphones',
                    'Magnetic Wireless Charger 15W',
                    'Portable Power Bank 10000mAh PD',
                    'Smartwatch IP67 Fitness Edition',
                    'Bluetooth Earbuds Pro',
                    'USB-C Fast Charge Cable 2m',
                    'Phone Tripod Stand Mini',
                    'MagSafe Car Mount',
                    'Screen Protector Glass Pack',
                    'Silicone Phone Case Clear',
                ],
                'base' => 18,
                'spread' => 140,
            ],
            'kitchen-household' => [
                'names' => [
                    'Compact Air Fryer 9L Digital Touch',
                    'Dual Zone Air Fryer 23L XXL',
                    'Electric Kettle Stainless 1.7L',
                    'Blender Pro Glass Jug',
                    'Toaster 2-Slice Premium',
                    'Coffee Maker Drip 12 Cup',
                    'Hand Mixer Compact',
                    'Nonstick Pan Set 3pc',
                    'Digital Kitchen Scale',
                    'Vacuum Sealer Home',
                ],
                'base' => 24,
                'spread' => 280,
            ],
            'toys-gaming' => [
                'names' => [
                    'Urban Electric Scooter Pro',
                    'Pro Wireless Gaming Controller',
                    'RGB Mechanical Keyboard',
                    'Gaming Mouse Pad XL',
                    'VR Headset Comfort Strap',
                    'Building Blocks Creative Set',
                    'Remote Control Race Car',
                    'Puzzle Board 1000 Pieces',
                    'Drone Mini Camera Edition',
                    'Arcade Stick Retro',
                ],
                'base' => 22,
                'spread' => 520,
            ],
            'bags-backpacks' => [
                'names' => [
                    'RPET Roll-Top Everyday Backpack',
                    'Stainless Sports Bottle 750ml',
                    'Laptop Sleeve 15 Inch',
                    'Travel Duffel Bag 40L',
                    'Crossbody City Sling',
                    'Hiking Daypack 25L',
                    'Drawstring Sport Bag',
                    'Camera Shoulder Bag',
                    'Weekender Canvas Bag',
                    'Insulated Lunch Tote',
                ],
                'base' => 14,
                'spread' => 90,
            ],
            'computers-accessories' => [
                'names' => [
                    'Ergonomic Vertical Wireless Mouse',
                    'USB-C Hub 4-Port Multiport Adapter',
                    'Laptop Stand Aluminum',
                    'Wireless Keyboard Compact',
                    'Monitor Light Bar',
                    'Webcam Full HD 1080p',
                    'External SSD Enclosure',
                    'Desk Cable Organizer',
                    'USB Microphone Condenser',
                    'Portable Monitor 15.6',
                ],
                'base' => 16,
                'spread' => 220,
            ],
            'top-offers' => [
                'names' => [
                    'Flash Deal Wireless Buds',
                    'Limited Bundle Charge Kit',
                    'Weekend Special Backpack',
                    'Clearance Desk Essentials Set',
                    'Promo Smart Band Lite',
                    'Bundle Home Starter Kit',
                    'Seasonal Travel Pack',
                    'Value Power Adapter Duo',
                    'Deal of the Week Speaker',
                    'Member Exclusive Mouse',
                ],
                'base' => 12,
                'spread' => 100,
            ],
        ];

        $templateKeys = array_keys($templates);
        $now = now();
        $customer = User::query()->where('email', 'customer@v2005.test')->first();

        DB::transaction(function () use (
            $templates,
            $templateKeys,
            $categoryIds,
            $brandIds,
            $now,
            $customer
        ) {
            // Keep existing sample order product if present; recreate catalog at scale.
            Product::query()->where('sku', 'like', 'V2005-%')->forceDelete();

            $productRows = [];
            $imageRows = [];
            $variantRows = [];
            $inventoryRows = [];

            for ($i = 1; $i <= self::PRODUCT_COUNT; $i++) {
                $templateKey = $templateKeys[($i - 1) % count($templateKeys)];
                $template = $templates[$templateKey];
                $nameBase = $template['names'][($i - 1) % count($template['names'])];
                $edition = (int) ceil($i / count($templateKeys));
                $name = $edition === 1 ? $nameBase : $nameBase.' — Edition '.$edition;
                $slugBase = Str::slug($nameBase);
                $slug = $slugBase.'-e'.$edition.'-'.$i;
                $sku = 'V2005-'.str_pad((string) $i, 5, '0', STR_PAD_LEFT);
                $random = $this->seededRandom($i);
                $price = round($template['base'] + ($random * $template['spread']), 2);
                $compare = $random > 0.35
                    ? round($price * (1.12 + ($random * 0.35)), 2)
                    : null;
                $stock = max(1, (int) floor($random * 40) + 1);
                $image = self::IMAGE_BY_NAME[$nameBase] ?? '/images/products/wireless-headphones.png';
                $brandId = $brandIds[($i - 1) % count($brandIds)];

                $productRows[] = [
                    'category_id' => $categoryIds[$templateKey],
                    'brand_id' => $brandId,
                    'name' => $name,
                    'slug' => $slug,
                    'sku' => $sku,
                    'short_description' => 'Premium quality '.$name.' available at V2005.',
                    'description' => 'Shop the '.$name.' at V2005. Designed for everyday performance with reliable build quality.',
                    'price' => $price,
                    'compare_at_price' => $compare,
                    'cost_price' => null,
                    'stock_quantity' => $stock,
                    'track_inventory' => true,
                    'is_active' => true,
                    'is_featured' => $i <= 40 || $random > 0.82,
                    'average_rating' => round(3.6 + ($random * 1.4), 2),
                    'reviews_count' => 0,
                    'sales_count' => 0,
                    'meta_title' => $name.' | V2005',
                    'meta_description' => 'Buy '.$name.' at V2005.',
                    'published_at' => $now->copy()->subMinutes($i),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                if (count($productRows) === 100 || $i === self::PRODUCT_COUNT) {
                    Product::query()->insert($productRows);
                    $skus = array_column($productRows, 'sku');
                    $inserted = Product::query()
                        ->whereIn('sku', $skus)
                        ->get(['id', 'sku', 'name', 'price', 'compare_at_price', 'stock_quantity', 'slug']);

                    foreach ($inserted as $product) {
                        $baseName = preg_replace('/ — Edition \d+$/u', '', $product->name) ?: $product->name;
                        $imagePath = self::IMAGE_BY_NAME[$baseName] ?? '/images/products/wireless-headphones.png';

                        $imageRows[] = [
                            'product_id' => $product->id,
                            'path' => $imagePath,
                            'alt_text' => $product->name,
                            'sort_order' => 0,
                            'is_primary' => true,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];

                        $variantSku = $product->sku.'-STD';
                        $variantRows[] = [
                            'product_id' => $product->id,
                            'sku' => $variantSku,
                            'name' => 'Standard',
                            'price' => $product->price,
                            'compare_at_price' => $product->compare_at_price,
                            'stock_quantity' => $product->stock_quantity,
                            'is_active' => true,
                            'attribute_data' => json_encode(['size' => 'Standard']),
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    ProductImage::query()->insert($imageRows);
                    ProductVariant::query()->insert($variantRows);

                    $variants = ProductVariant::query()
                        ->whereIn('sku', array_column($variantRows, 'sku'))
                        ->get(['id', 'product_id', 'stock_quantity']);

                    foreach ($variants as $variant) {
                        $inventoryRows[] = [
                            'product_id' => $variant->product_id,
                            'product_variant_id' => $variant->id,
                            'quantity' => $variant->stock_quantity,
                            'reserved_quantity' => 0,
                            'low_stock_threshold' => 5,
                            'warehouse' => 'main',
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    Inventory::query()->insert($inventoryRows);

                    if ($customer && $i === self::PRODUCT_COUNT) {
                        $sample = $inserted->first();
                        if ($sample) {
                            Review::query()->updateOrCreate(
                                [
                                    'product_id' => $sample->id,
                                    'user_id' => $customer->id,
                                ],
                                [
                                    'rating' => 5,
                                    'title' => 'Great product',
                                    'body' => 'Happy with my purchase from V2005.',
                                    'is_approved' => true,
                                ]
                            );
                        }
                    }

                    $productRows = [];
                    $imageRows = [];
                    $variantRows = [];
                    $inventoryRows = [];
                }
            }
        });

        Coupon::query()->updateOrCreate(
            ['code' => 'WELCOME10'],
            [
                'name' => 'Welcome 10% Off',
                'type' => 'percent',
                'value' => 10,
                'min_order_amount' => 50,
                'max_discount_amount' => 30,
                'usage_limit' => 1000,
                'per_user_limit' => 1,
                'is_active' => true,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(3),
            ]
        );

        Banner::query()->updateOrCreate(
            ['title' => 'Discover Something New'],
            [
                'subtitle' => 'Shop quality products at V2005',
                'image' => '/images/products/wireless-headphones.png',
                'link_url' => '/products',
                'button_text' => 'Shop Now',
                'placement' => 'homepage',
                'sort_order' => 1,
                'is_active' => true,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addMonths(6),
            ]
        );

        Setting::query()->updateOrCreate(
            ['key' => 'store_name'],
            [
                'group' => 'general',
                'value' => 'V2005',
                'type' => 'string',
            ]
        );

        Setting::query()->updateOrCreate(
            ['key' => 'currency'],
            [
                'group' => 'general',
                'value' => 'USD',
                'type' => 'string',
            ]
        );
    }

    private function seededRandom(int $seed): float
    {
        $x = sin($seed * 9999) * 10000;

        return $x - floor($x);
    }
}
