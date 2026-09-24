<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'View Products', 'slug' => 'products.view', 'group' => 'products'],
            ['name' => 'Create Products', 'slug' => 'products.create', 'group' => 'products'],
            ['name' => 'Update Products', 'slug' => 'products.update', 'group' => 'products'],
            ['name' => 'Delete Products', 'slug' => 'products.delete', 'group' => 'products'],
            ['name' => 'View Orders', 'slug' => 'orders.view', 'group' => 'orders'],
            ['name' => 'Update Orders', 'slug' => 'orders.update', 'group' => 'orders'],
            ['name' => 'View Customers', 'slug' => 'customers.view', 'group' => 'customers'],
            ['name' => 'Update Customers', 'slug' => 'customers.update', 'group' => 'customers'],
            ['name' => 'View Reports', 'slug' => 'reports.view', 'group' => 'reports'],
            ['name' => 'Manage Settings', 'slug' => 'settings.manage', 'group' => 'settings'],
            ['name' => 'View Users', 'slug' => 'users.view', 'group' => 'users'],
            ['name' => 'Create Users', 'slug' => 'users.create', 'group' => 'users'],
            ['name' => 'Update Users', 'slug' => 'users.update', 'group' => 'users'],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'group' => 'users'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        $roles = [
            'super-admin' => [
                'name' => 'Super Admin',
                'description' => 'Full access to all V2005 admin features',
                'permissions' => Permission::query()->pluck('id')->all(),
            ],
            'admin' => [
                'name' => 'Admin',
                'description' => 'Manage catalog, orders, and customers',
                'permissions' => Permission::query()
                    ->whereIn('slug', [
                        'products.view',
                        'products.create',
                        'products.update',
                        'products.delete',
                        'orders.view',
                        'orders.update',
                        'customers.view',
                        'customers.update',
                        'reports.view',
                    ])
                    ->pluck('id')
                    ->all(),
            ],
            'staff' => [
                'name' => 'Staff',
                'description' => 'Limited operational access',
                'permissions' => Permission::query()
                    ->whereIn('slug', [
                        'products.view',
                        'orders.view',
                        'orders.update',
                        'customers.view',
                    ])
                    ->pluck('id')
                    ->all(),
            ],
            'customer' => [
                'name' => 'Customer',
                'description' => 'Storefront shopper with account access',
                'permissions' => [],
            ],
        ];

        foreach ($roles as $slug => $roleData) {
            $role = Role::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $roleData['name'],
                    'description' => $roleData['description'],
                ]
            );

            $role->permissions()->sync($roleData['permissions']);
        }
    }
}
