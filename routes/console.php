<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
Schedule::command('jobs:sync')->dailyAt('06:00');
Schedule::command('email:weekly-progress')->weeklyOn(1, '08:00'); // Monday 8am
Schedule::command('email:nudge-limits')->dailyAt('10:00');
