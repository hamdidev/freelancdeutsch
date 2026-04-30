<?php

namespace App\Services;

use App\Models\WritingPrompt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WritingEvaluator
{
    private string $apiKey;

    private string $model = 'qwen/qwen3-8b:free';

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.key');
    }

    public function evaluate(WritingPrompt $prompt, string $userText, string $level): array
    {
        $systemPrompt = $this->buildSystemPrompt($level);
        $userMessage = $this->buildUserMessage($prompt, $userText);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
            ])->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $userMessage],
                ],
                'temperature' => 0.3,
                'max_tokens' => 1024,
            ]);

            $content = $response->json('choices.0.message.content');

            return $this->parseResponse($content);
        } catch (\Exception $e) {
            Log::error('WritingEvaluator failed', ['error' => $e->getMessage()]);

            return $this->fallbackResponse();
        }
    }

    private function buildSystemPrompt(string $level): string
    {
        return <<<PROMPT
        You are a German B2B writing coach for international freelancers targeting the German market.
        The user's current German level is {$level}.

        Evaluate their German business writing and return ONLY a valid JSON object — no preamble, no markdown, no explanation.

        The JSON must have exactly this structure:
        {
            "score": <integer 0-100>,
            "summary": "<2 sentence overall assessment in English>",
            "corrections": [
                {
                    "original": "<exact phrase from user text>",
                    "corrected": "<corrected version>",
                    "explanation": "<brief explanation in English>"
                }
            ],
            "register": "<one of: too_informal | appropriate | too_formal>",
            "register_note": "<one sentence on tone/register in English>",
            "native_version": "<a polished native-level rewrite of the full text in German>",
            "top_phrases": [
                "<useful German B2B phrase learned from this correction>",
                "<another useful phrase>"
            ]
        }

        Scoring guide:
        - 80-100: Near-native, only minor suggestions
        - 60-79:  Good structure, some grammar or register issues
        - 40-59:  Understandable but significant errors
        - Below 40: Fundamental issues to address

        Be encouraging but honest. Calibrate feedback to the user's level.
        /no_think
        PROMPT;
    }

    private function buildUserMessage(WritingPrompt $prompt, string $userText): string
    {
        return <<<MSG
        Writing task: {$prompt->prompt_en}
        Context: {$prompt->context}

        User's German text:
        ---
        {$userText}
        ---

        Return the JSON feedback object only.
        MSG;
    }

    private function parseResponse(string $content): array
    {
        // Qwen3 sometimes wraps in <think> tags — strip them
        $content = preg_replace('/<think>.*?<\/think>/s', '', $content);
        $content = trim($content);

        $decoded = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $clean = preg_replace('/```json|```/', '', $content);
            $decoded = json_decode(trim($clean), true);
        }

        return $decoded ?? $this->fallbackResponse();
    }

    private function fallbackResponse(): array
    {
        return [
            'score' => null,
            'summary' => 'Evaluation temporarily unavailable. Please try again.',
            'corrections' => [],
            'register' => 'appropriate',
            'register_note' => '',
            'native_version' => '',
            'top_phrases' => [],
        ];
    }
}
