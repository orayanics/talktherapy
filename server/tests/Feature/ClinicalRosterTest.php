<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\ClinicianPatient;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicalRosterTest extends TestCase
{
    use RefreshDatabase;

    public function test_clinician_sees_only_completed_care_pairs_with_search_and_pagination(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $otherClinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient, ['name' => 'Searchable Patient']);
        $otherPatient = $this->user(UserRole::Patient);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);
        ClinicianPatient::factory()->create(['clinician_id' => $otherClinician->id, 'patient_id' => $otherPatient->id]);

        $this->actingAs($clinician)->getJson('/api/v1/patients?search=%20Searchable%20&per_page=1')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.patient.id', $patient->id)
            ->assertJsonPath('meta.total', 1)->assertJsonPath('meta.per_page', 1)
            ->assertJsonMissingPath('data.0.patient.password');
        $this->actingAs($this->user(UserRole::Patient))->getJson('/api/v1/patients')->assertForbidden();
        $this->actingAs($this->user(UserRole::Admin))->getJson('/api/v1/patients')->assertForbidden();
    }

    private function user(UserRole $role, array $attributes = []): User
    {
        $user = User::factory()->create(['email_verified_at' => now(), ...$attributes]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
