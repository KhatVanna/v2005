<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ReportController extends Controller
{
    private const CANCELLED_STATUSES = ['cancelled', 'canceled', 'refunded'];

    public function products(Request $request): JsonResponse
    {
        $this->ensurePermission($request->user(), 'reports.view');

        $validated = $request->validate([
            'period' => ['nullable', 'in:7d,30d,90d,365d,all,custom'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'category_id' => ['nullable', 'integer'],
            'brand_id' => ['nullable', 'integer'],
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'in:all,active,inactive,low_stock,out_of_stock,featured'],
            'sales' => ['nullable', 'in:all,with,without'],
            'sort' => ['nullable', 'in:revenue,units,orders,stock,price,name,margin'],
            'direction' => ['nullable', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        [$from, $to] = $this->resolveRange(
            $validated['period'] ?? '30d',
            $validated['from'] ?? null,
            $validated['to'] ?? null,
        );

        $sales = OrderItem::query()
            ->select('order_items.product_id')
            ->selectRaw('COALESCE(SUM(order_items.quantity), 0) as units_sold')
            ->selectRaw('COALESCE(SUM(order_items.total_price), 0) as revenue')
            ->selectRaw('COUNT(DISTINCT order_items.order_id) as orders_count')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereNull('orders.deleted_at')
            ->whereNotNull('order_items.product_id')
            ->whereNotNull('orders.placed_at')
            ->whereNotIn('orders.status', self::CANCELLED_STATUSES)
            ->when($from, fn (Builder $query) => $query->where('orders.placed_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->where('orders.placed_at', '<=', $to))
            ->groupBy('order_items.product_id');

        $base = Product::query()->leftJoinSub($sales, 'sales', 'sales.product_id', '=', 'products.id');
        $this->applyProductFilters($base, $request);
        $this->applySalesFilter($base, $request->query('sales', 'all'));

        $summaryRow = (clone $base)
            ->selectRaw('COUNT(products.id) as product_count')
            ->selectRaw('SUM(CASE WHEN products.is_active THEN 1 ELSE 0 END) as active_count')
            ->selectRaw('SUM(CASE WHEN products.track_inventory AND products.stock_quantity > 0 AND products.stock_quantity <= 5 THEN 1 ELSE 0 END) as low_stock_count')
            ->selectRaw('SUM(CASE WHEN products.track_inventory AND products.stock_quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock_count')
            ->selectRaw('COALESCE(SUM(sales.units_sold), 0) as units_sold')
            ->selectRaw('COALESCE(SUM(sales.revenue), 0) as revenue')
            ->selectRaw('COALESCE(SUM(CASE WHEN products.cost_price IS NULL THEN 0 ELSE COALESCE(sales.revenue, 0) - (COALESCE(sales.units_sold, 0) * products.cost_price) END), 0) as margin')
            ->selectRaw('SUM(CASE WHEN products.cost_price IS NULL THEN 0 ELSE 1 END) as costed_products')
            ->first();

        $ordersCount = Order::query()
            ->whereNotIn('status', self::CANCELLED_STATUSES)
            ->whereNotNull('placed_at')
            ->when($from, fn (Builder $query) => $query->where('placed_at', '>=', $from))
            ->when($to, fn (Builder $query) => $query->where('placed_at', '<=', $to))
            ->whereHas('items.product', function (Builder $product) use ($request) {
                $this->applyProductFilters($product, $request);
            })
            ->count();

        $revenue = (float) ($summaryRow->revenue ?? 0);
        $direction = ($validated['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';
        $sort = $validated['sort'] ?? 'revenue';

        $list = (clone $base)
            ->with(['category:id,name', 'brand:id,name'])
            ->select('products.*')
            ->selectRaw('COALESCE(sales.units_sold, 0) as units_sold')
            ->selectRaw('COALESCE(sales.revenue, 0) as revenue')
            ->selectRaw('COALESCE(sales.orders_count, 0) as orders_count');

        match ($sort) {
            'units' => $list->orderBy('units_sold', $direction),
            'orders' => $list->orderBy('orders_count', $direction),
            'stock' => $list->orderBy('products.stock_quantity', $direction),
            'price' => $list->orderBy('products.price', $direction),
            'name' => $list->orderBy('products.name', $direction),
            'margin' => $list->orderByRaw(
                '(CASE WHEN products.cost_price IS NULL THEN 0 ELSE COALESCE(sales.revenue, 0) - (COALESCE(sales.units_sold, 0) * products.cost_price) END) '.$direction
            ),
            default => $list->orderBy('revenue', $direction),
        };

        $perPage = (int) ($validated['per_page'] ?? 15);
        $paginator = $list->orderBy('products.id')->paginate($perPage);

        $categories = $this->breakdown($base, 'categories', 'category_id', 'Uncategorized');
        $brands = $this->breakdown($base, 'brands', 'brand_id', 'No brand');

        return ApiResponse::success([
            'range' => [
                'period' => $validated['period'] ?? '30d',
                'from' => $from?->toDateString(),
                'to' => $to?->toDateString(),
            ],
            'summary' => [
                'product_count' => (int) ($summaryRow->product_count ?? 0),
                'active_count' => (int) ($summaryRow->active_count ?? 0),
                'low_stock_count' => (int) ($summaryRow->low_stock_count ?? 0),
                'out_of_stock_count' => (int) ($summaryRow->out_of_stock_count ?? 0),
                'units_sold' => (int) ($summaryRow->units_sold ?? 0),
                'revenue' => round($revenue, 2),
                'orders_count' => $ordersCount,
                'average_order_value' => $ordersCount > 0 ? round($revenue / $ordersCount, 2) : 0,
                'margin' => (int) ($summaryRow->costed_products ?? 0) > 0
                    ? round((float) $summaryRow->margin, 2)
                    : null,
            ],
            'trend' => $this->buildTrend($this->dailySales($request, $from, $to), $from, $to),
            'categories' => $categories,
            'brands' => $brands,
            'items' => collect($paginator->items())->map(fn (Product $product) => $this->presentProduct($product))->values(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 'Product report retrieved');
    }

    private function dailySales(Request $request, ?Carbon $from, ?Carbon $to): Collection
    {
        $query = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereNull('orders.deleted_at')
            ->whereNull('products.deleted_at')
            ->whereNotNull('orders.placed_at')
            ->whereNotIn('orders.status', self::CANCELLED_STATUSES)
            ->when($from, fn (Builder $builder) => $builder->where('orders.placed_at', '>=', $from))
            ->when($to, fn (Builder $builder) => $builder->where('orders.placed_at', '<=', $to));

        $this->applyProductFilters($query, $request);

        if ($request->query('sales') === 'without') {
            $query->whereRaw('1 = 0');
        }

        return $query
            ->selectRaw('DATE(orders.placed_at) as day')
            ->selectRaw('SUM(order_items.quantity) as units')
            ->selectRaw('SUM(order_items.total_price) as revenue')
            ->groupByRaw('DATE(orders.placed_at)')
            ->orderBy('day')
            ->get();
    }

    private function breakdown(Builder $base, string $table, string $foreignKey, string $emptyLabel): array
    {
        $rows = (clone $base)
            ->leftJoin($table, "{$table}.id", '=', "products.{$foreignKey}")
            ->selectRaw('COALESCE('.$table.'.name, ?) as label', [$emptyLabel])
            ->selectRaw('COUNT(products.id) as products')
            ->selectRaw('COALESCE(SUM(sales.units_sold), 0) as units')
            ->selectRaw('COALESCE(SUM(sales.revenue), 0) as revenue')
            ->groupBy("{$table}.id", "{$table}.name")
            ->orderByDesc('revenue')
            ->get();

        $top = $rows->take(6);
        $rest = $rows->slice(6);

        $items = $top->map(fn ($row) => [
            'name' => (string) $row->label,
            'products' => (int) $row->products,
            'units' => (int) $row->units,
            'revenue' => round((float) $row->revenue, 2),
        ])->values();

        if ($rest->isNotEmpty()) {
            $items->push([
                'name' => 'Other',
                'products' => (int) $rest->sum('products'),
                'units' => (int) $rest->sum('units'),
                'revenue' => round((float) $rest->sum('revenue'), 2),
            ]);
        }

        return $items->all();
    }

    private function presentProduct(Product $product): array
    {
        $units = (int) $product->getAttribute('units_sold');
        $revenue = round((float) $product->getAttribute('revenue'), 2);
        $cost = $product->cost_price !== null ? (float) $product->cost_price : null;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'category' => $product->category?->name,
            'brand' => $product->brand?->name,
            'price' => (float) $product->price,
            'cost_price' => $cost,
            'stock_quantity' => (int) $product->stock_quantity,
            'is_active' => (bool) $product->is_active,
            'is_featured' => (bool) $product->is_featured,
            'units_sold' => $units,
            'revenue' => $revenue,
            'orders_count' => (int) $product->getAttribute('orders_count'),
            'margin' => $cost === null ? null : round($revenue - ($units * $cost), 2),
        ];
    }

    private function applyProductFilters(Builder $query, Request $request, string $table = 'products'): void
    {
        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $like = '%'.addcslashes($search, '%_\\').'%';
            $query->where(function (Builder $builder) use ($like, $table) {
                $builder
                    ->where("{$table}.name", 'ilike', $like)
                    ->orWhere("{$table}.sku", 'ilike', $like);
            });
        }

        if ($request->filled('category_id')) {
            $query->where("{$table}.category_id", (int) $request->query('category_id'));
        }

        if ($request->filled('brand_id')) {
            $query->where("{$table}.brand_id", (int) $request->query('brand_id'));
        }

        match ($request->query('status', 'all')) {
            'active' => $query->where("{$table}.is_active", true),
            'inactive' => $query->where("{$table}.is_active", false),
            'featured' => $query->where("{$table}.is_featured", true),
            'low_stock' => $query
                ->where("{$table}.track_inventory", true)
                ->where("{$table}.stock_quantity", '>', 0)
                ->where("{$table}.stock_quantity", '<=', 5),
            'out_of_stock' => $query
                ->where("{$table}.track_inventory", true)
                ->where("{$table}.stock_quantity", '<=', 0),
            default => null,
        };
    }

    private function applySalesFilter(Builder $query, mixed $sales): void
    {
        if ($sales === 'with') {
            $query->where('sales.units_sold', '>', 0);
        }

        if ($sales === 'without') {
            $query->where(function (Builder $builder) {
                $builder->whereNull('sales.units_sold')->orWhere('sales.units_sold', 0);
            });
        }
    }

    /**
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    private function resolveRange(string $period, ?string $from, ?string $to): array
    {
        $end = now()->endOfDay();

        if ($period === 'all') {
            return [null, null];
        }

        if ($period === 'custom') {
            $start = $from ? Carbon::parse($from)->startOfDay() : now()->subDays(29)->startOfDay();
            $finish = $to ? Carbon::parse($to)->endOfDay() : $end;

            if ($start->greaterThan($finish)) {
                return [$finish->copy()->startOfDay(), $start->copy()->endOfDay()];
            }

            return [$start, $finish];
        }

        $days = match ($period) {
            '7d' => 6,
            '90d' => 89,
            '365d' => 364,
            default => 29,
        };

        return [now()->subDays($days)->startOfDay(), $end];
    }

    private function buildTrend(Collection $rows, ?Carbon $from, ?Carbon $to): array
    {
        $points = [];

        foreach ($rows as $row) {
            if (! $row->day) {
                continue;
            }

            $day = Carbon::parse($row->day)->toDateString();
            $points[$day] = [
                'units' => (int) $row->units,
                'revenue' => (float) $row->revenue,
            ];
        }

        if ($points === [] && ($from === null || $to === null)) {
            return [];
        }

        $start = ($from ?? Carbon::parse(array_key_first($points)))->copy()->startOfDay();
        $end = ($to ?? Carbon::parse(array_key_last($points)))->copy()->startOfDay();

        if ($start->greaterThan($end)) {
            [$start, $end] = [$end->copy(), $start->copy()];
        }

        $span = (int) $start->diffInDays($end);
        $unit = $span > 120 ? 'month' : ($span > 45 ? 'week' : 'day');
        $cursor = $start->copy();

        if ($unit === 'week') {
            $cursor = $cursor->startOfWeek();
        }

        if ($unit === 'month') {
            $cursor = $cursor->startOfMonth();
        }

        $buckets = [];

        while ($cursor->lessThanOrEqualTo($end)) {
            [$key, $label] = match ($unit) {
                'month' => [$cursor->format('Y-m'), $cursor->format('M Y')],
                'week' => [$cursor->format('o-\WW'), $cursor->format('M j')],
                default => [$cursor->toDateString(), $cursor->format('M j')],
            };

            $buckets[$key] = [
                'label' => $label,
                'revenue' => 0.0,
                'units' => 0,
            ];

            $cursor = match ($unit) {
                'month' => $cursor->copy()->addMonth(),
                'week' => $cursor->copy()->addWeek(),
                default => $cursor->copy()->addDay(),
            };
        }

        foreach ($points as $day => $value) {
            $date = Carbon::parse($day);
            $key = match ($unit) {
                'month' => $date->format('Y-m'),
                'week' => $date->format('o-\WW'),
                default => $date->toDateString(),
            };

            if (! isset($buckets[$key])) {
                continue;
            }

            $buckets[$key]['revenue'] += $value['revenue'];
            $buckets[$key]['units'] += $value['units'];
        }

        return array_values(array_map(fn (array $bucket) => [
            'label' => $bucket['label'],
            'revenue' => round($bucket['revenue'], 2),
            'units' => $bucket['units'],
        ], $buckets));
    }

    private function ensurePermission(?User $user, string $permission): void
    {
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }
    }
}
