<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function show(): \Inertia\Response
    {
        return Inertia::render('Onboarding/Index', [
            'user' => Auth::user()->only([
                'name',
                'username',
                'email',
                'german_level',
                'freelance_domain',
                'steuernummer',
                'ust_id',
            ]),
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'german_level'      => ['required', 'in:A1,A2,B1,B2,C1,C2'],
            'freelance_domain'  => ['required', 'in:it,legal,finance,marketing,design,other'],
            'steuernummer'      => ['nullable', 'string', 'max:20'],
            'ust_id'            => ['nullable', 'string', 'max:20', 'regex:/^DE[0-9]{9}$/'],
            'username'          => ['required', 'string', 'min:3', 'max:30', 'unique:users,username,' . Auth::id()],
        ], [
            'ust_id.regex'      => 'USt-IdNr must be in the format DE123456789.',
        ]);

        Auth::user()->update([
            ...$validated,
            'onboarding_complete' => true,
        ]);

        return redirect()->route('dashboard')
            ->with('status', 'Welcome to FreelancDeutsch!');
    }
}
