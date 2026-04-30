<?php

namespace App\Console\Commands;

use App\Mail\WeeklyProgressMail;
use App\Models\Application;
use App\Models\Document;
use App\Models\SrsReview;
use App\Models\User;
use App\Models\WritingSession;
use App\Services\SpacedRepetition;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendWeeklyProgress extends Command
{
    protected $signature = 'email:weekly-progress';

    protected $description = 'Send weekly progress emails to all active users';

    public function handle(SpacedRepetition $srs): int
    {
        $users = User::where('onboarding_complete', true)
            ->where('created_at', '<', now()->subDays(3))
            ->cursor();

        $sent = 0;

        foreach ($users as $user) {
            $stats = [
                'cards_reviewed' => SrsReview::where('user_id', $user->id)
                    ->whereBetween('created_at', [now()->subWeek(), now()])
                    ->count(),
                'writing_sessions' => WritingSession::where('user_id', $user->id)
                    ->whereBetween('created_at', [now()->subWeek(), now()])
                    ->count(),
                'avg_score' => WritingSession::where('user_id', $user->id)
                    ->whereBetween('created_at', [now()->subWeek(), now()])
                    ->avg('score'),
                'documents_created' => Document::where('user_id', $user->id)
                    ->whereBetween('created_at', [now()->subWeek(), now()])
                    ->count(),
                'applications' => Application::where('user_id', $user->id)
                    ->whereBetween('created_at', [now()->subWeek(), now()])
                    ->count(),
                'cards_due' => $srs->dueCards($user->id)->count(),
            ];

            // Only send if user was active this week
            $wasActive = $stats['cards_reviewed'] > 0
                || $stats['writing_sessions'] > 0
                || $stats['documents_created'] > 0;

            if ($wasActive) {
                Mail::to($user->email)->queue(new WeeklyProgressMail($user, $stats));
                $sent++;
            }
        }

        $this->info("Weekly progress emails queued: {$sent}");

        return Command::SUCCESS;
    }
}
