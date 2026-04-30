<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VocabularyCard;
use App\Services\SpacedRepetition;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SrsTest extends TestCase
{
    use RefreshDatabase;

    public function test_sm2_increases_interval_on_good_review(): void
    {
        $user = User::factory()->create();
        $card = VocabularyCard::factory()->for($user)->create([
            'ease_factor' => 2.5,
            'interval' => 1,
            'repetitions' => 0,
        ]);

        $srs = new SpacedRepetition;
        $srs->review($card, SpacedRepetition::GOOD);

        $card->refresh();

        $this->assertEquals(1, $card->repetitions);
        $this->assertGreaterThan(0, $card->interval);
        $this->assertNotNull($card->next_review_at);
    }

    public function test_sm2_resets_interval_on_again(): void
    {
        $user = User::factory()->create();
        $card = VocabularyCard::factory()->for($user)->create([
            'ease_factor' => 2.5,
            'interval' => 10,
            'repetitions' => 5,
        ]);

        $srs = new SpacedRepetition;
        $srs->review($card, SpacedRepetition::AGAIN);

        $card->refresh();

        $this->assertEquals(0, $card->repetitions);
        $this->assertEquals(1, $card->interval);
    }

    public function test_review_is_logged_in_srs_reviews(): void
    {
        $user = User::factory()->create();
        $card = VocabularyCard::factory()->for($user)->create();

        $srs = new SpacedRepetition;
        $srs->review($card, SpacedRepetition::EASY);

        $this->assertDatabaseHas('srs_reviews', [
            'user_id' => $user->id,
            'card_id' => $card->id,
            'quality' => SpacedRepetition::EASY,
        ]);
    }

    public function test_due_cards_returns_only_due_cards(): void
    {
        $user = User::factory()->create();

        // Due card
        VocabularyCard::factory()->for($user)->create([
            'next_review_at' => now()->subDay(),
        ]);

        // Not due card
        VocabularyCard::factory()->for($user)->create([
            'next_review_at' => now()->addDays(5),
        ]);

        $srs = new SpacedRepetition;
        $due = $srs->dueCards($user->id);

        $this->assertCount(1, $due);
    }
}
