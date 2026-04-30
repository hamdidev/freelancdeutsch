<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
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
            'type' => 'invoice',
            'status' => 'draft',
            'number' => 'INV-'.now()->year.'-'.fake()->unique()->numberBetween(1, 9999),
            'sender_name' => fake()->name(),
            'sender_address' => fake()->address(),
            'sender_email' => fake()->email(),
            'recipient_name' => fake()->company(),
            'subtotal' => 950.00,
            'tax_rate' => 19.00,
            'tax_amount' => 180.50,
            'total' => 1130.50,
            'currency' => 'EUR',
            'issued_at' => now(),
        ];
    }
}
