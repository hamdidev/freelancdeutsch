<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index(): \Inertia\Response
    {
        $plans = Plan::where('is_active', true)->get();
        $user = Auth::user();

        return Inertia::render('Billing/Plans', [
            'plans'           => $plans,
            'currentPlan'     => $user?->plan,
            'onGracePeriod'   => $user?->subscription('default')?->onGracePeriod(),
            'subscriptionEnds' => $user?->subscription('default')?->ends_at,
        ]);
    }
    public function checkout(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate(['plan' => ['required', 'in:pro,agency']]);

        $plan = Plan::where('slug', $request->plan)->firstOrFail();

        try {
            $checkout = auth()->user()
                ->newSubscription('default', $plan->stripe_price_id)
                ->checkout([
                    'success_url' => route('billing.success') . '?session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url'  => route('billing.plans'),
                    'metadata'    => ['plan' => $plan->slug],
                ]);

            return redirect($checkout->url);
        } catch (\Exception $e) {
            return back()->withErrors(['billing' => 'Could not initiate checkout. Please try again.']);
        }
    }
    public function success(Request $request): \Inertia\Response
    {
        return Inertia::render('Billing/Success', [
            'plan' => auth()->user()->plan,
        ]);
    }

    public function cancel(): \Illuminate\Http\RedirectResponse
    {
        $subscription = auth()->user()->subscription('default');

        if ($subscription && ! $subscription->onGracePeriod()) {
            $subscription->cancel();
        }

        return back()->with('status', 'Subscription cancelled. You have access until the end of your billing period.');
    }

    public function resume(): \Illuminate\Http\RedirectResponse
    {
        $subscription = auth()->user()->subscription('default');

        if ($subscription?->onGracePeriod()) {
            $subscription->resume();
        }

        return back()->with('status', 'Subscription resumed successfully.');
    }

    public function portal(): \Illuminate\Http\RedirectResponse
    {
        return auth()->user()->redirectToBillingPortal(route('billing.plans'));
    }
}
