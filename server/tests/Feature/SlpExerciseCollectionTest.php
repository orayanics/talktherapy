<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\ClinicianPatient;
use App\Models\SlpExercise;
use App\Models\SlpExerciseCollection;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SlpExerciseCollectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_staff_role_can_crud_only_owned_collections_and_exercises(): void
    {
        $other = $this->user(UserRole::Clinician);
        $foreign = SlpExerciseCollection::factory()->create(['owner_id' => $other->id]);
        $exercise = SlpExercise::factory()->for($other, 'owner')->withDraft()->create(['collection_id' => $foreign->id]);
        foreach ([UserRole::Clinician, UserRole::Admin, UserRole::Superadmin] as $role) {
            $actor = $this->user($role);
            $this->actingAs($actor)->getJson('/api/v1/slp/collections')->assertOk()->assertJsonCount($role === UserRole::Clinician ? 0 : 1, 'data');
            $this->getJson("/api/v1/slp/collections/{$foreign->id}")->assertStatus($role === UserRole::Clinician ? 403 : 200);
            $this->patchJson("/api/v1/slp/collections/{$foreign->id}", ['title' => 'No'])->assertForbidden();
            $this->deleteJson("/api/v1/slp/collections/{$foreign->id}")->assertForbidden();
            $this->getJson('/api/v1/slp/exercises')->assertOk()->assertJsonCount($role === UserRole::Clinician ? 0 : 1, 'data');
            $this->getJson("/api/v1/slp/exercises/{$exercise->id}")->assertStatus($role === UserRole::Clinician ? 403 : 200);
            $this->patchJson("/api/v1/slp/exercises/{$exercise->id}", ['is_hidden' => true])->assertForbidden();
            $this->deleteJson("/api/v1/slp/exercises/{$exercise->id}")->assertForbidden();
            $this->patchJson('/api/v1/slp/exercise-versions/'.$exercise->versions->first()->id.'/visibility', ['visible' => true])->assertForbidden();
            if ($role !== UserRole::Clinician) {
                $this->postJson('/api/v1/slp/collections', ['title' => 'No'])->assertForbidden();

                continue;
            }
            $id = $this->postJson('/api/v1/slp/collections', ['title' => 'My collection', 'description' => 'Practice', 'owner_id' => $other->id])->assertCreated()->assertJsonPath('data.owner_id', $actor->id)->assertJsonPath('data.is_hidden', false)->json('data.id');
            $this->getJson("/api/v1/slp/collections/{$id}")->assertOk();
            $this->patchJson("/api/v1/slp/collections/{$id}", ['title' => 'Updated', 'is_hidden' => true])->assertOk()->assertJsonPath('data.is_hidden', true);
            $this->deleteJson("/api/v1/slp/collections/{$id}")->assertNoContent();
            $this->assertDatabaseHas('slp_exercise_collections', ['id' => $id, 'title' => 'Updated']);
            $this->assertNotNull(SlpExerciseCollection::findOrFail($id)->archived_at);
        }
    }

    public function test_patient_and_guest_cannot_manage_collections(): void
    {
        $collection = SlpExerciseCollection::factory()->create();
        $this->getJson('/api/v1/slp/collections')->assertUnauthorized();
        $this->actingAs($this->user(UserRole::Patient));
        $this->getJson('/api/v1/slp/collections')->assertOk()->assertJsonCount(0, 'data');
        $this->postJson('/api/v1/slp/collections', ['title' => 'No'])->assertForbidden();
        $this->getJson("/api/v1/slp/collections/{$collection->id}")->assertForbidden();
        $this->patchJson("/api/v1/slp/collections/{$collection->id}", ['title' => 'No'])->assertForbidden();
        $this->deleteJson("/api/v1/slp/collections/{$collection->id}")->assertForbidden();
    }

    public function test_cover_is_private_and_replacement_removal_and_deletion_clean_up_storage(): void
    {
        Storage::fake('local');
        $owner = $this->user(UserRole::Clinician);
        $response = $this->actingAs($owner)->postJson('/api/v1/slp/collections', ['title' => 'Pictures', 'cover' => UploadedFile::fake()->image('cover.png')])->assertCreated();
        $id = $response->json('data.id');
        $collection = SlpExerciseCollection::findOrFail($id);
        $old = $collection->cover_path;
        Storage::disk('local')->assertExists($old);
        $this->getJson("/api/v1/slp/collections/{$id}/cover")->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->actingAs($this->user(UserRole::Admin))->getJson("/api/v1/slp/collections/{$id}/cover")->assertOk();
        $this->actingAs($owner)->postJson("/api/v1/slp/collections/{$id}", ['_method' => 'PATCH', 'cover' => UploadedFile::fake()->image('new.png')])->assertOk();
        Storage::disk('local')->assertMissing($old);
        $replacement = $collection->fresh()->cover_path;
        Storage::disk('local')->assertExists($replacement);
        $this->patchJson("/api/v1/slp/collections/{$id}", ['remove_cover' => true])->assertOk()->assertJsonPath('data.cover_url', null);
        Storage::disk('local')->assertMissing($replacement);
        $this->postJson("/api/v1/slp/collections/{$id}", ['_method' => 'PATCH', 'cover' => UploadedFile::fake()->image('last.png')])->assertOk();
        $last = $collection->fresh()->cover_path;
        $this->deleteJson("/api/v1/slp/collections/{$id}")->assertNoContent();
        Storage::disk('local')->assertMissing($last);
    }

    public function test_invalid_cover_and_required_fields_are_rejected_without_storing_files(): void
    {
        Storage::fake('local');
        $this->actingAs($this->user(UserRole::Clinician));
        $this->postJson('/api/v1/slp/collections', [])->assertUnprocessable()->assertJsonValidationErrors('title');
        foreach ([UploadedFile::fake()->create('cover.svg', 1, 'image/svg+xml'), UploadedFile::fake()->image('large.png')->size(5121), UploadedFile::fake()->createWithContent('fake.png', 'not an image')] as $file) {
            $this->postJson('/api/v1/slp/collections', ['title' => 'Invalid', 'cover' => $file])->assertUnprocessable()->assertJsonValidationErrors('cover');
        }
        $this->assertSame([], Storage::disk('local')->allFiles());
        $this->assertDatabaseCount('slp_exercise_collections', 0);
    }

    public function test_exercise_membership_is_owned_and_hiding_preserves_revision(): void
    {
        $owner = $this->user(UserRole::Clinician);
        $collection = SlpExerciseCollection::factory()->create(['owner_id' => $owner->id]);
        $foreign = SlpExerciseCollection::factory()->create();
        $input = ['collection_id' => $collection->id, 'module' => 'articulation', 'language' => 'tl', 'dialect' => 'Tagalog', 'task_type' => 'word', 'prompt_text' => 'araw', 'configuration' => ['patient_visible' => false]];
        $this->actingAs($owner)->postJson('/api/v1/slp/exercises', [...$input, 'collection_id' => $foreign->id])->assertUnprocessable()->assertJsonValidationErrors('collection_id');
        $id = $this->postJson('/api/v1/slp/exercises', $input)->assertCreated()->assertJsonPath('data.collection_id', $collection->id)->json('data.id');
        $this->patchJson("/api/v1/slp/exercises/{$id}", ['is_hidden' => true])->assertOk()->assertJsonPath('data.is_hidden', true)->assertJsonPath('data.latest_version.revision', 1);
        $this->patchJson("/api/v1/slp/exercises/{$id}", ['module' => 'voice', 'prompt_text' => 'buwan'])->assertOk()->assertJsonPath('data.module', 'voice')->assertJsonPath('data.latest_version.revision', 2)->assertJsonPath('data.latest_version.dialect', 'Tagalog');
        $this->getJson('/api/v1/slp/exercises?collection_id='.$collection->id)->assertOk()->assertJsonCount(1, 'data');
        $this->deleteJson('/api/v1/slp/collections/'.$collection->id)->assertNoContent();
        $this->getJson('/api/v1/slp/exercises')->assertOk()->assertJsonCount(0, 'data');
        $this->postJson('/api/v1/slp/exercises', $input)->assertUnprocessable();
        $this->assertDatabaseCount('slp_exercise_versions', 2);
    }

    public function test_hidden_collection_or_exercise_blocks_new_assignments_but_preserves_existing_ones(): void
    {
        $owner = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        ClinicianPatient::factory()->create(['clinician_id' => $owner->id, 'patient_id' => $patient->id]);
        $collection = SlpExerciseCollection::factory()->create(['owner_id' => $owner->id]);
        $exercise = SlpExercise::factory()->for($owner, 'owner')->withDraft(['status' => 'published', 'configuration' => ['patient_visible' => true]])->create(['collection_id' => $collection->id]);
        $input = ['patient_id' => $patient->id, 'exercise_version_id' => $exercise->versions->first()->id];
        $assignment = $this->actingAs($owner)->postJson('/api/v1/slp/assignments', $input)->assertCreated()->json('data.0.id');
        $this->patchJson('/api/v1/slp/collections/'.$collection->id, ['is_hidden' => true])->assertOk();
        $this->postJson('/api/v1/slp/assignments', $input)->assertUnprocessable();
        $this->patchJson('/api/v1/slp/collections/'.$collection->id, ['is_hidden' => false])->assertOk();
        $this->patchJson('/api/v1/slp/exercises/'.$exercise->id, ['is_hidden' => true])->assertOk();
        $this->postJson('/api/v1/slp/assignments', $input)->assertUnprocessable();
        $this->actingAs($patient)->getJson('/api/v1/slp/assignments')->assertOk()->assertJsonPath('data.0.id', $assignment);
        $consent = $this->postJson('/api/v1/slp/consents', ['subject_id' => $patient->id, 'purpose' => 'slp_recording', 'policy_version' => 'v1'])->json('data.id');
        $this->postJson("/api/v1/slp/assignments/{$assignment}/attempts", ['submission_key' => 'hidden', 'consent_id' => $consent])->assertCreated();
        $this->actingAs($owner)->deleteJson('/api/v1/slp/collections/'.$collection->id)->assertNoContent();
        $this->actingAs($patient)->getJson('/api/v1/slp/assignments')->assertOk()->assertJsonPath('data.0.id', $assignment);
    }

    private function user(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
