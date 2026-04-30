<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsageCounter extends Model
{
    protected $fillable = ['user_id', 'feature', 'count', 'period'];

    protected $casts = ['period' => 'date'];

    public static function currentPeriod(int $userId, string $feature): int
    {
        return static::where('user_id', $userId)
            ->where('feature', $feature)
            ->whereDate('period', now()->startOfMonth())
            ->value('count') ?? 0;
    }

    public static function incrementFor(int $userId, string $feature): void
    {
        static::updateOrCreate(
            [
                'user_id' => $userId,
                'feature' => $feature,
                'period' => now()->startOfMonth()->startOfDay(),
            ],
            ['count' => 0]
        )->increment('count');
    }
}
