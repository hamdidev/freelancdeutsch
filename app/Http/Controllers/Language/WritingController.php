<?php

namespace App\Http\Controllers\Language;

use App\Http\Controllers\Controller;
use App\Models\WritingPrompt;
use App\Models\WritingSession;
use App\Services\WritingEvaluator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WritingController extends Controller
{
    public function __construct(private WritingEvaluator $evaluator) {}

    public function index(): Response
    {
        $user = auth()->user();
        $prompt = WritingPrompt::where('domain', $user->freelance_domain)
            ->where('level', $user->german_level)
            ->where('is_active', true)
            ->inRandomOrder()
            ->first();

        $recent = WritingSession::where('user_id', $user->id)
            ->with('prompt')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Language/Writing', [
            'prompt' => $prompt,
            'recent' => $recent,
        ]);
    }

    public function evaluate(Request $request): JsonResponse
    {
        $request->validate([
            'prompt_id' => ['required', 'exists:writing_prompts,id'],
            'text' => ['required', 'string', 'min:20', 'max:2000'],
        ]);

        $prompt = WritingPrompt::findOrFail($request->prompt_id);
        $user = auth()->user();
        $feedback = $this->evaluator->evaluate($prompt, $request->text, $user->german_level);

        $session = WritingSession::create([
            'user_id' => $user->id,
            'prompt_id' => $prompt->id,
            'user_text' => $request->text,
            'ai_feedback' => $feedback,
            'score' => $feedback['score'] ?? null,
            'domain' => $prompt->domain,
            'level' => $user->german_level,
        ]);

        return response()->json(['feedback' => $feedback, 'session_id' => $session->id]);
    }
}
