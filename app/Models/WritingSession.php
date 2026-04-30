<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WritingSession extends Model
{
    protected $fillable = [
        'user_id',
        'prompt_id',
        'user_text',
        'ai_feedback',
        'score',
        'domain',
        'level',
    ];

    protected $casts = ['ai_feedback' => 'array'];

    public function prompt()
    {
        return $this->belongsTo(WritingPrompt::class, 'prompt_id');
    }
}
