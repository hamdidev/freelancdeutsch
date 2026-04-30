<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VocabularyCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VocabularyCard>
 */
class VocabularyCardFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'term_de' => fake()->word(),
            'term_en' => fake()->word(),
            'domain' => fake()->randomElement(['it', 'legal', 'finance', 'communication']),
            'level' => fake()->randomElement(['A2', 'B1', 'B2']),
            'is_system' => false,
            'ease_factor' => 2.50,
            'interval' => 1,
            'repetitions' => 0,
        ];
    }
}
