<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'stripe_price_id',
        'price_cents',
        'currency',
        'limits',
        'features',
        'is_active',
    ];

    protected $casts = [
        'limits'    => 'array',
        'features'  => 'array',
        'is_active' => 'boolean',
    ];

    public function isFree(): bool
    {
        return $this->slug === 'free';
    }
}
