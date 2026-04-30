<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WeeklyProgressMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public array $stats,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ihre Woche bei FreelancDeutsch 📊',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.weekly-progress',
            with: [
                'user' => $this->user,
                'stats' => $this->stats,
            ],
        );
    }
}
