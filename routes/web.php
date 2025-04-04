<?php

use App\Http\Controllers\PermissionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::prefix('/role-permission')->group(function () {
        Route::resource('permissions', PermissionController::class);
    });
    Route::get('test', [PermissionController::class, 'test']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
