<?php

namespace App\Http\Controllers\Jobs;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\CvProfile;
use App\Models\JobListing;
use App\Services\BewerbungService;
use App\Services\CvAdaptorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    public function __construct(
        private CvAdaptorService $cvAdaptor,
        private BewerbungService $bewerbung,
    ) {}

    public function index(): Response
    {
        $applications = Application::where('user_id', auth()->id())
            ->with('job')
            ->latest()
            ->paginate(20);

        return Inertia::render('Jobs/Applications', [
            'applications' => $applications,
        ]);
    }

    public function create(JobListing $job): Response
    {
        $cvProfiles = CvProfile::where('user_id', auth()->id())->get();

        return Inertia::render('Jobs/Apply', [
            'job' => $job,
            'cvProfiles' => $cvProfiles,
        ]);
    }

    public function store(Request $request, JobListing $job): RedirectResponse
    {
        $request->validate([
            'cv_profile_id' => ['required', 'exists:cv_profiles,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $cv = CvProfile::findOrFail($request->cv_profile_id);

        abort_if($cv->user_id !== auth()->id(), 403);

        $existing = Application::where('user_id', auth()->id())
            ->where('job_id', $job->id)
            ->first();

        if ($existing) {
            return redirect()->route('applications.show', $existing)
                ->with('status', 'You already have an application for this job.');
        }

        $application = Application::create([
            'user_id' => auth()->id(),
            'job_id' => $job->id,
            'cv_profile_id' => $cv->id,
            'status' => 'draft',
        ]);

        // Generate adapted CV + cover letter
        $adaptedCv = $this->cvAdaptor->adapt($cv, $job);
        $coverLetter = $this->bewerbung->generate(auth()->user(), $cv, $job);

        $application->update([
            'cv_adapted' => $adaptedCv,
            'cover_letter_de' => $coverLetter,
            'notes' => $request->notes,
        ]);

        return redirect()->route('applications.show', $application)
            ->with('status', 'Application materials generated.');
    }

    public function show(Application $application): Response
    {
        abort_if($application->user_id !== auth()->id(), 403);

        return Inertia::render('Jobs/ApplicationShow', [
            'application' => $application->load('job'),
        ]);
    }

    public function updateStatus(Request $request, Application $application): RedirectResponse
    {
        abort_if($application->user_id !== auth()->id(), 403);

        $request->validate([
            'status' => ['required', 'in:draft,sent,interview,rejected,offer'],
        ]);

        $application->update([
            'status' => $request->status,
            'applied_at' => $request->status === 'sent' ? now() : $application->applied_at,
        ]);

        return back()->with('status', 'Status updated.');
    }

    public function destroy(Application $application): RedirectResponse
    {
        abort_if($application->user_id !== auth()->id(), 403);
        $application->delete();

        return redirect()->route('applications.index')
            ->with('status', 'Application removed.');
    }
}
