<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::where('is_active', true)->get();
        $user = Auth::user();

        return Inertia::render('Billing/Plans', [
            'plans' => $plans,
            'currentPlan' => $user?->plan,
            'onGracePeriod' => $user?->subscription('default')?->onGracePeriod(),
            'subscriptionEnds' => $user?->subscription('default')?->ends_at,
        ]);
    }

    public function checkout(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $request->validate(['plan' => ['required', 'in:pro,agency']]);

        $plan = Plan::where('slug', $request->plan)->firstOrFail();

        try {
            $checkout = auth()->user()
                ->newSubscription('default', $plan->stripe_price_id)
                ->checkout([
                    'success_url' => route('billing.success').'?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => route('billing.plans'),
                    'metadata' => ['plan' => $plan->slug],
                ]);

            return Inertia::location($checkout->url);
        } catch (\Exception $e) {
            return back()->withErrors(['billing' => 'Could not initiate checkout. Please try again.']);
        }
    }

    public function success(Request $request): Response
    {
        return Inertia::render('Billing/Success', [
            'plan' => auth()->user()->plan,
        ]);
    }

    public function cancel(): RedirectResponse
    {
        $subscription = auth()->user()->subscription('default');

        if ($subscription && ! $subscription->onGracePeriod()) {
            $subscription->cancel();
        }

        return back()->with('status', 'Subscription cancelled. You have access until the end of your billing period.');
    }

    public function resume(): RedirectResponse
    {
        $subscription = auth()->user()->subscription('default');

        if ($subscription?->onGracePeriod()) {
            $subscription->resume();
        }

        return back()->with('status', 'Subscription resumed successfully.');
    }

    public function portal(): RedirectResponse
    {
        return auth()->user()->redirectToBillingPortal(route('billing.plans'));
    }
}
