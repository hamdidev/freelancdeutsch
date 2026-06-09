<?php

namespace App\Http\Middleware;

use App\Services\UsageLimiter;
use Closure;
use Illuminate\Http\Request;

class CheckFeatureLimit
{
    public function __construct(private UsageLimiter $limiter) {}

    public function handle(Request $request, Closure $next, string $feature): mixed
    {
        if (! $this->limiter->can($feature)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'You have reached your monthly limit for this feature.',
                    'upgrade' => route('billing.plans'),
                ], 402);
            }

            return redirect()->route('billing.plans')
                ->withErrors(['limit' => 'You have reached your monthly limit. Upgrade to continue.']);
        }

        return $next($request);
    }
}
