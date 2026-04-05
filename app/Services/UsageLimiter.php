<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\UsageCounter;
use App\Models\User;

class UsageLimiter
{
    private array $limits;

    public function __construct(private User $user)
    {
        $plan         = Plan::where('slug', $user->plan)->first();
        $this->limits = $plan?->limits ?? [];
    }

    public function can(string $feature): bool
    {
        $limit = $this->limits[$feature] ?? 0;

        if ($limit === -1) return true;

        $used = UsageCounter::currentPeriod($this->user->id, $feature);

        return $used < $limit;
    }

    public function increment(string $feature): void
    {
        UsageCounter::incrementFor($this->user->id, $feature);
    }

    public function remaining(string $feature): int|string
    {
        $limit = $this->limits[$feature] ?? 0;

        if ($limit === -1) return 'unlimited';

        $used = UsageCounter::currentPeriod($this->user->id, $feature);

        return max(0, $limit - $used);
    }

    public function summary(): array
    {
        return collect(array_keys($this->limits))
            ->mapWithKeys(fn($feature) => [
                $feature => [
                    'remaining' => $this->remaining($feature),
                    'can'       => $this->can($feature),
                ]
            ])->toArray();
    }
}
