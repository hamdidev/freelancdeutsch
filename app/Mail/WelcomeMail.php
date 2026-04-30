<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class WelcomeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Pass scalar values instead of the full User model.
     * Avoids serialization issues and stale model data in queued jobs.
     */
    public function __construct(
        public int $userId,
        public string $userName,
        public string $userEmail,
        public string $userLocale = 'de',
    ) {}

    public function envelope(): Envelope
    {
        $subject = $this->userLocale === 'en'
            ? 'Welcome to FreelancDeutsch 🇩🇪'
            : 'Willkommen bei FreelancDeutsch 🇩🇪';

        return new Envelope(
            from: new Address(
                address: config('mail.from.address', 'noreply@freelancdeutsch.de'),
                name: config('mail.from.name', 'FreelancDeutsch'),
            ),
            subject: $subject,
            tags: ['welcome', 'onboarding'],
            metadata: [
                'user_id' => $this->userId,
                'locale' => $this->userLocale,
            ],
        );
    }

    public function content(): Content
    {
        // Re-fetch fresh user data when the job is actually processed.
        // The user may have updated their profile between queue dispatch and execution.
        $user = User::find($this->userId);

        if (! $user) {
            Log::warning('WelcomeMail: user not found at send time — job discarded', [
                'user_id' => $this->userId,
                'email' => $this->userEmail,
            ]);

            // Silently discard the job — no retry needed.
            // User deleted their account before the email was sent.
            $this->delete();

            // Return a minimal content so Laravel doesn't throw.
            // This will never actually be sent since delete() was called.
            return new Content(
                markdown: 'emails.welcome',
                with: [
                    'user' => null,
                    'dashboardUrl' => route('dashboard'),
                    'billingUrl' => route('billing.plans'),
                    'studyUrl' => route('language.index'),
                ],
            );
        }

        return new Content(
            markdown: 'emails.welcome',
            with: [
                'user' => $user,
                'dashboardUrl' => route('dashboard'),
                'billingUrl' => route('billing.plans'),
                'studyUrl' => route('language.index'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
