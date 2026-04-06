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
        Schema::create('writing_prompts', function (Blueprint $table) {
            $table->id();
            $table->string('domain');                           // 'it', 'legal', 'finance', 'communication'
            $table->enum('level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
            $table->text('prompt_en');                          // The task in English
            $table->text('prompt_de')->nullable();              // Optional German version
            $table->string('context')->nullable();              // Brief scenario context
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['domain', 'level']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_prompts');
    }
};
