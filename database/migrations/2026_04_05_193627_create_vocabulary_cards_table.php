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
        Schema::create('vocabulary_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('term_de');                          // German term
            $table->string('term_en');                          // English translation
            $table->text('example_de')->nullable();             // Example sentence in German
            $table->text('example_en')->nullable();             // Example sentence in English
            $table->string('domain');                           // 'it', 'legal', 'finance', 'communication'
            $table->enum('level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])->default('B1');
            $table->boolean('is_system')->default(false);       // true = seeded card, false = user-created
            // SM-2 fields
            $table->decimal('ease_factor', 4, 2)->default(2.50);
            $table->unsignedInteger('interval')->default(1);    // days until next review
            $table->unsignedInteger('repetitions')->default(0);
            $table->timestamp('next_review_at')->nullable();
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'domain']);
            $table->index(['user_id', 'next_review_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vocabulary_cards');
    }
};
