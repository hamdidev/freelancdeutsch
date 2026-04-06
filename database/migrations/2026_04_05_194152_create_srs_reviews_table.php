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
        Schema::create('srs_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('card_id')->constrained('vocabulary_cards')->cascadeOnDelete();
            $table->unsignedTinyInteger('quality');             // 0=Again, 1=Hard, 2=Good, 3=Easy
            $table->decimal('ease_factor_before', 4, 2);
            $table->decimal('ease_factor_after', 4, 2);
            $table->unsignedInteger('interval_before');
            $table->unsignedInteger('interval_after');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('srs_reviews');
    }
};
