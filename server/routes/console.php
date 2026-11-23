<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:deliver-notifications')->everyMinute();
Schedule::command('app:dispatch-slp-analysis')->everyMinute()->withoutOverlapping();
Schedule::command('app:cleanup-slp-recordings')->dailyAt('02:15')->withoutOverlapping();
