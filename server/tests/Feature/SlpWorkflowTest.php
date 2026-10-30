<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Jobs\RunSlpAnalysis;
use App\Models\ClinicianPatient;
use App\Models\SlpAssignment;
use App\Models\SlpExercise;
use App\Models\SlpExerciseVersion;
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

    public function test_review_then_publish_is_required_before_assignment(): void
    {
        $admin = $this->user(UserRole::Admin);
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        $version = SlpExerciseVersion::factory()->for(SlpExercise::factory()->for($clinician, 'owner')->create(), 'exercise')->create(['created_by' => $clinician->id, 'configuration' => ['patient_visible' => true]]);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);

        $this->actingAs($clinician)->postJson("/api/v1/slp/exercise-versions/{$version->id}/review")->assertOk();
        $this->actingAs($admin)->postJson("/api/v1/slp/exercise-versions/{$version->id}/publish")->assertOk();
        $this->actingAs($clinician)->postJson('/api/v1/slp/assignments', ['patient_id' => $patient->id, 'exercise_version_id' => $version->id])->assertCreated();
    }

    public function test_attempt_requires_active_consent_and_queues_recording_analysis(): void
    {
        Queue::fake();
        Storage::fake('local');
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);
        $version = SlpExerciseVersion::factory()->create(['status' => 'published', 'configuration' => ['patient_visible' => true]]);
        $assignment = SlpAssignment::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id, 'exercise_version_id' => $version->id]);
        $consent = $this->actingAs($patient)->postJson('/api/v1/slp/consents', ['subject_id' => $patient->id, 'purpose' => 'slp_recording', 'policy_version' => 'v1'])->json('data');
        $attempt = $this->actingAs($patient)->postJson("/api/v1/slp/assignments/{$assignment->id}/attempts", ['submission_key' => 'one', 'consent_id' => $consent['id']])->assertCreated()->json('data');

        $this->actingAs($patient)->postJson("/api/v1/slp/attempts/{$attempt['id']}/recording", ['recording' => UploadedFile::fake()->create('speech.wav', 10, 'audio/wav')])->assertStatus(202)->assertJsonPath('data.status', 'queued');
        Queue::assertPushed(RunSlpAnalysis::class);
    }

    private function user(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
