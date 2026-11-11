<?php

namespace App\Console\Commands;

use App\Jobs\RunSlpAnalysis;
use App\Models\SlpAnalysisRun;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:dispatch-slp-analysis')]
#[Description('Recover queued SLP analysis dispatches')]
class DispatchSlpAnalysis extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        SlpAnalysisRun::query()->where('status', 'queued')->where('updated_at', '<=', now()->subMinutes(5))
            ->orderBy('updated_at')->limit(100)->get()->each(function (SlpAnalysisRun $run): void {
                RunSlpAnalysis::dispatch($run->id);
                $run->touch();
            });

        return self::SUCCESS;
    }
}
