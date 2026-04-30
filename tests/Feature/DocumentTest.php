<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Plan;
use App\Models\UsageCounter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        Plan::factory()->create([
            'slug' => 'pro',
            'limits' => ['ai_writing' => -1, 'documents' => -1, 'vocab_cards' => -1],
        ]);
        Plan::factory()->create([
            'slug' => 'free',
            'limits' => ['ai_writing' => 3, 'documents' => 2, 'vocab_cards' => 20],
        ]);
        $this->user = User::factory()->create(['plan' => 'pro']);
        $this->actingAs($this->user);
    }

    public function test_user_can_view_documents_index(): void
    {
        $this->get(route('documents.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Documents/Index'));
    }

    public function test_user_can_create_invoice(): void
    {
        $this->post(route('documents.store'), [
            'type' => 'invoice',
            'recipient_name' => 'Test GmbH',
            'issued_at' => now()->toDateString(),
            'tax_rate' => 19,
            'payment_terms' => 14,
            'items' => [
                [
                    'description' => 'Laravel development',
                    'quantity' => 10,
                    'unit' => 'Std.',
                    'unit_price' => 95,
                ],
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('documents', [
            'user_id' => $this->user->id,
            'type' => 'invoice',
            'recipient_name' => 'Test GmbH',
        ]);
    }

    public function test_invoice_number_is_sequential(): void
    {
        $payload = [
            'type' => 'invoice',
            'recipient_name' => 'Client A',
            'issued_at' => now()->toDateString(),
            'tax_rate' => 19,
            'items' => [['description' => 'Work', 'quantity' => 1, 'unit' => 'Std.', 'unit_price' => 100]],
        ];

        $this->post(route('documents.store'), $payload);
        $this->post(route('documents.store'), $payload);

        $numbers = Document::where('user_id', $this->user->id)
            ->pluck('number')
            ->toArray();

        $this->assertContains('INV-'.now()->year.'-0001', $numbers);
        $this->assertContains('INV-'.now()->year.'-0002', $numbers);
    }

    public function test_user_cannot_view_another_users_document(): void
    {
        $other = User::factory()->create();
        $doc = Document::factory()->for($other)->create();

        $this->get(route('documents.show', $doc))->assertForbidden();
    }

    public function test_finalised_document_cannot_be_deleted(): void
    {
        $doc = Document::factory()->for($this->user)->create([
            'finalised_at' => now(),
            'gobd_hash' => 'abc123',
        ]);

        $this->delete(route('documents.destroy', $doc))
            ->assertRedirect();

        $this->assertNotSoftDeleted('documents', ['id' => $doc->id]);
    }

    public function test_free_plan_enforces_document_limit(): void
    {
        $this->user->update(['plan' => 'free']);

        // Use up the free limit (2 documents)
        UsageCounter::create([
            'user_id' => $this->user->id,
            'feature' => 'documents',
            'count' => 2,
            'period' => now()->startOfMonth()->toDateString(),
        ]);

        $this->post(route('documents.store'), [
            'type' => 'invoice',
            'recipient_name' => 'Test',
            'issued_at' => now()->toDateString(),
            'tax_rate' => 19,
            'items' => [['description' => 'Work', 'quantity' => 1, 'unit' => 'Std.', 'unit_price' => 100]],
        ])->assertRedirect(route('billing.plans'));
    }
}
