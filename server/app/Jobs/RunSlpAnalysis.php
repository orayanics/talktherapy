<?php

namespace App\Jobs;

use App\Models\SlpAnalysisRun;
use App\Models\SlpAttempt;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class RunSlpAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $runId) {}

    public function handle(): void
    {
        DB::transaction(function (): void {
            $initial = SlpAnalysisRun::query()->findOrFail($this->runId);
            $attempt = SlpAttempt::query()->lockForUpdate()->findOrFail($initial->attempt_id);
            $run = SlpAnalysisRun::query()->lockForUpdate()->findOrFail($this->runId);
            if ($run->status !== 'queued') {
                return;
            }
            $consent = $attempt->consent()->lockForUpdate()->firstOrFail();
            if ($consent->withdrawn_at !== null || $attempt->status !== 'queued') {
                $run->update(['status' => 'failed', 'failure_code' => $consent->withdrawn_at !== null ? 'consent_withdrawn' : 'attempt_state_changed']);
                if ($attempt->status === 'queued') {
                    $attempt->update(['status' => 'failed']);
                }

                return;
            }
            if (! $attempt->assignment->availableToPatient($attempt->assignment->patient_id)) {
                $run->update(['status' => 'failed', 'failure_code' => 'exercise_unavailable']);
                $attempt->update(['status' => 'failed']);

                return;
            }
            $run->update(['status' => 'succeeded', 'result' => ['schema_version' => '1', 'status' => 'review_required', 'quality' => ['manual_review' => true], 'events' => [], 'metrics' => []]]);
            $attempt->update(['status' => 'awaiting_review']);
        });
    }
}
