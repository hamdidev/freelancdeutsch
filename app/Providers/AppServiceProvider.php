<?php

namespace App\Providers;

use App\Listeners\SendWelcomeEmail;
use App\Models\Client;
use App\Models\CvProfile;
use App\Models\Document;
use App\Policies\ClientPolicy;
use App\Policies\CvProfilePolicy;
use App\Policies\DocumentPolicy;
use App\Services\UsageLimiter;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        Cashier::ignoreRoutes();

        Gate::policy(Document::class, DocumentPolicy::class);
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(CvProfile::class, CvProfilePolicy::class);

        $this->app->bind(UsageLimiter::class, fn () => new UsageLimiter(Auth::user()));

        Event::listen(Registered::class, SendWelcomeEmail::class);
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::define('export-gobd-reports', fn ($user) => $user->hasRole('accountant') || $user->hasRole('admin'));
        Gate::define('manage-billing', fn ($user) => $user->hasRole('admin'));
        Gate::define('view-audit-logs', fn ($user) => $user->hasRole('admin') || $user->hasRole('auditor'));
    }
}
