<?php

use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Billing\SubscriptionController;
use App\Http\Controllers\Billing\WebhookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Documents\ClientController;
use App\Http\Controllers\Documents\DocumentController;
use App\Http\Controllers\Jobs\ApplicationController;
use App\Http\Controllers\Jobs\CvProfileController;
use App\Http\Controllers\Jobs\JobController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Language\ReviewController;
use App\Http\Controllers\Language\VocabularyController;
use App\Http\Controllers\Language\WritingController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Services\Jobs\JobAggregator;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');
Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('onboarding', [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

Route::middleware(['auth', 'verified'])->prefix('billing')->name('billing.')->group(function () {
    Route::get('/', [SubscriptionController::class, 'index'])->name('plans');
    Route::post('checkout', [SubscriptionController::class, 'checkout'])->name('checkout');
    Route::get('success', [SubscriptionController::class, 'success'])->name('success');
    Route::post('cancel', [SubscriptionController::class, 'cancel'])->name('cancel');
    Route::post('resume', [SubscriptionController::class, 'resume'])->name('resume');
    Route::get('portal', [SubscriptionController::class, 'portal'])->name('portal');
});
Route::middleware(['auth', 'verified'])->group(function () {

    // Documents
    Route::prefix('documents')->name('documents.')->group(function () {
        Route::get('/', [DocumentController::class, 'index'])->name('index');
        Route::get('/create', [DocumentController::class, 'create'])->name('create');
        Route::post('/', [DocumentController::class, 'store'])->name('store')
            ->middleware('feature.limit:documents');
        Route::get('/{document}', [DocumentController::class, 'show'])->name('show');
        Route::post('/{document}/finalise', [DocumentController::class, 'finalise'])->name('finalise');
        Route::post('/{document}/paid', [DocumentController::class, 'markPaid'])->name('paid');
        Route::get('/{document}/download', [DocumentController::class, 'download'])->name('download');
        Route::delete('/{document}', [DocumentController::class, 'destroy'])->name('destroy');
    });

    // Clients
    Route::prefix('clients')->name('clients.')->group(function () {
        Route::get('/', [ClientController::class, 'index'])->name('index');
        Route::post('/', [ClientController::class, 'store'])->name('store');
        Route::put('/{client}', [ClientController::class, 'update'])->name('update');
        Route::delete('/{client}', [ClientController::class, 'destroy'])->name('destroy');
    });
    // Jobs
    Route::prefix('jobs')->name('jobs.')->group(function () {
        Route::get('/', [JobController::class, 'index'])->name('index');
        Route::get('/{job}', [JobController::class, 'show'])->name('show');
    });

    // Applications
    Route::prefix('applications')->name('applications.')->group(function () {
        Route::get('/', [ApplicationController::class, 'index'])->name('index');
        Route::get('/jobs/{job}/apply', [ApplicationController::class, 'create'])->name('create');
        Route::post('/jobs/{job}/apply', [ApplicationController::class, 'store'])->name('store');
        Route::get('/{application}', [ApplicationController::class, 'show'])->name('show');
        Route::patch('/{application}/status', [ApplicationController::class, 'updateStatus'])->name('status');
        Route::delete('/{application}', [ApplicationController::class, 'destroy'])->name('destroy');
    });

    // CV Profiles
    Route::prefix('cv-profiles')->name('cv.')->group(function () {
        Route::get('/', [CvProfileController::class, 'index'])->name('index');
        Route::post('/', [CvProfileController::class, 'store'])->name('store');
        Route::delete('/{cvProfile}', [CvProfileController::class, 'destroy'])->name('destroy');
    });
});

Route::post('stripe/webhook', [WebhookController::class, 'handleWebhook'])->name('cashier.webhook');
Route::get('stripe/payment/{payment}', '\Laravel\Cashier\Http\Controllers\PaymentController@show')->name('cashier.payment');

// Google
Route::middleware('guest')->group(function () {
    Route::get('auth/google', [SocialiteController::class, 'redirect'])
        ->name('auth.google');

    Route::get('auth/google/callback', [SocialiteController::class, 'callback'])
        ->name('auth.google.callback');
});
Route::middleware(['auth', 'verified'])->prefix('language')->name('language.')->group(function () {
    // Vocabulary
    Route::get('/', [VocabularyController::class, 'index'])->name('index');
    Route::get('study/{domain?}', [VocabularyController::class, 'study'])->name('study');

    // SRS reviews
    Route::post('cards/{card}/review', [ReviewController::class, 'store'])
        ->name('cards.review')
        ->middleware('feature.limit:vocab_cards');

    // Writing practice
    Route::get('writing', [WritingController::class, 'index'])->name('writing');
    Route::post('writing/evaluate', [WritingController::class, 'evaluate'])
        ->name('writing.evaluate')
        ->middleware('feature.limit:ai_writing');
});

Route::post('/jobs/sync', function () {
    $aggregator = app(JobAggregator::class);
    $results = $aggregator->sync();

    return back()->with('status', "Synced {$results['total']} jobs.");
})->middleware(['auth'])->name('jobs.sync');
Route::view('/impressum', 'legal.impressum')->name('impressum');
Route::view('/datenschutz', 'legal.datenschutz')->name('datenschutz');
Route::view('/agb', 'legal.agb')->name('agb');
require __DIR__.'/auth.php';
