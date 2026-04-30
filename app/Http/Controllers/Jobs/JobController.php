<?php

namespace App\Http\Controllers\Jobs;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobListing;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'tech' => ['nullable', 'array', 'max:10'],
            'tech.*' => ['string', 'max:50'],
            'remote' => ['nullable', 'boolean'],
        ]);

        $query = JobListing::active()
            ->when(
                $request->search,
                fn ($q) => $q->where('title', 'ilike', "%{$request->search}%")
                    ->orWhere('company', 'ilike', "%{$request->search}%")
                    ->orWhere('description', 'ilike', "%{$request->search}%")
            )
            ->when(
                $request->tech,
                fn ($q) => $q->whereJsonContains('tech_stack', $request->tech)
            )
            ->when(
                $request->remote,
                fn ($q) => $q->where('remote_ok', true)
            )
            ->latest('posted_at')
            ->paginate(20)
            ->withQueryString();

        // Get applied job IDs for current user
        $appliedIds = Application::where('user_id', auth()->id())
            ->pluck('job_id')
            ->toArray();

        return Inertia::render('Jobs/Index', [
            'jobs' => $query,
            'appliedIds' => $appliedIds,
            'filters' => $request->only(['search', 'tech', 'remote']),
        ]);
    }

    public function show(JobListing $job): Response
    {
        $application = Application::where('user_id', auth()->id())
            ->where('job_id', $job->id)
            ->first();

        return Inertia::render('Jobs/Show', [
            'job' => $job,
            'application' => $application,
            'hasCv' => auth()->user()
                ->cvProfiles()
                ->exists(),
        ]);
    }
}
