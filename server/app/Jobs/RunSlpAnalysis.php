<?php

namespace App\Jobs;

use App\Models\SlpAnalysisRun;
use App\Models\SlpAttempt;
use App\Services\PhonemeClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\UploadedFile;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class RunSlpAnalysis implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $runId) {}

    public function handle(PhonemeClient $client): void
    {
        $context = DB::transaction(function (): array {
            $initial = SlpAnalysisRun::query()->findOrFail($this->runId);
            $attempt = SlpAttempt::query()->with(['assignment.version', 'recording'])->lockForUpdate()->findOrFail($initial->attempt_id);
            $run = SlpAnalysisRun::query()->lockForUpdate()->findOrFail($this->runId);
            if ($run->status !== 'queued') {
                return [];
            }
            $consent = $attempt->consent()->lockForUpdate()->firstOrFail();
            if ($consent->withdrawn_at !== null || $attempt->status !== 'queued') {
                $run->update(['status' => 'failed', 'failure_code' => $consent->withdrawn_at !== null ? 'consent_withdrawn' : 'attempt_state_changed']);
                if ($attempt->status === 'queued') {
                    $attempt->update(['status' => 'failed']);
                }

                return [];
            }
            if (! $attempt->assignment->availableToPatient($attempt->assignment->patient_id)) {
                $run->update(['status' => 'failed', 'failure_code' => 'exercise_unavailable']);
                $attempt->update(['status' => 'failed']);

                return [];
            }
            $recording = $attempt->recording;
            $path = $recording === null ? null : Storage::disk('local')->path($recording->path);
            if ($path === null || ! is_file($path)) {
                $run->update(['status' => 'failed', 'failure_code' => 'recording_unavailable']);
                $attempt->update(['status' => 'failed']);

                return [];
            }
            $run->update(['status' => 'running']);

            return [$attempt, $path];
        });
        if ($context === []) {
            return;
        }

        [$attempt, $path] = $context;
        try {
            $result = $client->assess(
                new UploadedFile($path, basename($path), $attempt->recording->mime_type, null, true),
                $attempt->assignment->version->prompt_text,
                $this->runId,
                $attempt->assignment->version->language,
            );
            DB::transaction(function () use ($result): void {
                $run = SlpAnalysisRun::query()->lockForUpdate()->findOrFail($this->runId);
                $attempt = SlpAttempt::query()->lockForUpdate()->findOrFail($run->attempt_id);
                if ($run->status !== 'running' || $attempt->status !== 'queued') {
                    return;
                }
                $run->update([
                    'status' => 'succeeded',
                    'schema_version' => (string) ($result['meta']['schemaVersion'] ?? '1'),
                    'result' => $result,
                ]);
                $attempt->update(['status' => 'awaiting_review']);
            });
        } catch (Throwable $exception) {
            DB::transaction(function () use ($exception): void {
                $run = SlpAnalysisRun::query()->lockForUpdate()->findOrFail($this->runId);
                $attempt = SlpAttempt::query()->lockForUpdate()->findOrFail($run->attempt_id);
                if ($run->status === 'running') {
                    $run->update(['status' => 'failed', 'failure_code' => $this->failureCode($exception)]);
                    if ($attempt->status === 'queued') {
                        $attempt->update(['status' => 'failed']);
                    }
                }
            });
        }
    }

    private function failureCode(Throwable $exception): string
    {
        return match (true) {
            str_contains(strtolower($exception->getMessage()), 'timeout') => 'service_timeout',
            str_contains(strtolower($exception->getMessage()), 'validation') => 'invalid_result',
            default => 'service_unavailable',
        };
    }
}
