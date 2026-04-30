<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobListing extends Model
{
    protected $fillable = [
        'source',
        'source_id',
        'title',
        'company',
        'company_logo',
        'location',
        'remote_ok',
        'type',
        'description',
        'tech_stack',
        'salary_range',
        'url',
        'language',
        'is_active',
        'posted_at',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'remote_ok' => 'boolean',
        'is_active' => 'boolean',
        'posted_at' => 'datetime',
    ];

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'job_id');
    }

    public function scopeActive($query): mixed
    {
        return $query->where('is_active', true);
    }

    public function scopeRemote($query): mixed
    {
        return $query->where('remote_ok', true);
    }
}
