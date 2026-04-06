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
        Schema::create('writing_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('prompt_id')->constrained('writing_prompts')->cascadeOnDelete();
            $table->text('user_text');                          // What the user wrote
            $table->json('ai_feedback')->nullable();            // Structured feedback from Claude
            $table->unsignedTinyInteger('score')->nullable();   // 0-100
            $table->string('domain');
            $table->enum('level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
            $table->timestamps();

            $table->index(['user_id', 'domain']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_sessions');
    }
};
