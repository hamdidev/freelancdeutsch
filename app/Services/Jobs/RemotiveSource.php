<?php

namespace App\Services\Jobs;

use App\Models\JobListing;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RemotiveSource
{
    private string $baseUrl = 'https://remotive.com/api/remote-jobs';

    private int $maxPages = 3;

    public function fetch(array $categories = ['software-dev']): int
    {
        $processed = [];

        foreach ($categories as $index => $category) {
            if ($index > 0) {
                usleep(500_000);
            }

            try {
                $page = 1;

                do {
                    $response = Http::timeout(15)->get($this->baseUrl, [
                        'category' => $category,
                        'limit' => 20,
                        'page' => $page,
                    ]);

                    if (! $response->ok()) {
                        Log::warning('Remotive API error', [
                            'category' => $category,
                            'page' => $page,
                            'status' => $response->status(),
                        ]);
                        break;
                    }

                    $jobs = $response->json('jobs', []);

                    foreach ($jobs as $job) {
                        if (! $this->isGermanMarket($job)) {
                            continue;
                        }

                        $sourceId = (string) ($job['id'] ?? '');

                        if (empty($sourceId) || empty($job['title']) || isset($processed[$sourceId])) {
                            continue;
                        }

                        $this->upsert($job);
                        $processed[$sourceId] = true;
                    }

                    $hasMore = count($jobs) === 20;
                    $page++;
                } while ($hasMore && $page <= $this->maxPages);
            } catch (\Exception $e) {
                Log::warning('Remotive fetch failed', [
                    'category' => $category,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->deactivateStaleJobs(array_keys($processed));

        return count($processed);
    }

    private function isGermanMarket(array $job): bool
    {
        $location = strtolower($job['candidate_required_location'] ?? '');
        $tags = array_map('strtolower', $job['tags'] ?? []);
        $companyLocation = strtolower($job['company_location'] ?? '');

        $excludeIndicators = [
            'us-only',
            'united states only',
            'north america only',
            'latin america',
            'asia only',
            'australia only',
            'africa only',
        ];

        foreach ($excludeIndicators as $exclude) {
            if (str_contains($location, $exclude)) {
                return false;
            }
        }

        $germanIndicators = [
            'germany',
            'german',
            'de-',
            'berlin',
            'munich',
            'hamburg',
            'frankfurt',
            'eu-',
            'europe',
            'eea',
            'german-speaking',
            'deutsch',
            'd/a/ch',
            'ger',
        ];

        foreach ($germanIndicators as $indicator) {
            if (str_contains($location, $indicator) || in_array($indicator, $tags)) {
                return true;
            }
        }

        // Worldwide / empty — only relevant if company is EU-based
        if (str_contains($location, 'worldwide') || empty($location)) {
            foreach (['germany', 'europe', 'eu', 'eea', 'deutsch'] as $euIndicator) {
                if (str_contains($companyLocation, $euIndicator)) {
                    return true;
                }
            }

            return false;
        }

        return false;
    }

    private function upsert(array $job): void
    {
        if (empty($job['id']) || empty($job['title']) || empty($job['company_name'])) {
            Log::warning('Remotive job missing required fields', [
                'id' => $job['id'] ?? null,
                'title' => $job['title'] ?? null,
            ]);

            return;
        }

        JobListing::updateOrCreate(
            ['source' => 'remotive', 'source_id' => (string) $job['id']],
            [
                'title' => $job['title'],
                'company' => $job['company_name'],
                'company_logo' => filter_var($job['company_logo'] ?? null, FILTER_VALIDATE_URL) ?: null,
                'location' => $job['candidate_required_location'] ?? 'Remote',
                'remote_ok' => true,
                'type' => $this->mapType($job['job_type'] ?? $job['employment_type'] ?? null),
                'description' => strip_tags($job['description'] ?? ''),
                'tech_stack' => $job['tags'] ?? [],
                'url' => filter_var($job['url'], FILTER_VALIDATE_URL) ?: $job['url'],
                'language' => 'en',
                'is_active' => true,
                'posted_at' => isset($job['publication_date'])
                    ? Carbon::parse($job['publication_date'])
                    : now(),
            ]
        );
    }

    private function mapType(?string $type): string
    {
        return match (strtolower(trim($type ?? ''))) {
            'full-time', 'full_time', 'fulltime' => 'full_time',
            'part-time', 'part_time', 'parttime' => 'part_time',
            'contract', 'fixed-term', 'temporary' => 'contract',
            'freelance', 'freelancer', 'contractor' => 'freelance',
            'internship', 'intern', 'trainee' => 'internship',
            default => 'full_time',
        };
    }

    /**
     * Deactivate Remotive jobs not seen in this sync run.
     * Avoids showing expired listings without hard-deleting them.
     */
    private function deactivateStaleJobs(array $activeSourceIds): void
    {
        if (empty($activeSourceIds)) {
            return;
        }

        $deactivated = JobListing::where('source', 'remotive')
            ->where('is_active', true)
            ->whereNotIn('source_id', $activeSourceIds)
            ->update(['is_active' => false]);

        if ($deactivated > 0) {
            Log::info('Remotive: deactivated stale jobs', ['count' => $deactivated]);
        }
    }
}
