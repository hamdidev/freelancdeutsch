<?php

namespace App\Console\Commands;

use App\Mail\UpgradeNudgeMail;
use App\Models\User;
use App\Services\UsageLimiter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class NudgeUsersAtLimit extends Command
{
    protected $signature = 'email:nudge-limits';

    protected $description = 'Send upgrade nudge to free users near their monthly limits';

    public function handle(): int
    {
        $features = ['ai_writing', 'documents', 'vocab_cards'];
        $nudged = 0;

        User::where('plan', 'free')
            ->where('onboarding_complete', true)
            ->cursor()
            ->each(function (User $user) use ($features, &$nudged) {
                $limiter = new UsageLimiter($user);

                foreach ($features as $feature) {
                    $remaining = $limiter->remaining($feature);

                    // Nudge when 1 use remaining
                    if ($remaining === 1) {
                        $cacheKey = "nudge_sent:{$user->id}:{$feature}:".now()->format('Y-m');

                        if (! cache()->has($cacheKey)) {
                            Mail::to($user->email)->queue(
                                new UpgradeNudgeMail($user, $feature, $remaining)
                            );
                            cache()->put($cacheKey, true, now()->addMonth());
                            $nudged++;
                        }

                        break; // One nudge per user per run
                    }
                }
            });

        $this->info("Upgrade nudge emails queued: {$nudged}");

        return Command::SUCCESS;
    }
}
