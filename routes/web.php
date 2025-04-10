<?php

use App\Http\Controllers\Attendance\AttendanceDailyController;
use App\Http\Controllers\Attendance\FacialPhotoController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\VoucherController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Attendance
    Route::prefix('/attendance')->group(function () {
        Route::resource('facial-photo', FacialPhotoController::class);
        Route::resource('attendance-daily', AttendanceDailyController::class);
    });

    // Role & Permission
    Route::prefix('/role-permission')->group(function () {
        Route::resource('permissions', PermissionController::class);
    });

    // Voucher
    Route::resource('voucher', VoucherController::class);

    // Transaction
    Route::resource('transaction', TransactionController::class);
    Route::get('buy', [TransactionController::class, 'buy']);

    //TEST ROUTE
    Route::get('test', [PermissionController::class, 'test']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
