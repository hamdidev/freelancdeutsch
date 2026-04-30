<?php

namespace App\Providers;

use App\Listeners\SendWelcomeEmail;
use App\Models\Client;
use App\Models\CvProfile;
use App\Models\Document;
use App\Policies\ClientPolicy;
use App\Policies\CvProfilePolicy;
use App\Policies\DocumentPolicy;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        Cashier::ignoreRoutes();
        Gate::policy(Document::class, DocumentPolicy::class);
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(CvProfile::class, CvProfilePolicy::class);
        Event::listen(Registered::class, SendWelcomeEmail::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
