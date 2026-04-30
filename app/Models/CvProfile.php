<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CvProfile extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'raw_cv',
        'skills',
        'experience',
        'years_experience',
        'target_role',
        'target_location',
        'is_default',
    ];

    protected $casts = [
        'skills' => 'array',
        'experience' => 'array',
        'is_default' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
