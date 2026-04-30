<?php

namespace App\Http\Controllers\Language;

use App\Http\Controllers\Controller;
use App\Models\VocabularyCard;
use App\Services\SpacedRepetition;
use Inertia\Inertia;
use Inertia\Response;

class VocabularyController extends Controller
{
    public function __construct(private SpacedRepetition $srs) {}

    public function index(): Response
    {
        $user = auth()->user();
        $stats = $this->srs->stats($user->id);

        return Inertia::render('Language/Vocabulary', [
            'stats' => $stats,
            'dueCards' => $this->srs->dueCards($user->id, limit: 5),
            'userDomain' => $user->freelance_domain,
        ]);
    }

    public function study(?string $domain = null): Response
    {
        $user = auth()->user();
        $domain = $domain ?? $user->freelance_domain;

        // Copy system cards to user if not already done
        $this->seedUserCards($user->id, $domain);

        $cards = $this->srs->dueCards($user->id, $domain);

        return Inertia::render('Language/Study', [
            'cards' => $cards,
            'domain' => $domain,
        ]);
    }

    private function seedUserCards(int $userId, string $domain): void
    {
        $systemCards = VocabularyCard::where('is_system', true)
            ->where('domain', $domain)
            ->get();

        if ($systemCards->isEmpty()) {
            return;
        }

        $existingTerms = VocabularyCard::where('user_id', $userId)
            ->where('domain', $domain)
            ->whereIn('term_de', $systemCards->pluck('term_de'))
            ->pluck('term_de')
            ->all();

        $now = now();
        $newCards = $systemCards
            ->reject(fn ($c) => in_array($c->term_de, $existingTerms))
            ->map(fn ($c) => [
                'user_id' => $userId,
                'term_de' => $c->term_de,
                'term_en' => $c->term_en,
                'example_de' => $c->example_de,
                'example_en' => $c->example_en,
                'domain' => $domain,
                'level' => $c->level,
                'is_system' => false,
                'ease_factor' => 2.50,
                'interval' => 1,
                'repetitions' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->values()
            ->toArray();

        if (! empty($newCards)) {
            VocabularyCard::insert($newCards);
        }
    }
}
