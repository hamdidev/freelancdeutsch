<?php

namespace App\Services\Jobs;

use Illuminate\Support\Facades\Log;

class JobAggregator
{
    public function __construct(
        private ArbeitNowSource $arbeitNow,
        private RemotiveSource $remotive,
    ) {}

    public function sync(): array
    {
        $results = [];

        try {
            $results['arbeitnow'] = $this->arbeitNow->fetch([
                'laravel',
                'react',
                'php',
                'typescript',
                'vue',
            ]);
        } catch (\Exception $e) {
            Log::error('ArbeitNow sync failed', ['error' => $e->getMessage()]);
            $results['arbeitnow'] = 0;
        }

        try {
            $results['remotive'] = $this->remotive->fetch([
                'software-dev',
                'devops',
            ]);
        } catch (\Exception $e) {
            Log::error('Remotive sync failed', ['error' => $e->getMessage()]);
            $results['remotive'] = 0;
        }

        $results['total'] = array_sum($results);
        Log::info('Job sync completed', $results);

        return $results;
    }
}
