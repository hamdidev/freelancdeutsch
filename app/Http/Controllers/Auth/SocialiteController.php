<?php

namespace App\Http\Controllers\Auth;

use App\Actions\GenerateUsername;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect(): \Symfony\Component\HttpFoundation\RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): \Illuminate\Http\RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')
                ->withErrors(['email' => 'Google authentication failed. Please try again.']);
        }
        $existing = User::where('email', $googleUser->getEmail())
            ->whereNull('google_id')
            ->first();

        if ($existing) {
            // Merge accounts — attach google_id to existing user
            $existing->update([
                'google_id' => $googleUser->getId(),
                'avatar'    => $existing->avatar ?? $googleUser->getAvatar(),
            ]);
            Auth::login($existing, remember: true);
            return redirect()->intended(route('dashboard'));
        }
        $user = User::updateOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name'              => $googleUser->getName(),
                'username'          => app(GenerateUsername::class)($googleUser->getName()),
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'password'          => bcrypt(Str::random(24)),
            ]
        );

        Auth::login($user, remember: true);

        // Send to onboarding if not completed yet
        if (! $user->onboarding_complete) {
            return redirect()->route('onboarding');
        }

        return redirect()->intended(route('dashboard'));
    }
}
