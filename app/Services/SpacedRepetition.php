<?php

namespace App\Services;

use App\Models\SrsReview;
use App\Models\VocabularyCard;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class SpacedRepetition
{
    // Quality ratings map to SM-2 quality values
    const AGAIN = 0;

    const HARD = 1;

    const GOOD = 2;

    const EASY = 3;

    public function review(VocabularyCard $card, int $quality): VocabularyCard
    {
        $easeBefore = $card->ease_factor;
        $intervalBefore = $card->interval;

        // SM-2 algorithm
        if ($quality < self::GOOD) {
            // Failed — reset repetitions
            $card->repetitions = 0;
            $card->interval = 1;
        } else {
            // Passed — calculate next interval
            $card->interval = match ($card->repetitions) {
                0 => 1,
                1 => 6,
                default => (int) round($card->interval * $card->ease_factor),
            };
            $card->repetitions++;
        }

        // Update ease factor (minimum 1.3)
        $card->ease_factor = max(
            1.3,
            $card->ease_factor + (0.1 - (3 - $quality) * (0.08 + (3 - $quality) * 0.02))
        );

        $card->next_review_at = Carbon::now()->addDays($card->interval);
        $card->last_reviewed_at = Carbon::now();
        $card->save();

        // Log the review
        SrsReview::create([
            'user_id' => $card->user_id,
            'card_id' => $card->id,
            'quality' => $quality,
            'ease_factor_before' => $easeBefore,
            'ease_factor_after' => $card->ease_factor,
            'interval_before' => $intervalBefore,
            'interval_after' => $card->interval,
        ]);

        return $card;
    }

    public function dueCards(int $userId, ?string $domain = null, int $limit = 20): Collection
    {
        return VocabularyCard::where('user_id', $userId)
            ->where(function ($query) {
                $query->whereNull('next_review_at')
                    ->orWhere('next_review_at', '<=', now());
            })
            ->when($domain, fn ($q) => $q->where('domain', $domain))
            ->orderBy('next_review_at')
            ->limit($limit)
            ->get();
    }

    public function stats(int $userId): array
    {
        $cards = VocabularyCard::where('user_id', $userId);

        return [
            'total' => $cards->count(),
            'due' => (clone $cards)->where('next_review_at', '<=', now())->count(),
            'mastered' => (clone $cards)->where('repetitions', '>=', 5)->count(),
            'new' => (clone $cards)->whereNull('next_review_at')->count(),
            'by_domain' => VocabularyCard::where('user_id', $userId)
                ->selectRaw('domain, count(*) as total, sum(case when repetitions >= 5 then 1 else 0 end) as mastered')
                ->groupBy('domain')
                ->get(),
        ];
    }
}
