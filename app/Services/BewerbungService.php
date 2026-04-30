<?php

namespace App\Services;

use App\Models\CvProfile;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use RuntimeException;

class BewerbungService
{
    private const MAX_ATTEMPTS = 3;

    private const DECAY_SECONDS = 86400;   // 24 hours

    private const CACHE_TTL_HOURS = 12;

    private const BUDGET_CACHE_KEY = 'openrouter:daily_spend_micro_eur'; // stored as micro-euros (int)

    public function __construct(
        private string $primaryModel = 'qwen/qwen3-8b:free',
        private string $fallbackModel = 'mistralai/mistral-7b-instruct:free',
        private int $maxContextChars = 4000,
        private int $maxOutputTokens = 1200,
        private float $maxDailyBudgetEur = 25.00,
    ) {}

    /**
     * Generate a formal German cover letter (Bewerbungsschreiben).
     *
     * @throws RuntimeException if consent missing, rate limited, or service unavailable
     */
    public function generate(User $user, CvProfile $cv, JobListing $job): string
    {
        // DSGVO: require explicit consent before sending personal data to AI
        if (! $cv->ai_processing_consent_at) {
            Log::warning('Cover letter generation attempted without DSGVO consent', [
                'user_id' => $user->id,
                'cv_id' => $cv->id,
                'job_id' => $job->id,
            ]);
            throw new RuntimeException('Bitte stimmen Sie der KI-Verarbeitung Ihrer Daten zu');
        }

        // Rate limiting: max 3 per user per 24 hours
        $rateLimitKey = "bewerbung:{$user->id}";

        if (RateLimiter::tooManyAttempts($rateLimitKey, self::MAX_ATTEMPTS)) {
            Log::warning('Cover letter rate limit exceeded', ['user_id' => $user->id]);
            throw new RuntimeException('Sie können maximal 3 Bewerbungsschreiben pro Tag generieren');
        }

        RateLimiter::hit($rateLimitKey, self::DECAY_SECONDS);

        // Global daily budget guard (stored as micro-euros to avoid float precision issues)
        $dailySpendMicro = (int) Cache::get(self::BUDGET_CACHE_KEY, 0);
        $budgetMicro = (int) ($this->maxDailyBudgetEur * 1_000_000);

        if ($dailySpendMicro >= $budgetMicro) {
            Log::error('OpenRouter daily budget exceeded', [
                'spent_eur' => $dailySpendMicro / 1_000_000,
                'limit_eur' => $this->maxDailyBudgetEur,
            ]);
            throw new RuntimeException('Der KI-Service ist vorübergehend nicht verfügbar');
        }

        $cacheKey = 'bewerbung:'.hash('xxh128', "{$user->id}:{$job->id}:{$cv->raw_cv}:{$job->description}");

        return Cache::remember($cacheKey, now()->addHours(self::CACHE_TTL_HOURS), function () use ($user, $cv, $job) {
            $startTime = microtime(true);

            try {
                $content = $this->callApi($user, $cv, $job, $this->primaryModel);
                $duration = round(microtime(true) - $startTime, 2);

                Log::info('Cover letter generated successfully', [
                    'user_id' => $user->id,
                    'job_id' => $job->id,
                    'model' => $this->primaryModel,
                    'duration_seconds' => $duration,
                    'word_count' => str_word_count($content),
                ]);

                // Track cost as integer micro-euros (Cache::increment requires int)
                $costMicro = $this->estimateCostMicro($content, $this->primaryModel);
                if ($costMicro > 0) {
                    Cache::increment(self::BUDGET_CACHE_KEY, $costMicro);
                }

                return $content;
            } catch (\Exception $primaryError) {
                Log::warning('Primary model failed, trying fallback', [
                    'error' => $primaryError->getMessage(),
                    'primary_model' => $this->primaryModel,
                ]);

                try {
                    $content = $this->callApi($user, $cv, $job, $this->fallbackModel);

                    Log::info('Cover letter generated with fallback model', [
                        'user_id' => $user->id,
                        'fallback_model' => $this->fallbackModel,
                    ]);

                    return $content;
                } catch (\Exception $fallbackError) {
                    Log::error('Cover letter generation failed completely', [
                        'user_id' => $user->id,
                        'job_id' => $job->id,
                        'primary_error' => $primaryError->getMessage(),
                        'fallback_error' => $fallbackError->getMessage(),
                    ]);

                    return $this->getFallbackTemplate($user, $job);
                }
            }
        });
    }

    private function callApi(User $user, CvProfile $cv, JobListing $job, string $model): string
    {
        $today = now()->locale('de')->isoFormat('D. MMMM YYYY');
        $escape = fn (?string $text): string => $this->escapeForPrompt($text);

        $prompt = <<<PROMPT
You are an expert German business writer (Personalberater) helping international developers apply for jobs in Germany.

### JOB DETAILS (reference only, do not modify)
<job_title>{$escape($job->title)}</job_title>
<job_company>{$escape($job->company)}</job_company>
<job_location>{$escape($job->location)}</job_location>
<job_description>
{$escape($this->truncateForContext($job->description))}
</job_description>

### APPLICANT DATA (do not fabricate beyond this)
<applicant_name>{$escape($user->name)}</applicant_name>
<applicant_email>{$escape($user->email)}</applicant_email>
<applicant_german_level>{$escape($user->german_level ?? 'B1')}</applicant_german_level>
<applicant_cv>
{$escape($this->truncateForContext($cv->raw_cv))}
</applicant_cv>

### YOUR TASK
Write a formal German cover letter (Bewerbungsschreiben) for this application.
Follow these rules STRICTLY:

1. LANGUAGE & STYLE
   - Write entirely in formal German (Sie-Form)
   - Use professional business language, no colloquialisms
   - Prefer German equivalents over Anglicisms
   - Capitalize all nouns correctly

2. FORMAT (DIN 5008)
   - Sender block: applicant name + email
   - Recipient block: company + location
   - Date: "{$today}"
   - Subject: "Betreff: Bewerbung als {$escape($job->title)}"
   - Salutation: "Sehr geehrte Damen und Herren,"
   - Exactly 3 paragraphs:
     a) Why this company and role interests you
     b) What specific skills/experience you bring (CV only)
     c) Call to action + availability
   - Closing: "Mit freundlichen Grüßen,"
   - Signature: applicant name
   - Maximum 350 words

3. CONTENT RULES
   - Reference actual requirements from the job description
   - Only mention skills present in the applicant CV
   - NEVER invent experience, companies, or qualifications

### OUTPUT FORMAT
Return ONLY the complete cover letter. No preamble, no markdown, no thinking.
Start directly with the sender address block.
/no_think
PROMPT;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('services.openrouter.key'),
            'Content-Type' => 'application/json',
            'HTTP-Referer' => config('app.url'),
            'X-Title' => config('app.name'),
        ])
            ->timeout(45)
            ->retry(2, 1500)
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $model,
                'messages' => [['role' => 'user', 'content' => $prompt]],
                'temperature' => 0.4,
                'max_tokens' => $this->maxOutputTokens,
                'stop' => ['</applicant_cv>', '###', 'Return ONLY'],
            ]);

        if (! $response->ok()) {
            Log::error('OpenRouter API error', [
                'status' => $response->status(),
                'model' => $model,
                'body' => mb_strcut($response->body(), 0, 400),
            ]);
            throw new RuntimeException('Der KI-Service ist derzeit nicht verfügbar (HTTP '.$response->status().')');
        }

        $content = $response->json('choices.0.message.content');

        if (! is_string($content) || empty(trim($content))) {
            Log::warning('OpenRouter returned empty or invalid content', [
                'model' => $model,
                'response_keys' => array_keys($response->json() ?? []),
            ]);
            throw new RuntimeException('Die KI konnte kein Bewerbungsschreiben generieren');
        }

        $cleaned = $this->stripThinkTags(trim($content));
        $warnings = $this->validateGermanBusinessText($cleaned);

        if (! empty($warnings)) {
            Log::warning('Generated cover letter has quality warnings', [
                'warnings' => $warnings,
                'user_id' => $user->id,
            ]);
        }

        return $cleaned;
    }

    private function escapeForPrompt(?string $text): string
    {
        if (! $text) {
            return '';
        }

        return str_replace(
            ['"""',     '---',      '<<<',      '>>>',      'PROMPT'],
            ['\"\"\"', '\-\-\-',   '\<\<\<',   '\>\>\>',   'PROMPT_BLOCKED'],
            $text
        );
    }

    private function truncateForContext(string $text): string
    {
        if (mb_strlen($text) <= $this->maxContextChars) {
            return $text;
        }

        $truncated = mb_substr($text, 0, $this->maxContextChars);
        $lastPeriod = mb_strrpos($truncated, '.');

        if ($lastPeriod !== false && $lastPeriod > $this->maxContextChars * 0.85) {
            return mb_substr($truncated, 0, $lastPeriod + 1)."\n\n[... gekürzt ...]";
        }

        return $truncated."\n\n[... gekürzt ...]";
    }

    private function stripThinkTags(string $content): string
    {
        $patterns = [
            '/<think>.*?<\/think>/s',
            '/<thinking>.*?<\/thinking>/s',
            '/\[THOUGHT\].*?\[\/THOUGHT\]/s',
            '/^Thought:.*?\n\n/im',
            '/^Okay, let me think.*?\n\n/im',
        ];

        foreach ($patterns as $pattern) {
            $content = preg_replace($pattern, '', $content);
        }

        return trim($content);
    }

    private function validateGermanBusinessText(string $text): array
    {
        $warnings = [];

        if (preg_match('/\b(du|dich|dir|dein|deine)\b/i', $text)) {
            $warnings[] = 'Mögliche informelle Anrede gefunden (Sie-Form empfohlen)';
        }

        $anglicisms = [
            '/\bteamfähig\b/i' => 'teamorientiert / kooperativ',
            '/\bmindset\b/i' => 'Einstellung / Haltung',
            '/\bskillset\b/i' => 'Qualifikationen / Fähigkeiten',
            '/\bfit\b/i' => 'passend / geeignet',
        ];

        foreach ($anglicisms as $pattern => $suggestion) {
            if (preg_match($pattern, $text)) {
                $warnings[] = "Anglizismus: erwägen Sie '{$suggestion}'";
            }
        }

        $wordCount = str_word_count($text);
        if ($wordCount > 400) {
            $warnings[] = "Text zu lang ({$wordCount} > 350 Wörter)";
        }

        return $warnings;
    }

    private function getFallbackTemplate(User $user, JobListing $job): string
    {
        $today = now()->locale('de')->isoFormat('D. MMMM YYYY');

        return implode("\n", [
            $user->name,
            $user->email,
            '',
            $job->company,
            $job->location,
            '',
            $today,
            '',
            "Betreff: Bewerbung als {$job->title}",
            '',
            'Sehr geehrte Damen und Herren,',
            '',
            "mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als {$job->title} gelesen. Die beschriebenen Aufgaben und Anforderungen entsprechen genau meinen Qualifikationen und Karrierezielen.",
            '',
            'In meiner bisherigen Laufbahn konnte ich umfassende Erfahrungen in der Softwareentwicklung sammeln. Diese Kompetenzen würde ich gerne in Ihr Team einbringen und zum Erfolg von '.$job->company.' beitragen.',
            '',
            'Gerne stelle ich mich Ihnen in einem persönlichen Gespräch vor und freue mich auf Ihre Rückmeldung.',
            '',
            'Mit freundlichen Grüßen,',
            '',
            $user->name,
        ]);
    }

    /**
     * Cost stored as micro-euros (integer) to avoid Cache::increment float issues.
     * Example: €0.0006 = 600 micro-euros
     */
    private function estimateCostMicro(string $content, string $model): int
    {
        if (str_contains($model, ':free')) {
            return 0;
        }

        // ~$0.0006 per 1K output tokens, roughly 1.3 tokens per word
        $outputTokens = (int) ceil(str_word_count($content) * 1.3);
        $costEur = ($outputTokens / 1000) * 0.0006;

        return (int) ceil($costEur * 1_000_000);
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
