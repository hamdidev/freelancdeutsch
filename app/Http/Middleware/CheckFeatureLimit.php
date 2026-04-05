<?php

namespace App\Http\Middleware;

use App\Services\UsageLimiter;
use Closure;
use Illuminate\Http\Request;

class CheckFeatureLimit
{
    public function handle(Request $request, Closure $next, string $feature): mixed
    {
        $limiter = new UsageLimiter($request->user());

        if (! $limiter->can($feature)) {
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
