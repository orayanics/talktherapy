<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Diagnosis;
use App\Models\User;
use Database\Seeders\DiagnosisSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiagnosisTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_is_ordered_and_exposes_only_contract_fields(): void
    {
        Diagnosis::factory()->create(['id' => 'diagnosis-z', 'label' => 'Zulu', 'value' => 'Z', 'created_at' => now()->subDay()]);
        Diagnosis::factory()->create(['id' => 'diagnosis-a', 'label' => 'Alpha', 'value' => 'A', 'created_at' => now()]);

        $this->getJson('/api/v1/diagnoses')->assertOk()->assertExactJson([
            'data' => [
                ['id' => 'diagnosis-a', 'label' => 'Alpha', 'value' => 'A'],
                ['id' => 'diagnosis-z', 'label' => 'Zulu', 'value' => 'Z'],
            ],
        ]);
    }

    public function test_reference_seeding_is_idempotent_and_stable(): void
    {
        $this->seed(DiagnosisSeeder::class);
        $first = Diagnosis::query()->orderBy('id')->pluck('id', 'value');

        $this->seed(DiagnosisSeeder::class);

        $this->assertCount(11, $first);
        $this->assertSame($first->all(), Diagnosis::query()->orderBy('id')->pluck('id', 'value')->all());
        $this->assertSame('diagnosis-asd', $first['ASD']);
    }

    public function test_admin_can_manage_and_archive_diagnoses(): void
    {
        $admin = $this->user(UserRole::Admin);
        $this->actingAs($admin)->postJson('/api/v1/admin/diagnoses', ['id' => 'diagnosis-new', 'label' => 'New', 'value' => 'NEW'])->assertCreated();
        $this->actingAs($admin)->patchJson('/api/v1/admin/diagnoses/diagnosis-new', ['label' => 'Updated', 'value' => 'UPD'])->assertOk();
        $this->actingAs($admin)->deleteJson('/api/v1/admin/diagnoses/diagnosis-new')->assertNoContent();
        $this->assertDatabaseHas('diagnoses', ['id' => 'diagnosis-new', 'active' => false]);
        $this->getJson('/api/v1/diagnoses')->assertJsonMissing(['id' => 'diagnosis-new']);
        $this->actingAs($admin)->patchJson('/api/v1/admin/diagnoses/diagnosis-new', ['label' => 'Updated', 'value' => 'UPD', 'active' => true])->assertOk();
        $this->assertDatabaseHas('diagnoses', ['id' => 'diagnosis-new', 'active' => true]);
        $this->getJson('/api/v1/diagnoses')->assertJsonFragment(['id' => 'diagnosis-new']);
    }

    public function test_admin_catalog_includes_seeded_diagnoses(): void
    {
        $this->seed(DiagnosisSeeder::class);
        $admin = $this->user(UserRole::Admin);

        $this->actingAs($admin)->getJson('/api/v1/admin/diagnoses')
            ->assertOk()
            ->assertJsonFragment(['id' => 'diagnosis-asd', 'value' => 'ASD']);
    }

    public function test_non_admin_cannot_manage_diagnoses(): void
    {
        $patient = $this->user(UserRole::Patient);
        $this->actingAs($patient)->postJson('/api/v1/admin/diagnoses', ['id' => 'x', 'label' => 'X', 'value' => 'X'])->assertForbidden();
    }

    private function user(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->profile()->create(['role' => $role, 'status' => 'active']);

        return $user->load('profile');
    }
}
