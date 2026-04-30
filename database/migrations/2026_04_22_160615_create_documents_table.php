<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();

            $table->string('type');                          // 'invoice', 'proposal', 'contract'
            $table->string('status')->default('draft');      // draft, sent, paid, cancelled
            $table->string('number')->unique();              // e.g. INV-2024-0001
            $table->string('locale')->default('de');

            // Sender snapshot (frozen at creation — GoBD requirement)
            $table->string('sender_name');
            $table->text('sender_address');
            $table->string('sender_email');
            $table->string('sender_steuernummer')->nullable();
            $table->string('sender_ust_id')->nullable();

            // Recipient snapshot
            $table->string('recipient_name');
            $table->string('recipient_company')->nullable();
            $table->text('recipient_address')->nullable();
            $table->string('recipient_ust_id')->nullable();

            // Financials
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(19.00);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('currency')->default('EUR');

            // German-specific
            $table->boolean('is_kleinunternehmer')->default(false); // §19 UStG
            $table->boolean('is_reverse_charge')->default(false);
            $table->string('payment_terms')->default('14');         // days
            $table->text('notes')->nullable();
            $table->text('footer')->nullable();

            // Dates
            $table->date('issued_at');
            $table->date('due_at')->nullable();
            $table->date('paid_at')->nullable();

            // GoBD immutability
            $table->string('gobd_hash')->nullable();         // SHA-256 of document content
            $table->string('gobd_prev_hash')->nullable();    // previous document hash (chain)
            $table->timestamp('finalised_at')->nullable();   // locked when sent/finalised

            // PDF
            $table->string('pdf_path')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'type', 'status']);
            $table->index(['user_id', 'issued_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
