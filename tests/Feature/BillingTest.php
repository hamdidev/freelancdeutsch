<?php

// tests/Feature/BillingTest.php

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\UsageCounter;
use App\Models\User;
use App\Services\UsageLimiter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingTest extends TestCase
{
    use RefreshDatabase;

    public function test_billing_plans_page_renders(): void
    {
        $user = User::factory()->create();
        Plan::factory()->create(['slug' => 'free',   'price_cents' => 0]);
        Plan::factory()->create(['slug' => 'pro',    'price_cents' => 1200]);
        Plan::factory()->create(['slug' => 'agency', 'price_cents' => 3900]);

        $this->actingAs($user)
            ->get(route('billing.plans'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Billing/Plans'));
    }

    public function test_guest_is_redirected_from_billing(): void
    {
        $this->get(route('billing.plans'))->assertRedirect(route('login'));
    }

    public function test_usage_limiter_blocks_free_user_at_limit(): void
    {
        $user = User::factory()->create(['plan' => 'free']);
        Plan::factory()->create([
            'slug' => 'free',
            'limits' => ['ai_writing' => 3, 'documents' => 2, 'vocab_cards' => 20],
        ]);

        UsageCounter::create([
            'user_id' => $user->id,
            'feature' => 'ai_writing',
            'count' => 3,
            'period' => now()->startOfMonth()->toDateString(),
        ]);

        $limiter = new UsageLimiter($user);

        $this->assertFalse($limiter->can('ai_writing'));
        $this->assertEquals(0, $limiter->remaining('ai_writing'));
    }

    public function test_pro_user_has_unlimited_usage(): void
    {
        $user = User::factory()->create(['plan' => 'pro']);
        Plan::factory()->create([
            'slug' => 'pro',
            'limits' => ['ai_writing' => -1, 'documents' => -1, 'vocab_cards' => -1],
        ]);

        $limiter = new UsageLimiter($user);

        $this->assertTrue($limiter->can('ai_writing'));
        $this->assertEquals('unlimited', $limiter->remaining('ai_writing'));
    }
}
