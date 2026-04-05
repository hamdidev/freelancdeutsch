<?php

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Billing\SubscriptionController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Cashier\Http\Controllers\WebhookController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('onboarding',  [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

Route::middleware(['auth', 'verified'])->prefix('billing')->name('billing.')->group(function () {
    Route::get('/',        [SubscriptionController::class, 'index'])->name('plans');
    Route::post('checkout', [SubscriptionController::class, 'checkout'])->name('checkout');
    Route::get('success',  [SubscriptionController::class, 'success'])->name('success');
    Route::post('cancel',  [SubscriptionController::class, 'cancel'])->name('cancel');
    Route::post('resume',  [SubscriptionController::class, 'resume'])->name('resume');
    Route::get('portal',   [SubscriptionController::class, 'portal'])->name('portal');
});

Route::post('stripe/webhook', [WebhookController::class, 'handleWebhook'])->name('cashier.webhook');

// Google
Route::middleware('guest')->group(function () {
    Route::get('auth/google', [SocialiteController::class, 'redirect'])
        ->name('auth.google');

    Route::get('auth/google/callback', [SocialiteController::class, 'callback'])
        ->name('auth.google.callback');
});

require __DIR__ . '/auth.php';
