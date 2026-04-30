<?php

namespace Database\Seeders;

use App\Models\JobListing;
use Illuminate\Database\Seeder;

class JobListingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jobs = [
            [
                'source' => 'manual',
                'source_id' => 'seed-1',
                'title' => 'Senior Laravel Developer (Remote)',
                'company' => 'TechBerlin GmbH',
                'location' => 'Berlin / Remote',
                'remote_ok' => true,
                'type' => 'full_time',
                'description' => 'We are looking for an experienced Laravel developer to join our growing team. You will work on our SaaS platform serving 50,000+ German SMEs. Requirements: 4+ years Laravel, React/Vue, PostgreSQL, Docker, REST APIs. Nice to have: German language skills, experience with German compliance (DSGVO, GoBD).',
                'tech_stack' => ['Laravel', 'React', 'PostgreSQL', 'Docker', 'Redis'],
                'url' => 'https://example.com/jobs/1',
                'language' => 'en',
                'salary_range' => '70,000 – 90,000 EUR',
                'posted_at' => now()->subDays(2),
            ],
            [
                'source' => 'manual',
                'source_id' => 'seed-2',
                'title' => 'Full-Stack Entwickler PHP/React (m/w/d)',
                'company' => 'Mittelstand Digital AG',
                'location' => 'München',
                'remote_ok' => true,
                'type' => 'full_time',
                'description' => 'Wir suchen einen erfahrenen Full-Stack Entwickler für unser Team in München. Kenntnisse in PHP (Laravel/Symfony), React, TypeScript und SQL erforderlich. DSGVO-Kenntnisse von Vorteil. Möglichkeit zum Remote-Arbeiten vorhanden.',
                'tech_stack' => ['PHP', 'Laravel', 'React', 'TypeScript', 'MySQL'],
                'url' => 'https://example.com/jobs/2',
                'language' => 'de',
                'salary_range' => '60.000 – 80.000 EUR',
                'posted_at' => now()->subDays(1),
            ],
            [
                'source' => 'manual',
                'source_id' => 'seed-3',
                'title' => 'Backend Engineer - PHP (Freelance)',
                'company' => 'Hamburg Startup Hub',
                'location' => 'Remote (EU)',
                'remote_ok' => true,
                'type' => 'freelance',
                'description' => 'Looking for a freelance PHP backend engineer for a 6-month contract. Stack: Laravel, PostgreSQL, AWS. Project involves building DSGVO-compliant data processing pipelines for German enterprise clients. Hourly rate: 85-110 EUR.',
                'tech_stack' => ['PHP', 'Laravel', 'PostgreSQL', 'AWS', 'DSGVO'],
                'url' => 'https://example.com/jobs/3',
                'language' => 'en',
                'salary_range' => '85 – 110 EUR/Std.',
                'posted_at' => now()->subHours(6),
            ],
        ];

        foreach ($jobs as $job) {
            JobListing::updateOrCreate(
                ['source' => $job['source'], 'source_id' => $job['source_id']],
                $job
            );
        }
    }
}
