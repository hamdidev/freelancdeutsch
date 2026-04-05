<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingComplete
{
    private array $except = [
        'onboarding',
        'onboarding.store',
        'logout',
        'billing.*',
    ];

    public function handle(Request $request, Closure $next): mixed
    {
        $user = $request->user();

        if ($user && ! $user->onboarding_complete) {
            if (! $request->routeIs(...$this->except)) {
                return redirect()->route('onboarding');
            }
        }

        return $next($request);
    }
}
