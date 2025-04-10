<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // if (env(key: 'APP_ENV') == 'local') {
        URL::forceScheme(scheme: 'https');
        // }
        Inertia::share([
            'apiUrl' => env('API_URL', 'http://localhost:8000'),
            'wsUrl' => env('WS_URL', 'ws://localhost:8000'),
            'flash' => function () {
                return [
                    'success' => session('success'),
                    'error' => session('error'),
                ];
            },
        ]);
    }
}
