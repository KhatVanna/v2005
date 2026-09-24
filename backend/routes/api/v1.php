<?php

use App\Http\Controllers\Api\V1\Account\AddressController as AccountAddressController;
use App\Http\Controllers\Api\V1\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Api\V1\Account\ProfileController;
use App\Http\Controllers\Api\V1\Admin\CustomerController;
use App\Http\Controllers\Api\V1\Admin\MediaController;
use App\Http\Controllers\Api\V1\Admin\OrderController;
use App\Http\Controllers\Api\V1\Admin\ProductController;
use App\Http\Controllers\Api\V1\Admin\ProductImageController;
use App\Http\Controllers\Api\V1\Admin\ReportController;
use App\Http\Controllers\Api\V1\Admin\SettingController;
use App\Http\Controllers\Api\V1\Admin\UserController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->prefix('account')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::put('/password', [ProfileController::class, 'updatePassword']);

    Route::get('/addresses', [AccountAddressController::class, 'index']);
    Route::post('/addresses', [AccountAddressController::class, 'store']);
    Route::put('/addresses/{address}', [AccountAddressController::class, 'update']);
    Route::patch('/addresses/{address}', [AccountAddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AccountAddressController::class, 'destroy']);

    Route::get('/orders', [AccountOrderController::class, 'index']);
    Route::get('/orders/{order}', [AccountOrderController::class, 'show']);
});

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/catalog/options', [ProductController::class, 'options']);
    Route::post('/media/cloudinary-signature', [MediaController::class, 'cloudinarySignature']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::post('/products/{product}/images', [ProductImageController::class, 'store']);
    Route::delete('/products/{product}/images/{image}', [ProductImageController::class, 'destroy']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::patch('/orders/{order}', [OrderController::class, 'update']);

    Route::get('/reports/products', [ReportController::class, 'products']);

    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update']);
    Route::patch('/customers/{customer}', [CustomerController::class, 'update']);

    Route::get('/users/options', [UserController::class, 'options']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::patch('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::get('/settings', [SettingController::class, 'show']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::patch('/settings', [SettingController::class, 'update']);
});
