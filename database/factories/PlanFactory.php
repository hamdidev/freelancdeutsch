<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Plan>
 */
class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Free',
            'slug' => 'free',
            'price_cents' => 0,
            'currency' => 'eur',
            'limits' => ['ai_writing' => 3, 'documents' => 2, 'vocab_cards' => 20],
            'features' => ['srs', 'document_generator', 'job_feed_readonly'],
            'is_active' => true,
        ];
    }
}
