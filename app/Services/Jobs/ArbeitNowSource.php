<?php

namespace App\Services\Jobs;

use App\Models\JobListing;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ArbeitNowSource
{
    private string $baseUrl = 'https://www.arbeitnow.com/api/job-board-api';

    private int $maxPages = 5;

    public function fetch(array $keywords = ['laravel', 'react', 'php']): int
    {
        $processed = [];

        foreach ($keywords as $index => $keyword) {
            if ($index > 0) {
                usleep(500_000); // 0.5s between keyword requests
            }

            try {
                $page = 1;

                do {
                    $response = Http::timeout(15)->get($this->baseUrl, [
                        'search' => $keyword,
                        'page' => $page,
                    ]);

                    if (! $response->ok()) {
                        Log::warning('ArbeitNow API error', [
                            'keyword' => $keyword,
                            'page' => $page,
                            'status' => $response->status(),
                        ]);
                        break;
                    }

                    $jobs = $response->json('data', []);

                    foreach ($jobs as $job) {
                        $sourceId = (string) ($job['slug'] ?? '');

                        if (empty($sourceId) || empty($job['title']) || isset($processed[$sourceId])) {
                            continue;
                        }

                        $this->upsert($job);
                        $processed[$sourceId] = true;
                    }

                    $hasMore = $response->json('meta.next_page') !== null;
                    $page++;
                } while ($hasMore && $page <= $this->maxPages);
            } catch (\Exception $e) {
                Log::warning('ArbeitNow fetch failed', [
                    'keyword' => $keyword,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->deactivateStaleJobs(array_keys($processed));

        return count($processed);
    }

    private function upsert(array $job): void
    {
        JobListing::updateOrCreate(
            ['source' => 'arbeitnow', 'source_id' => (string) $job['slug']],
            [
                'title' => $job['title'],
                'company' => $job['company_name'],
                'location' => $job['location'] ?? $job['country'] ?? null,
                'remote_ok' => (bool) ($job['remote'] ?? false),
                'type' => $this->mapType($job['job_types'][0] ?? ''),
                'description' => strip_tags($job['description'] ?? ''),
                'tech_stack' => $job['tags'] ?? [],
                'url' => $job['url'],
                'language' => $this->detectLanguage($job['description'] ?? ''),
                'is_active' => true,
                'posted_at' => isset($job['created_at'])
                    ? Carbon::parse($job['created_at'])
                    : now(),
            ]
        );
    }

    private function mapType(string $type): string
    {
        return match (strtolower(trim($type))) {
            'full-time', 'full time', 'fulltime' => 'full_time',
            'part-time', 'part time', 'parttime' => 'part_time',
            'contract', 'fixed-term' => 'contract',
            'freelance', 'freelancer' => 'freelance',
            'internship', 'intern' => 'internship',
            default => 'full_time',
        };
    }

    private function detectLanguage(string $text): string
    {
        if (preg_match('/[äöüß]/u', $text) || stripos($text, 'm/w/d') !== false) {
            return 'de';
        }

        return 'en';
    }

    /**
     * Mark jobs as inactive if they were not seen in the current sync.
     * Prevents showing expired listings without hard-deleting them.
     */
    private function deactivateStaleJobs(array $activeSourceIds): void
    {
        if (empty($activeSourceIds)) {
            return;
        }

        $deactivated = JobListing::where('source', 'arbeitnow')
            ->where('is_active', true)
            ->whereNotIn('source_id', $activeSourceIds)
            ->update(['is_active' => false]);

        if ($deactivated > 0) {
            Log::info('ArbeitNow: deactivated stale jobs', ['count' => $deactivated]);
        }
    }
}
