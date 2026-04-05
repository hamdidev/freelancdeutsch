<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name'            => 'Free',
                'slug'            => 'free',
                'stripe_price_id' => null,
                'price_cents'     => 0,
                'currency'        => 'eur',
                'limits'          => [
                    'ai_writing'  => 3,
                    'documents'   => 2,
                    'vocab_cards' => 20,
                ],
                'features'        => ['srs', 'document_generator', 'job_feed_readonly'],
            ],
            [
                'name'            => 'Pro',
                'slug'            => 'pro',
                'stripe_price_id' => env('STRIPE_PRICE_PRO'),
                'price_cents'     => 1200,
                'currency'        => 'eur',
                'limits'          => [
                    'ai_writing'  => -1,   // -1 = unlimited
                    'documents'   => -1,
                    'vocab_cards' => -1,
                ],
                'features'        => ['srs', 'document_generator', 'job_feed', 'cv_adapter', 'bewerbung'],
            ],
            [
                'name'            => 'Agency',
                'slug'            => 'agency',
                'stripe_price_id' => env('STRIPE_PRICE_AGENCY'),
                'price_cents'     => 3900,
                'currency'        => 'eur',
                'limits'          => [
                    'ai_writing'  => -1,
                    'documents'   => -1,
                    'vocab_cards' => -1,
                ],
                'features'        => ['srs', 'document_generator', 'job_feed', 'cv_adapter', 'bewerbung', 'team_seats', 'white_label'],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }
    }
}
