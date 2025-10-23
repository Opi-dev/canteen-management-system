<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\OrderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| এই ফাইলে তোমার সব API রাউটগুলো থাকবে।
| Public route (যা টোকেন ছাড়া এক্সেস করা যায়) এবং Protected route (auth:sanctum)
| আলাদা করে রাখা হয়েছে।
|
*/

// 🔹 Public Login Route
Route::post('/login', [AuthController::class, 'login']);

// 🔹 Public voucher download route (optional: make protected if needed)
Route::get('/orders/{id}/voucher', [OrderController::class, 'generateVoucher']);

// 🔹 Sales Report Routes (✅ Newly Added)
Route::get('/reports/daily', [OrderController::class, 'dailyReport']);
Route::get('/reports/monthly', [OrderController::class, 'monthlyReport']);

// 🔹 Protected routes (require token)
Route::middleware('auth:sanctum')->group(function () {

    // 🔸 Auth Management
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // 🔸 Menu Management
    Route::apiResource('menu-items', MenuItemController::class);
     Route::get('/menu-items', [MenuItemController::class, 'index']);

    // ✅ Stock & Availability Update Routes
    Route::put('/menu-items/{id}/stock', [MenuItemController::class, 'updateStock']);
    Route::put('/menu-items/{id}/availability', [MenuItemController::class, 'updateAvailability']);

    // 🔸 Order Management
    Route::apiResource('orders', OrderController::class);

    // 🔸 User Management
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});
