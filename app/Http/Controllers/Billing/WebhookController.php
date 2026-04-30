<?php

namespace App\Http\Controllers\Billing;

use App\Models\User;
use Laravel\Cashier\Http\Controllers\WebhookController as CashierWebhookController;
use Symfony\Component\HttpFoundation\Response;

class WebhookController extends CashierWebhookController
{
    // Fired when checkout completes — set the plan on the user
    public function handleCheckoutSessionCompleted(array $payload): Response
    {
        $session = $payload['data']['object'];
        $metadata = $session['metadata'] ?? [];

        if (isset($metadata['plan']) && isset($session['customer'])) {
            User::where('stripe_id', $session['customer'])
                ->update(['plan' => $metadata['plan']]);
        }

        return $this->successMethod();
    }

    // Fired when subscription is cancelled at period end
    public function handleCustomerSubscriptionDeleted(array $payload): Response
    {
        $stripeCustomerId = $payload['data']['object']['customer'];

        User::where('stripe_id', $stripeCustomerId)
            ->update(['plan' => 'free']);

        return $this->successMethod();
    }

    // Fired on successful renewal
    public function handleInvoicePaymentSucceeded(array $payload): Response
    {
        // Optionally send a receipt email here via a queued job
        return $this->successMethod();
    }
}
