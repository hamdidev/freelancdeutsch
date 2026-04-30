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
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->string('source');                        // 'arbeitnow', 'remotive', 'manual'
            $table->string('source_id')->nullable();         // external ID for dedup
            $table->string('title');
            $table->string('company');
            $table->string('company_logo')->nullable();
            $table->string('location')->default('Remote');
            $table->boolean('remote_ok')->default(true);
            $table->string('type')->default('full_time');    // full_time, contract, freelance
            $table->text('description');
            $table->json('tech_stack')->nullable();          // ['Laravel', 'React', 'PostgreSQL']
            $table->string('salary_range')->nullable();
            $table->string('url');
            $table->string('language')->default('de');       // job posting language
            $table->boolean('is_active')->default(true);
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();

            $table->unique(['source', 'source_id']);
            $table->index(['is_active', 'posted_at']);
            $table->index('remote_ok');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};
