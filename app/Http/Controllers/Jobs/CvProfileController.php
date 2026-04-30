<?php

namespace App\Http\Controllers\Jobs;

use App\Http\Controllers\Controller;
use App\Models\CvProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CvProfileController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Jobs/CvProfiles', [
            'profiles' => CvProfile::where('user_id', auth()->id())->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'raw_cv' => ['required', 'string', 'min:100'],
            'target_role' => ['nullable', 'string', 'max:255'],
            'years_experience' => ['nullable', 'string'],
            'ai_consent' => ['required', 'accepted'],
        ]);

        $profile = CvProfile::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'raw_cv' => $request->raw_cv,
            'target_role' => $request->target_role,
            'years_experience' => $request->years_experience,
            'is_default' => ! CvProfile::where('user_id', auth()->id())->exists(),
        ]);

        $profile->ai_processing_consent_at = now();
        $profile->save();

        return back()->with('status', 'CV profile saved.');
    }

    public function destroy(CvProfile $cvProfile): RedirectResponse
    {
        $this->authorize('delete', $cvProfile);
        $cvProfile->delete();

        return back()->with('status', 'CV profile deleted.');
    }
}
