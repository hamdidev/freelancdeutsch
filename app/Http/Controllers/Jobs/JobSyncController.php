<?php

namespace App\Http\Controllers\Jobs;

use App\Http\Controllers\Controller;
use App\Services\Jobs\JobAggregator;
use Illuminate\Http\RedirectResponse;

class JobSyncController extends Controller
{
    public function __invoke(JobAggregator $aggregator): RedirectResponse
    {
        $results = $aggregator->sync();

        return back()->with('status', "Synced {$results['total']} jobs.");
    }
}
