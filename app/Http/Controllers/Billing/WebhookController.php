<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    // Fired when checkout completes — set the plan on the user
    public function handleCheckoutSessionCompleted(array $payload): \Symfony\Component\HttpFoundation\Response
    {
        $session  = $payload['data']['object'];
        $metadata = $session['metadata'] ?? [];

        if (isset($metadata['plan']) && isset($session['customer'])) {
            User::where('stripe_id', $session['customer'])
                ->update(['plan' => $metadata['plan']]);
        }

        return $this->successMethod();
    }

    // Fired when subscription is cancelled at period end
    public function handleCustomerSubscriptionDeleted(array $payload): \Symfony\Component\HttpFoundation\Response
    {
        $stripeCustomerId = $payload['data']['object']['customer'];

        User::where('stripe_id', $stripeCustomerId)
            ->update(['plan' => 'free']);

        return $this->successMethod();
    }

    // Fired on successful renewal
    public function handleInvoicePaymentSucceeded(array $payload): \Symfony\Component\HttpFoundation\Response
    {
        // Optionally send a receipt email here via a queued job
        return $this->successMethod();
    }
}
