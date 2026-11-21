<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Jobs\RunSlpAnalysis;
use App\Models\ClinicianPatient;
use App\Models\SlpAnalysisRun;
use App\Models\SlpAssignment;
use App\Models\SlpAttempt;
use App\Models\SlpConsent;
use App\Models\SlpExercise;
use App\Models\SlpExerciseCollection;
use App\Models\SlpExerciseVersion;
use App\Models\SlpRecording;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SlpWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_recording_notice_requires_acceptance_and_withdrawal_only_affects_own_consent(): void
    {
        $patient = $this->user(UserRole::Patient);
        $other = $this->user(UserRole::Patient);
        $payload = ['subject_id' => $patient->id, 'purpose' => 'slp_recording', 'policy_version' => 'v1'];
        $this->actingAs($patient)->postJson('/api/v1/slp/consents', $payload)->assertUnprocessable()->assertJsonValidationErrors('accepted');
        $this->postJson('/api/v1/slp/consents', ['policy_version' => 'unknown', 'accepted' => true] + $payload)->assertUnprocessable()->assertJsonValidationErrors('policy_version');
        $id = $this->postJson('/api/v1/slp/consents', $payload + ['accepted' => true])->assertOk()->json('data.id');
        $this->actingAs($other)->postJson('/api/v1/slp/consents/withdraw')->assertNoContent();
        $this->assertNull(SlpConsent::findOrFail($id)->withdrawn_at);
        $this->actingAs($patient)->postJson('/api/v1/slp/consents/withdraw')->assertNoContent();
        $this->assertNotNull(SlpConsent::findOrFail($id)->withdrawn_at);
    }

    public function test_review_then_publish_is_required_before_assignment(): void
    {
        $admin = $this->user(UserRole::Admin);
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        $version = SlpExerciseVersion::factory()->for(SlpExercise::factory()->for($clinician, 'owner')->create(), 'exercise')->create(['created_by' => $clinician->id, 'configuration' => ['patient_visible' => true]]);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);

        $this->actingAs($clinician)->postJson('/api/v1/slp/assignments', ['patient_id' => $patient->id, 'exercise_version_id' => $version->id])->assertUnprocessable();
        $this->assertDatabaseCount('slp_assignments', 0);
        $this->postJson('/api/v1/slp/assignments', ['patient_id' => $patient->id, 'exercise_version_id' => $version->id, 'schedule' => ['daily' => true]])->assertUnprocessable()->assertJsonValidationErrors('schedule');
        $unrelatedClinician = $this->user(UserRole::Clinician);
        $this->actingAs($unrelatedClinician)->postJson("/api/v1/slp/exercise-versions/{$version->id}/review")->assertForbidden();
        $this->actingAs($clinician)->postJson("/api/v1/slp/exercise-versions/{$version->id}/review")->assertOk();
        $this->actingAs($admin)->postJson("/api/v1/slp/exercise-versions/{$version->id}/publish")->assertOk();
        $this->actingAs($clinician)->postJson("/api/v1/slp/exercise-versions/{$version->id}/review")->assertConflict();
        $this->actingAs($clinician)->postJson('/api/v1/slp/assignments', ['patient_id' => $patient->id, 'exercise_version_id' => $version->id])->assertCreated();
    }

    public function test_patient_can_see_an_existing_assignment_for_an_exercise_without_a_collection(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        $version = SlpExerciseVersion::factory()->create([
            'status' => 'published',
            'configuration' => ['patient_visible' => false],
        ]);
        $assignment = SlpAssignment::factory()->create([
            'clinician_id' => $clinician->id,
            'patient_id' => $patient->id,
            'exercise_version_id' => $version->id,
            'status' => 'active',
        ]);

        $this->actingAs($patient)
            ->getJson('/api/v1/slp/assignments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $assignment->id);
    }

    public function test_assigning_to_all_patients_does_not_require_an_empty_patient_list(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);
        $version = SlpExerciseVersion::factory()
            ->for(SlpExercise::factory()->for($clinician, 'owner')->create(), 'exercise')
            ->create(['status' => 'published', 'configuration' => ['patient_visible' => true]]);

        $this->actingAs($clinician)
            ->postJson('/api/v1/slp/assignments', ['audience' => 'all', 'exercise_version_id' => $version->id])
            ->assertCreated()
            ->assertJsonCount(1, 'data');
    }

    public function test_clinician_assignment_list_includes_patient_and_collection_details(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        $collection = SlpExerciseCollection::factory()->create(['owner_id' => $clinician->id, 'title' => 'Home practice']);
        $exercise = SlpExercise::factory()->for($clinician, 'owner')->for($collection, 'collection')->create();
        $version = SlpExerciseVersion::factory()->for($exercise, 'exercise')->create(['status' => 'published']);
        $assignment = SlpAssignment::factory()->create([
            'clinician_id' => $clinician->id,
            'patient_id' => $patient->id,
            'exercise_version_id' => $version->id,
        ]);

        $this->actingAs($clinician)
            ->getJson('/api/v1/slp/assignments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $assignment->id)
            ->assertJsonPath('data.0.patient.id', $patient->id)
            ->assertJsonPath('data.0.patient.name', $patient->name)
            ->assertJsonPath('data.0.version.exercise.collection.title', 'Home practice');
    }

    public function test_clinician_can_unassign_only_their_own_assignment(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $otherClinician = $this->user(UserRole::Clinician);
        $assignment = SlpAssignment::factory()->create(['clinician_id' => $clinician->id]);

        $this->actingAs($otherClinician)
            ->deleteJson("/api/v1/slp/assignments/{$assignment->id}")
            ->assertForbidden();
        $this->actingAs($clinician)
            ->deleteJson("/api/v1/slp/assignments/{$assignment->id}")
            ->assertNoContent();
        $this->assertDatabaseHas('slp_assignments', [
            'id' => $assignment->id,
            'status' => 'cancelled',
        ]);
        $this->actingAs($clinician)
            ->getJson('/api/v1/slp/assignments')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_attempt_requires_active_consent_and_queues_recording_analysis(): void
    {
        Queue::fake();
        Storage::fake('local');
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);
        $this->actingAs($clinician)->getJson('/api/v1/slp/assignments?per_page=101')->assertUnprocessable();
        $version = SlpExerciseVersion::factory()->create(['status' => 'published', 'configuration' => ['patient_visible' => true]]);
        $assignment = SlpAssignment::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id, 'exercise_version_id' => $version->id]);
        $consent = $this->actingAs($patient)->postJson('/api/v1/slp/consents', ['subject_id' => $patient->id, 'purpose' => 'slp_recording', 'accepted' => true, 'policy_version' => 'v1'])->json('data');
        $attempt = $this->actingAs($patient)->postJson("/api/v1/slp/assignments/{$assignment->id}/attempts", ['submission_key' => 'one', 'consent_id' => $consent['id']])->assertCreated()->json('data');

        $this->actingAs($patient)->postJson("/api/v1/slp/attempts/{$attempt['id']}/recording", ['recording' => UploadedFile::fake()->create('speech.wav', 10, 'audio/x-wav')])->assertStatus(202)->assertJsonPath('data.status', 'queued');
        Queue::assertPushed(RunSlpAnalysis::class);
    }

    public function test_clinical_attempt_access_requires_the_assigned_patient_or_clinician(): void
    {
        $admin = $this->user(UserRole::Admin);
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        $unrelatedClinician = $this->user(UserRole::Clinician);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);
        $version = SlpExerciseVersion::factory()->create(['status' => 'published', 'configuration' => ['patient_visible' => true]]);
        $assignment = SlpAssignment::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id, 'exercise_version_id' => $version->id]);
        $consent = $this->actingAs($patient)->postJson('/api/v1/slp/consents', [
            'subject_id' => $patient->id,
            'purpose' => 'slp_recording',
            'accepted' => true, 'policy_version' => 'v1',
        ])->json('data');
        $attempt = $this->actingAs($patient)->postJson("/api/v1/slp/assignments/{$assignment->id}/attempts", [
            'submission_key' => 'access-check',
            'consent_id' => $consent['id'],
        ])->json('data');
        SlpAttempt::query()->findOrFail($attempt['id'])->update(['status' => 'awaiting_review']);

        $this->actingAs($admin)->getJson("/api/v1/slp/attempts/{$attempt['id']}")->assertForbidden();
        $this->actingAs($unrelatedClinician)->getJson("/api/v1/slp/attempts/{$attempt['id']}")->assertForbidden();
        $this->actingAs($patient)->getJson("/api/v1/slp/attempts/{$attempt['id']}")->assertOk();
        $this->actingAs($clinician)->getJson("/api/v1/slp/attempts/{$attempt['id']}")->assertOk();

        $this->actingAs($admin)->putJson("/api/v1/slp/attempts/{$attempt['id']}/review", [
            'annotations' => [['text' => 'review']],
        ])->assertForbidden();
        $review = $this->actingAs($clinician)->putJson("/api/v1/slp/attempts/{$attempt['id']}/review", [
            'annotations' => [['text' => 'review']],
        ])->assertOk()->json('data');
        $this->actingAs($admin)->postJson("/api/v1/slp/reviews/{$review['id']}/approve")->assertForbidden();
        $approval = $this->actingAs($clinician)->postJson("/api/v1/slp/reviews/{$review['id']}/approve")->assertOk()->json('data');
        $this->actingAs($clinician)->postJson("/api/v1/slp/reviews/{$review['id']}/approve")->assertOk();
        $this->assertDatabaseCount('slp_reports', 1);
        $this->actingAs($clinician)->getJson('/api/v1/slp/reports')->assertOk()->assertJsonPath('data.0.status', 'approved');
        $this->actingAs($patient)->getJson('/api/v1/slp/reports')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($patient)->postJson('/api/v1/slp/reports/'.$approval['report']['id'].'/release')->assertForbidden();
        $this->actingAs($clinician)->postJson('/api/v1/slp/reports/'.$approval['report']['id'].'/release')->assertOk()->assertJsonPath('data.status', 'released');
        $this->actingAs($patient)->getJson('/api/v1/slp/reports')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.status', 'released')->assertJsonMissingPath('data.0.patient');
    }

    public function test_clinician_can_list_review_attempts_and_stream_only_their_recordings(): void
    {
        Storage::fake('local');
        $clinician = $this->user(UserRole::Clinician);
        $otherClinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        $version = SlpExerciseVersion::factory()->create(['status' => 'published', 'configuration' => ['patient_visible' => true]]);
        $assignment = SlpAssignment::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id, 'exercise_version_id' => $version->id]);
        $consent = SlpConsent::query()->create(['subject_id' => $patient->id, 'actor_id' => $patient->id, 'purpose' => 'slp_recording', 'policy_version' => 'v1', 'accepted_at' => now()]);
        $attempt = SlpAttempt::query()->create(['assignment_id' => $assignment->id, 'consent_id' => $consent->id, 'submission_key' => 'review-one', 'status' => 'awaiting_review']);
        SlpAnalysisRun::query()->create(['attempt_id' => $attempt->id, 'status' => 'succeeded', 'schema_version' => '2.0', 'result' => ['meta' => ['status' => 'review_required']]]);
        Storage::disk('local')->put('slp-recordings/review.wav', 'speech');
        SlpRecording::query()->create(['attempt_id' => $attempt->id, 'path' => 'slp-recordings/review.wav', 'mime_type' => 'audio/wav', 'bytes' => 6, 'checksum' => hash('sha256', 'speech'), 'retention_until' => now()->addDay()]);
        SlpAttempt::query()->create(['assignment_id' => $assignment->id, 'consent_id' => $consent->id, 'submission_key' => 'review-failed', 'status' => 'failed']);

        $this->actingAs($clinician)->getJson('/api/v1/slp/review-attempts')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $attempt->id)->assertJsonPath('data.0.recording.mime_type', 'audio/wav');
        $this->actingAs($clinician)->getJson('/api/v1/slp/review-attempts?status=failed')->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs($otherClinician)->getJson('/api/v1/slp/review-attempts')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($patient)->getJson('/api/v1/slp/review-attempts')->assertForbidden();
        $recording = $this->actingAs($clinician)->get("/api/v1/slp/attempts/{$attempt->id}/recording");
        $recording->assertOk()->assertHeader('Content-Type', 'audio/wav');
        $this->assertSame('speech', $recording->streamedContent());
        $this->actingAs($otherClinician)->get("/api/v1/slp/attempts/{$attempt->id}/recording")->assertForbidden();
    }

    public function test_staff_assets_are_private_and_patient_can_only_read_referenced_visible_assets(): void
    {
        Storage::fake('local');
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        $asset = $this->actingAs($clinician)->postJson('/api/v1/slp/assets', ['asset' => UploadedFile::fake()->image('card.png')])->assertOk()->json('data');
        $this->assertArrayNotHasKey('path', $asset);
        $this->actingAs($clinician)->getJson('/api/v1/slp/assets')->assertOk()->assertJsonPath('data.0.id', $asset['id']);
        $this->actingAs($patient)->getJson('/api/v1/slp/assets')->assertForbidden();
        $this->actingAs($patient)->get('/api/v1/slp/assets/'.$asset['id'])->assertForbidden();

        $collection = SlpExerciseCollection::factory()->create(['owner_id' => $this->user(UserRole::Admin)->id, 'patient_audience' => 'platform']);
        $version = SlpExerciseVersion::factory()->create(['status' => 'published', 'configuration' => ['patient_visible' => true, 'asset_ids' => [$asset['id']]]]);
        $version->exercise->update(['collection_id' => $collection->id]);
        $this->actingAs($patient)->get('/api/v1/slp/assets/'.$asset['id'])->assertOk()->assertHeader('Content-Type', 'image/png');
    }

    private function user(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
