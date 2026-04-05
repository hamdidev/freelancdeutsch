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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // 'Free', 'Pro', 'Agency'
            $table->string('slug')->unique();          // 'free', 'pro', 'agency'
            $table->string('stripe_price_id')->nullable();
            $table->unsignedInteger('price_cents');    // 0, 1200, 3900
            $table->string('currency')->default('eur');
            $table->json('limits');                    // {"ai_writing":3,"documents":2,"vocab_cards":20}
            $table->json('features');                  // ["srs","document_generator","job_feed"]
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
