<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\CvProfile;
use App\Models\Document;
use App\Policies\ClientPolicy;
use App\Policies\CvProfilePolicy;
use App\Policies\DocumentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * Laravel auto-discovers policies in app/Policies/ that follow
     * the {Model}Policy naming convention. Manual registration is
     * only needed for non-standard setups.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Option A: Remove these lines to use auto-discovery (recommended)
        // Document::class => DocumentPolicy::class,
        // Client::class => ClientPolicy::class,

        // Option B: Keep explicit registration for IDE support (your choice)
        Document::class => DocumentPolicy::class,
        Client::class => ClientPolicy::class,
        CvProfile::class => CvProfilePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function register(): void
    {
        // If using auto-discovery (Option A above), leave empty:
        // Laravel will automatically map Document → DocumentPolicy, etc.

        // If using explicit registration (Option B), add:
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }

    /**
     * Bootstrap any authentication / authorization services.
     */
    public function boot(): void
    {
        // Critical: Registers all policies (auto-discovered + manual)
        $this->registerPolicies();

        // ─────────────────────────────────────────────────────────────
        // Custom Gates (non-model abilities)
        // ─────────────────────────────────────────────────────────────

        // Example: Export GoBD-compliant reports
        Gate::define('export-gobd-reports', function ($user) {
            return $user->hasRole('accountant')
                || $user->hasRole('admin')
                || $user->hasPermission('gobd.export');
        });

        // Example: Manage billing/subscriptions
        Gate::define('manage-billing', function ($user) {
            return $user->hasRole('admin')
                || $user->hasPermission('billing.manage');
        });

        // Example: View audit logs (GoBD requirement)
        Gate::define('view-audit-logs', function ($user) {
            return $user->hasRole('admin')
                || $user->hasRole('auditor');
        });
    }
}
