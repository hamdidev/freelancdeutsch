<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VocabularyCard extends Model
{
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected $fillable = [
        'user_id',
        'term_de',
        'term_en',
        'example_de',
        'example_en',
        'domain',
        'level',
        'is_system',
        'ease_factor',
        'interval',
        'repetitions',
        'next_review_at',
        'last_reviewed_at',
    ];

    protected $attributes = [
        'ease_factor' => 2.50,
        'interval' => 1,
        'repetitions' => 0,
        'is_system' => false,
    ];

    protected $casts = [
        'next_review_at' => 'datetime',
        'last_reviewed_at' => 'datetime',
        'ease_factor' => 'decimal:2',
        'interval' => 'integer',
        'repetitions' => 'integer',
        'is_system' => 'boolean',
    ];
}
