<?php

namespace Tests\Feature;

use App\Models\ClinicianPatient;
use App\Models\SlpAssignment;
use App\Models\SlpExercise;
use App\Models\SlpExerciseCollection;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\PhonemeClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SlpCollectionAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_collection_audiences_include_admin_and_clinician_content_without_leaking_recipients(): void
    {
        $patient = $this->user('patient');
        $otherPatient = $this->user('patient');
        $clinician = $this->user('clinician');
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);
        $all = $this->collection($this->user('admin'), 'platform');
        $sudo = $this->collection($this->user('superadmin'), 'platform');
        $roster = $this->collection($clinician, 'clinician');
        $platform = $this->collection($clinician, 'platform');
        $selected = $this->collection($clinician, 'selected', [$patient->id]);
        $this->collection($clinician, 'selected', [$otherPatient->id]);
        $this->collection($clinician, 'assigned');
        $hidden = $this->collection($clinician, 'platform');
        $hidden->update(['is_hidden' => true]);
        $draft = SlpExerciseCollection::factory()->create(['owner_id' => $clinician->id, 'patient_audience' => 'platform']);
        SlpExercise::factory()->for($clinician, 'owner')->withDraft()->create(['collection_id' => $draft->id]);

        $response = $this->actingAs($patient)->getJson('/api/v1/slp/collections')->assertOk()->assertJsonCount(6, 'data');
        $this->assertEqualsCanonicalizing([$all->id, $sudo->id, $roster->id, $platform->id, $selected->id, $draft->id], array_column($response->json('data'), 'id'));
        foreach ($response->json('data') as $item) {
            $this->assertFalse($item['can_manage']);
            $this->assertArrayNotHasKey('patient_ids', $item);
            $this->assertArrayNotHasKey('exercises_count', $item);
        }
        $this->getJson('/api/v1/slp/collections/'.$selected->id.'/practice')->assertOk()->assertJsonCount(1, 'data')->assertJsonMissingPath('data.0.configuration');
        $this->getJson('/api/v1/slp/collections/'.$draft->id.'/practice')->assertOk()->assertJsonCount(0, 'data');
        $this->actingAs($otherPatient)->getJson('/api/v1/slp/collections')->assertOk()->assertJsonCount(5, 'data');
        $this->getJson('/api/v1/slp/collections/'.$roster->id)->assertForbidden();
        $this->getJson('/api/v1/slp/collections/'.$selected->id.'/practice')->assertForbidden();
    }

    public function test_assigned_revision_survives_hiding_but_other_exercises_and_new_revisions_do_not_leak(): void
    {
        $patient = $this->user('patient');
        $owner = $this->user('clinician');
        $collection = $this->collection($owner, 'platform');
        $exercise = $collection->exercises()->firstOrFail();
        $version = $exercise->versions()->firstOrFail();
        $version->update(['configuration' => ['patient_visible' => false]]);
        SlpAssignment::factory()->create(['patient_id' => $patient->id, 'clinician_id' => $owner->id, 'exercise_version_id' => $version->id, 'status' => 'active']);
        $exercise->versions()->create(['revision' => 2, 'language' => 'en', 'task_type' => 'word', 'status' => 'published', 'prompt_text' => 'new prompt', 'created_by' => $owner->id]);
        SlpExercise::factory()->for($owner, 'owner')->withDraft(['status' => 'published'])->create(['collection_id' => $collection->id]);
        $collection->update(['is_hidden' => true]);
        $exercise->update(['is_hidden' => true]);
        $this->actingAs($patient)->getJson('/api/v1/slp/collections')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/slp/collections/'.$collection->id.'/practice')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $version->id);
        $this->actingAs($this->user('patient'))->getJson('/api/v1/slp/collections/'.$collection->id.'/practice')->assertForbidden();
    }

    public function test_patient_audio_submission_rechecks_audience_and_uses_the_saved_revision(): void
    {
        $patient = $this->user('patient');
        $collection = $this->collection($this->user('admin'), 'platform');
        $version = $collection->exercises()->firstOrFail()->versions()->firstOrFail();
        $this->mock(PhonemeClient::class)->shouldReceive('assess')->once()->withArgs(fn ($audio, $prompt, $requestId, $language) => $prompt === 'araw' && $language === 'tl')->andReturn(['feedback' => ['text' => 'Listen together.']]);
        $this->actingAs($patient)->postJson('/api/v1/slp/assess', ['exercise_version_id' => $version->id, 'audio' => $this->wav()])->assertOk()->assertJsonPath('data.feedback.text', 'Listen together.');
        $collection->update(['is_hidden' => true]);
        $this->postJson('/api/v1/slp/assess', ['exercise_version_id' => $version->id, 'audio' => $this->wav()])->assertNotFound();
        $this->postJson('/api/v1/slp/assess', ['exercise_version_id' => $version->id, 'reference_text' => 'override', 'audio' => $this->wav()])->assertUnprocessable();
    }

    public function test_audience_practice_uses_latest_published_revision_and_excludes_hidden_exercises(): void
    {
        $owner = $this->user('admin');
        $collection = $this->collection($owner, 'platform');
        $exercise = $collection->exercises()->firstOrFail();
        $published = $exercise->versions()->create(['revision' => 2, 'language' => 'en', 'task_type' => 'word', 'status' => 'published', 'prompt_text' => 'Latest published', 'created_by' => $owner->id]);
        $exercise->versions()->create(['revision' => 3, 'language' => 'en', 'task_type' => 'word', 'status' => 'draft', 'prompt_text' => 'Private draft', 'created_by' => $owner->id]);
        $this->actingAs($this->user('patient'))->getJson('/api/v1/slp/collections/'.$collection->id.'/practice')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $published->id)->assertDontSee('Private draft');
        $exercise->update(['is_hidden' => true]);
        $this->getJson('/api/v1/slp/collections')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/slp/collections/'.$collection->id.'/practice')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_admin_read_access_does_not_grant_update_delete_or_patient_selection_access(): void
    {
        $collection = $this->collection($this->user('clinician'), 'selected', [$this->user('patient')->id]);
        $collection->update(['is_hidden' => true]);
        $exercise = $collection->exercises()->firstOrFail();
        foreach (['admin', 'superadmin'] as $role) {
            $this->actingAs($this->user($role))->getJson('/api/v1/slp/collections/'.$collection->id)->assertOk()->assertJsonPath('data.can_manage', false)->assertJsonMissingPath('data.patient_ids');
            $this->getJson('/api/v1/slp/exercises?collection_id='.$collection->id)->assertOk()->assertJsonPath('data.0.can_manage', false);
            $this->patchJson('/api/v1/slp/collections/'.$collection->id, ['patient_audience' => 'platform'])->assertForbidden();
            $this->deleteJson('/api/v1/slp/collections/'.$collection->id)->assertForbidden();
            $this->patchJson('/api/v1/slp/exercises/'.$exercise->id, ['is_hidden' => false])->assertForbidden();
            $this->deleteJson('/api/v1/slp/exercises/'.$exercise->id)->assertForbidden();
        }
    }

    public function test_selected_patients_are_validated_against_the_clinicians_roster(): void
    {
        $owner = $this->user('clinician');
        $patient = $this->user('patient');
        $stranger = $this->user('patient');
        ClinicianPatient::factory()->create(['clinician_id' => $owner->id, 'patient_id' => $patient->id]);
        $this->actingAs($owner)->postJson('/api/v1/slp/collections', ['title' => 'Practice', 'patient_audience' => 'selected', 'patient_ids' => [$stranger->id]])->assertUnprocessable()->assertJsonValidationErrors('patient_ids');
        $id = $this->postJson('/api/v1/slp/collections', ['title' => 'Practice', 'patient_audience' => 'selected', 'patient_ids' => [$patient->id]])->assertCreated()->json('data.id');
        $this->patchJson('/api/v1/slp/collections/'.$id, ['patient_ids' => []])->assertUnprocessable();
        $this->patchJson('/api/v1/slp/collections/'.$id, ['patient_audience' => 'platform'])->assertOk()->assertJsonPath('data.patient_ids', []);
        $this->actingAs($this->user('admin'))->postJson('/api/v1/slp/collections', ['title' => 'Practice', 'patient_audience' => 'selected', 'patient_ids' => [$stranger->id]])->assertForbidden();
    }

    public function test_cover_access_follows_patient_audience_and_hidden_status(): void
    {
        Storage::fake('local');
        $collection = $this->collection($this->user('admin'), 'platform');
        Storage::disk('local')->put('slp-collection-covers/test.png', 'image');
        $collection->update(['cover_path' => 'slp-collection-covers/test.png']);
        $this->actingAs($this->user('patient'))->getJson('/api/v1/slp/collections/'.$collection->id.'/cover')->assertOk();
        $collection->update(['is_hidden' => true]);
        $this->getJson('/api/v1/slp/collections/'.$collection->id.'/cover')->assertForbidden();
    }

    private function collection(User $owner, string $audience, array $ids = []): SlpExerciseCollection
    {
        $collection = SlpExerciseCollection::factory()->create(['owner_id' => $owner->id, 'patient_audience' => $audience, 'patient_ids' => $ids]);
        SlpExercise::factory()->for($owner, 'owner')->withDraft(['status' => 'published', 'prompt_text' => 'araw', 'language' => 'tl', 'configuration' => ['patient_visible' => true]])->create(['collection_id' => $collection->id]);

        return $collection;
    }

    private function user(string $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => 'active']);

        return $user->load('profile');
    }

    private function wav(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('recording.wav', 'RIFF'.pack('V', 36).'WAVEfmt '.pack('V', 16).pack('v', 1).pack('v', 1).pack('V', 16000).pack('V', 32000).pack('v', 2).pack('v', 16).'data'.pack('V', 0));
    }
}
