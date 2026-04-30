<?php

namespace App\Services;

use App\Models\CvProfile;
use App\Models\JobListing;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use RuntimeException;

class CvAdaptorService
{
    private const MAX_ATTEMPTS = 5;

    private const DECAY_SECONDS = 3600;

    private const CACHE_TTL_HOURS = 24;

    public function __construct(
        private string $primaryModel = 'qwen/qwen3-8b:free',
        private string $fallbackModel = 'mistralai/mistral-7b-instruct:free',
        private int $maxContextChars = 8000,
        private int $maxOutputTokens = 2000,
    ) {}

    /**
     * Adapt a CV for a specific German job listing using AI.
     *
     * @throws RuntimeException if consent is missing or service is unavailable
     */
    public function adapt(CvProfile $cv, JobListing $job): string
    {
        // DSGVO: require explicit consent before sending CV data to AI
        if (! $cv->ai_processing_consent_at) {
            Log::warning('CV adaptation attempted without DSGVO consent', [
                'cv_id' => $cv->id,
                'user_id' => $cv->user_id,
            ]);
            throw new RuntimeException('User consent required for AI CV adaptation');
        }

        // Rate limiting: max 5 adaptations per user per hour
        $rateLimitKey = "cv-adapt:{$cv->user_id}";

        if (RateLimiter::tooManyAttempts($rateLimitKey, self::MAX_ATTEMPTS)) {
            Log::warning('CV adaptation rate limit exceeded', ['user_id' => $cv->user_id]);
            throw new RuntimeException('Too many requests — please try again in an hour');
        }

        RateLimiter::hit($rateLimitKey, self::DECAY_SECONDS);

        // Cache based on content hash — invalidates automatically if CV or job changes
        $cacheKey = 'cv_adapt:'.hash('xxh128', "{$cv->id}:{$job->id}:{$cv->raw_cv}:{$job->description}");

        return Cache::remember($cacheKey, now()->addHours(self::CACHE_TTL_HOURS), function () use ($cv, $job) {
            $startTime = microtime(true);

            try {
                $content = $this->callApi($cv, $job, $this->primaryModel);
                $duration = round(microtime(true) - $startTime, 2);

                Log::info('CV adaptation succeeded', [
                    'cv_id' => $cv->id,
                    'job_id' => $job->id,
                    'model' => $this->primaryModel,
                    'duration_seconds' => $duration,
                    'output_length' => mb_strlen($content),
                ]);

                return $content;
            } catch (\Exception $primaryError) {
                Log::warning('Primary CV model failed, trying fallback', [
                    'error' => $primaryError->getMessage(),
                    'primary_model' => $this->primaryModel,
                ]);

                try {
                    $content = $this->callApi($cv, $job, $this->fallbackModel);

                    Log::info('CV adaptation succeeded with fallback model', [
                        'cv_id' => $cv->id,
                        'fallback_model' => $this->fallbackModel,
                    ]);

                    return $content;
                } catch (\Exception $fallbackError) {
                    Log::error('CV adaptation failed on both models', [
                        'cv_id' => $cv->id,
                        'job_id' => $job->id,
                        'primary_error' => $primaryError->getMessage(),
                        'fallback_error' => $fallbackError->getMessage(),
                        'duration_seconds' => round(microtime(true) - $startTime, 2),
                    ]);

                    // Graceful degradation — return original CV unchanged
                    return $cv->raw_cv;
                }
            }
        });
    }

    private function callApi(CvProfile $cv, JobListing $job, string $model): string
    {
        $escape = fn (string $text): string => str_replace(
            ['"""', '---', '<<<', '>>>'],
            ['\"\"\"', '\-\-\-', '\<\<\<', '\>\>\>'],
            $text
        );

        $prompt = <<<PROMPT
You are a professional CV consultant specializing in the German job market.

### JOB DETAILS (reference only, do not modify)
<title>{$escape($job->title)}</title>
<company>{$escape($job->company)}</company>
<description>
{$escape($this->truncateForContext($job->description))}
</description>

### CANDIDATE'S ORIGINAL CV (do not fabricate beyond this content)
<cv_content>
{$escape($this->truncateForContext($cv->raw_cv))}
</cv_content>

### YOUR TASK
Rewrite the CV inside <cv_content> to perfectly match the role in <description>.
Follow these rules strictly:
1. Use clear, professional German business language
2. Highlight only skills/experience that exist in the original CV
3. Structure: Reverse chronological — sections: Profil, Berufserfahrung, Ausbildung, Skills
4. Add a 3-4 line "Profil" summary at the top tailored to this role
5. Keep total length equivalent to max 2 A4 pages
6. NEVER invent job titles, companies, dates, or skills not in the original

### OUTPUT FORMAT
Return ONLY the adapted CV text. No preamble, no explanations, no markdown code fences.
Start directly with the CV content.
/no_think
PROMPT;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('services.openrouter.key'),
            'Content-Type' => 'application/json',
            'HTTP-Referer' => config('app.url'),
            'X-Title' => config('app.name'),
        ])
            ->timeout(30)
            ->retry(2, 1000)
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.3,
                'max_tokens' => $this->maxOutputTokens,
                'stop' => ['</cv_content>', '###'],
            ]);

        if (! $response->ok()) {
            Log::error('OpenRouter API error', [
                'status' => $response->status(),
                'model' => $model,
                'body' => mb_strcut($response->body(), 0, 500),
            ]);
            throw new RuntimeException('AI service unavailable (HTTP '.$response->status().')');
        }

        $content = $response->json('choices.0.message.content');

        if (! is_string($content) || empty(trim($content))) {
            Log::warning('OpenRouter returned empty or invalid content', [
                'model' => $model,
                'response_keys' => array_keys($response->json() ?? []),
            ]);
            throw new RuntimeException('AI returned no usable content');
        }

        return $this->stripThinkTags(trim($content));
    }

    private function truncateForContext(string $text): string
    {
        if (mb_strlen($text) <= $this->maxContextChars) {
            return $text;
        }

        $truncated = mb_substr($text, 0, $this->maxContextChars);
        $lastPeriod = mb_strrpos($truncated, '.');

        if ($lastPeriod > $this->maxContextChars * 0.9) {
            return mb_substr($truncated, 0, $lastPeriod + 1)
                ."\n\n[... content truncated for length ...]";
        }

        return $truncated."\n\n[... content truncated for length ...]";
    }

    private function stripThinkTags(string $content): string
    {
        $patterns = [
            '/<think>.*?<\/think>/s',
            '/<thinking>.*?<\/thinking>/s',
            '/\[THOUGHT\].*?\[\/THOUGHT\]/s',
            '/^Thought:.*?\n\n/im',
        ];

        foreach ($patterns as $pattern) {
            $content = preg_replace($pattern, '', $content);
        }

        return trim($content);
    }

    public function health(): array
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders(['Authorization' => 'Bearer '.config('services.openrouter.key')])
                ->get('https://openrouter.ai/api/v1/models');

            $healthy = $response->ok()
                && collect($response->json('data'))->contains('id', $this->primaryModel);

            return [
                'status' => $healthy ? 'healthy' : 'degraded',
                'model' => $this->primaryModel,
                'checked_at' => now()->toIso8601String(),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'unhealthy',
                'error' => $e->getMessage(),
                'checked_at' => now()->toIso8601String(),
            ];
        }
    }
}
