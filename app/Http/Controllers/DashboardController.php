<?php

namespace App\Http\Controllers;

use App\Models\WritingSession;
use App\Services\SpacedRepetition;
use App\Services\UsageLimiter;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(SpacedRepetition $srs): Response
    {
        $user = auth()->user();
        $limiter = new UsageLimiter($user);

        return Inertia::render('Dashboard', [
            'user' => $user->only([
                'name',
                'plan',
                'german_level',
                'freelance_domain',
                'onboarding_complete',
            ]),
            'usage' => $limiter->summary(),
            'srsStats' => $srs->stats($user->id),
            'recentSessions' => WritingSession::where('user_id', $user->id)
                ->latest()
                ->limit(5)
                ->get(['id', 'score', 'domain', 'created_at']),
        ]);
    }
}
