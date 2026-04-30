<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SrsReview extends Model
{
    protected $fillable = [
        'user_id',
        'card_id',
        'quality',
        'ease_factor_before',
        'ease_factor_after',
        'interval_before',
        'interval_after',
    ];

    protected $casts = [
        'ease_factor_before' => 'decimal:2',
        'ease_factor_after' => 'decimal:2',
    ];

    public function card()
    {
        return $this->belongsTo(VocabularyCard::class, 'card_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
