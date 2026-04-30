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
        Schema::create('cv_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->default('My CV');
            $table->text('raw_cv');                          // user's original CV text
            $table->json('skills')->nullable();              // extracted skills array
            $table->json('experience')->nullable();          // structured experience
            $table->string('years_experience')->nullable();
            $table->string('target_role')->nullable();
            $table->string('target_location')->nullable()->default('Germany');
            $table->boolean('is_default')->default(false);
            $table->index('user_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cv_profiles');
    }
};
