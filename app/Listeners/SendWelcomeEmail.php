<?php

namespace App\Listeners;

use App\Mail\WelcomeMail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Mail;

class SendWelcomeEmail
{
    public function handle(Registered $event): void
    {
        Mail::to($event->user->email)
            ->later(now()->addMinutes(5), new WelcomeMail(
                userId: $event->user->id,
                userName: $event->user->name,
                userEmail: $event->user->email,
            ));
    }
}
