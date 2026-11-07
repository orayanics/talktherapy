<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Jobs\RunSlpAnalysis;
use App\Models\SlpAnalysisRun;
use App\Models\SlpAssignment;
use App\Models\SlpAttempt;
use App\Models\SlpConsent;
use App\Models\SlpExerciseVersion;
use App\Models\SlpReport;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SlpAnalysisRecoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_upload_retries_reuse_recording_and_recover_failed_queue_dispatch(): void
    {
        Storage::fake('local');
        [$patient, $attempt] = $this->attempt();
        Bus::shouldReceive('dispatch')->once()->andThrow(new \RuntimeException('Queue unavailable'));
        $file = UploadedFile::fake()->create('speech.wav', 10, 'audio/wav');
        $url = "/api/v1/slp/attempts/{$attempt->id}/recording";
        $first = $this->actingAs($patient)->postJson($url, ['recording' => $file])->assertStatus(202)->json('data');
        $this->assertDatabaseCount('slp_recordings', 1);
        $this->assertDatabaseCount('slp_analysis_runs', 1);
        Bus::fake();
        $this->postJson($url, ['recording' => $file])->assertStatus(202)->assertJsonPath('data.recording_id', $first['recording_id']);
        Bus::assertDispatched(RunSlpAnalysis::class);
        $this->assertCount(1, Storage::disk('local')->allFiles('slp-recordings'));
        Bus::fake();
        SlpAnalysisRun::query()->update(['updated_at' => now()->subMinutes(6)]);
        $this->artisan('app:dispatch-slp-analysis')->assertSuccessful();
        Bus::assertDispatched(RunSlpAnalysis::class);
    }

    public function test_failed_recording_persistence_removes_the_file_and_rolls_back_state(): void
    {
        Storage::fake('local');
        [$patient, $attempt] = $this->attempt();
        SlpAnalysisRun::creating(fn () => throw new \RuntimeException('Cannot persist run'));
        try {
            $this->actingAs($patient)->postJson("/api/v1/slp/attempts/{$attempt->id}/recording", ['recording' => UploadedFile::fake()->create('speech.wav', 10, 'audio/wav')])->assertStatus(500);
            $this->assertDatabaseCount('slp_recordings', 0);
            $this->assertSame('created', $attempt->fresh()->status);
            $this->assertSame([], Storage::disk('local')->allFiles('slp-recordings'));
        } finally {
            SlpAnalysisRun::flushEventListeners();
        }
    }

    public function test_job_is_idempotent_and_does_not_overwrite_an_approved_attempt(): void
    {
        [, $attempt] = $this->attempt();
        $attempt->update(['status' => 'queued']);
        $run = SlpAnalysisRun::query()->create(['attempt_id' => $attempt->id, 'status' => 'queued']);
        (new RunSlpAnalysis($run->id))->handle();
        $this->assertSame('awaiting_review', $attempt->fresh()->status);
        $attempt->update(['status' => 'approved']);
        (new RunSlpAnalysis($run->id))->handle();
        $this->assertSame('approved', $attempt->fresh()->status);
        $late = SlpAnalysisRun::query()->create(['attempt_id' => $attempt->id, 'status' => 'queued']);
        (new RunSlpAnalysis($late->id))->handle();
        $this->assertSame('approved', $attempt->fresh()->status);
        $this->assertSame('attempt_state_changed', $late->fresh()->failure_code);
    }

    public function test_withdrawal_blocks_queued_analysis(): void
    {
        [, $attempt] = $this->attempt();
        $attempt->update(['status' => 'queued']);
        $run = SlpAnalysisRun::query()->create(['attempt_id' => $attempt->id, 'status' => 'queued']);
        $attempt->consent->update(['withdrawn_at' => now()]);
        (new RunSlpAnalysis($run->id))->handle();
        $this->assertSame('failed', $run->fresh()->status);
        $this->assertSame('consent_withdrawn', $run->fresh()->failure_code);
        $this->assertNull($run->fresh()->result);
    }

    public function test_changed_patient_audience_blocks_both_upload_and_queued_analysis(): void
    {
        Storage::fake('local');
        [$patient, $attempt] = $this->attempt();
        $attempt->assignment->version->update(['configuration' => ['patient_visible' => true, 'patient_audience' => 'selected', 'patient_ids' => []]]);
        $this->actingAs($patient)->postJson("/api/v1/slp/attempts/{$attempt->id}/recording", ['recording' => UploadedFile::fake()->create('speech.wav', 10, 'audio/wav')])->assertConflict();
        $this->assertSame([], Storage::disk('local')->allFiles());
        $attempt->update(['status' => 'queued']);
        $run = SlpAnalysisRun::query()->create(['attempt_id' => $attempt->id, 'status' => 'queued']);
        (new RunSlpAnalysis($run->id))->handle();
        $this->assertSame('exercise_unavailable', $run->fresh()->failure_code);
        $this->assertSame('failed', $attempt->fresh()->status);
    }

    public function test_report_failure_rolls_back_approval(): void
    {
        [, $attempt, $clinician] = $this->attempt();
        $review = $attempt->reviews()->create(['revision' => 1, 'reviewer_id' => $clinician->id, 'status' => 'draft', 'annotations' => []]);
        SlpReport::creating(fn () => throw new \RuntimeException('Cannot persist report'));
        try {
            $this->actingAs($clinician)->postJson("/api/v1/slp/reviews/{$review->id}/approve")->assertStatus(500);
            $this->assertSame('draft', $review->fresh()->status);
            $this->assertSame('created', $attempt->fresh()->status);
            $this->assertDatabaseCount('slp_reports', 0);
        } finally {
            SlpReport::flushEventListeners();
        }
    }

    private function attempt(): array
    {
        $patient = User::factory()->create();
        UserProfile::factory()->for($patient)->create(['role' => UserRole::Patient]);
        $clinician = User::factory()->create();
        UserProfile::factory()->for($clinician)->create(['role' => UserRole::Clinician]);
        $version = SlpExerciseVersion::factory()->create(['status' => 'published', 'configuration' => ['patient_visible' => true]]);
        $assignment = SlpAssignment::factory()->create(['patient_id' => $patient->id, 'clinician_id' => $clinician->id, 'exercise_version_id' => $version->id]);
        $consent = SlpConsent::query()->create(['subject_id' => $patient->id, 'actor_id' => $patient->id, 'purpose' => 'slp_recording', 'policy_version' => 'v1', 'accepted_at' => now()]);
        $attempt = SlpAttempt::query()->create(['assignment_id' => $assignment->id, 'consent_id' => $consent->id, 'submission_key' => 'one', 'status' => 'created']);

        return [$patient, $attempt, $clinician];
    }
}
