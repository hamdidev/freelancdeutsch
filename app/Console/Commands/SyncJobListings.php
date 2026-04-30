<?php

namespace App\Console\Commands;

use App\Services\Jobs\JobAggregator;
use Illuminate\Console\Command;

class SyncJobListings extends Command
{
    protected $signature = 'jobs:sync';

    protected $description = 'Sync job listings from external sources';

    public function handle(JobAggregator $aggregator): int
    {
        $this->info('Syncing job listings...');

        $results = $aggregator->sync();

        $this->table(
            ['Source', 'Imported'],
            collect($results)->except('total')->map(fn ($count, $source) => [
                $source,
                $count,
            ])->values()->toArray()
        );

        $this->info("Total: {$results['total']} jobs synced.");

        return Command::SUCCESS;
    }
}
