<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\SlpExercise;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SlpExerciseCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinician_can_create_and_update_owned_draft_without_mutating_history(): void
    {
        $clinician = $this->user(UserRole::Clinician);

        $response = $this->actingAs($clinician)->postJson('/api/v1/slp/exercises', [
            'module' => 'fluency', 'language' => 'en', 'task_type' => 'passage_reading',
            'prompt_text' => 'Read at a comfortable pace.', 'configuration' => ['min_syllables' => 300],
        ])->assertCreated()->assertJsonPath('data.scope', 'private')->assertJsonPath('data.latest_version.revision', 1);

        $id = $response->json('data.id');
        $this->actingAs($clinician)->patchJson("/api/v1/slp/exercises/{$id}", ['prompt_text' => 'Read again.'])
            ->assertOk()->assertJsonPath('data.latest_version.revision', 2)->assertJsonPath('data.latest_version.prompt_text', 'Read again.');

        $this->assertDatabaseHas('slp_exercise_versions', ['exercise_id' => $id, 'revision' => 1, 'prompt_text' => 'Read at a comfortable pace.']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'slp.exercise.created']);
    }

    public function test_clinician_cannot_read_or_edit_another_clinicians_private_exercise(): void
    {
        $owner = $this->user(UserRole::Clinician);
        $other = $this->user(UserRole::Clinician);
        $exercise = SlpExercise::factory()->for($owner, 'owner')->withDraft()->create();

        $this->actingAs($other)->getJson("/api/v1/slp/exercises/{$exercise->id}")->assertForbidden();
        $this->actingAs($other)->patchJson("/api/v1/slp/exercises/{$exercise->id}", ['prompt_text' => 'Nope'])->assertForbidden();
        $this->actingAs($other)->deleteJson("/api/v1/slp/exercises/{$exercise->id}")->assertForbidden();
    }

    public function test_admin_can_manage_shared_catalog_and_delete_archives(): void
    {
        $admin = $this->user(UserRole::Admin);
        $exercise = SlpExercise::factory()->for($this->user(UserRole::Clinician), 'owner')->withDraft(['status' => 'draft'])->create(['scope' => 'shared']);

        $this->actingAs($admin)->getJson('/api/v1/slp/exercises')->assertOk()->assertJsonPath('data.0.id', $exercise->id);
        $this->actingAs($admin)->deleteJson("/api/v1/slp/exercises/{$exercise->id}")->assertNoContent();
        $this->assertDatabaseHas('slp_exercises', ['id' => $exercise->id]);
        $this->assertNotNull($exercise->fresh()->archived_at);
    }

    public function test_catalog_filters_match_latest_revision_and_preserve_owner_isolation(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $match = SlpExercise::factory()->for($clinician, 'owner')->withDraft(['language' => 'tl'])->create(['module' => 'voice']);
        $oldLanguage = SlpExercise::factory()->for($clinician, 'owner')->withDraft(['language' => 'tl'])->create(['module' => 'voice']);
        $oldLanguage->versions()->create(['revision' => 2, 'language' => 'en', 'task_type' => 'reading', 'status' => 'draft', 'prompt_text' => 'New revision', 'created_by' => $clinician->id]);
        SlpExercise::factory()->for($clinician, 'owner')->withDraft(['language' => 'tl'])->create(['module' => 'fluency']);
        SlpExercise::factory()->for($clinician, 'owner')->withDraft(['language' => 'tl'])->create(['module' => 'voice', 'scope' => 'shared']);
        SlpExercise::factory()->for($this->user(UserRole::Clinician), 'owner')->withDraft(['language' => 'tl'])->create(['module' => 'voice']);
        SlpExercise::factory()->for($clinician, 'owner')->withDraft(['language' => 'tl'])->create(['module' => 'voice', 'archived_at' => now()]);

        $this->actingAs($clinician)->getJson('/api/v1/slp/exercises?module=voice&language=tl&scope=private&per_page=1')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $match->id)->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/slp/exercises?module=voice')->assertOk()->assertJsonPath('meta.total', 3);
        $this->getJson('/api/v1/slp/exercises?language=tl')->assertOk()->assertJsonPath('meta.total', 3);
        $this->getJson('/api/v1/slp/exercises?scope=shared')->assertOk()->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/slp/exercises?language=xx')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_catalog_rejects_invalid_filters_and_pagination(): void
    {
        $this->actingAs($this->user(UserRole::Clinician));
        foreach (['module=unknown' => 'module', 'scope=public' => 'scope', 'language[]=en' => 'language', 'per_page=0' => 'per_page', 'per_page=101' => 'per_page', 'page=0' => 'page'] as $query => $field) {
            $this->getJson('/api/v1/slp/exercises?'.$query)->assertUnprocessable()->assertJsonValidationErrors($field);
        }
    }

    private function user(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
