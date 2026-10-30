<?php

namespace App\Jobs;

use App\Models\SlpAnalysisRun;
use App\Models\SlpAttempt;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RunSlpAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $runId) {}

    public function handle(): void
    {
        $run = SlpAnalysisRun::query()->findOrFail($this->runId);
        $run->update(['status' => 'running']);
        $run->update(['status' => 'succeeded', 'result' => ['schema_version' => '1', 'status' => 'review_required', 'quality' => ['manual_review' => true], 'events' => [], 'metrics' => []]]);
        SlpAttempt::query()->whereKey($run->attempt_id)->update(['status' => 'awaiting_review']);
    }
}
