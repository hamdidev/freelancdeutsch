<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WritingPrompt extends Model
{
    protected $fillable = [
        'domain',
        'level',
        'prompt_en',
        'prompt_de',
        'context',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function sessions(): HasMany
    {
        return $this->hasMany(WritingSession::class, 'prompt_id');
    }

    public function scopeActive($query): mixed
    {
        return $query->where('is_active', true);
    }
}
