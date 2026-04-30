<?php

namespace Database\Seeders;

use App\Models\WritingPrompt;
use Illuminate\Database\Seeder;

class WritingPromptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prompts = [
            [
                'domain' => 'it',
                'level' => 'B1',
                'context' => 'A client has not responded to your last two emails about a delayed project.',
                'prompt_en' => 'Write a polite follow-up email to your client asking for a status update on the project approval.',
            ],
            [
                'domain' => 'it',
                'level' => 'B2',
                'context' => 'You discovered a critical bug in production on a Friday afternoon.',
                'prompt_en' => 'Write a professional email to your client explaining the bug, its impact, and your plan to fix it.',
            ],
            [
                'domain' => 'finance',
                'level' => 'B1',
                'context' => 'A client\'s invoice is 21 days overdue.',
                'prompt_en' => 'Write a first payment reminder (erste Mahnung) for an overdue invoice of €2,400.',
            ],
            [
                'domain' => 'finance',
                'level' => 'B2',
                'context' => 'A potential client asked about your rates.',
                'prompt_en' => 'Write an email introducing your services and stating your hourly rate and availability.',
            ],
            [
                'domain' => 'legal',
                'level' => 'B2',
                'context' => 'A client wants to extend the project scope without a written agreement.',
                'prompt_en' => 'Write a professional email proposing a change request process and asking for written confirmation of the new scope.',
            ],
            [
                'domain' => 'communication',
                'level' => 'B1',
                'context' => 'You need to reschedule a client meeting.',
                'prompt_en' => 'Write a short, polite email to reschedule a meeting that was planned for tomorrow morning.',
            ],
        ];

        foreach ($prompts as $prompt) {
            WritingPrompt::create([...$prompt, 'is_active' => true]);
        }
    }
}
