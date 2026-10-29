<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\ClinicianPatient;
use App\Models\Soap;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicalRecordReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_and_author_can_read_notes_but_unrelated_clinicians_and_admins_cannot(): void
    {
        $patient = $this->user(UserRole::Patient);
        $author = $this->user(UserRole::Clinician);
        $relatedNonAuthor = $this->user(UserRole::Clinician);
        $unrelated = $this->user(UserRole::Clinician);
        $admin = $this->user(UserRole::Admin);
        $suspendedClinician = $this->user(UserRole::Clinician, UserStatus::Suspended);
        ClinicianPatient::factory()->create(['clinician_id' => $author->id, 'patient_id' => $patient->id]);
        ClinicianPatient::factory()->create(['clinician_id' => $relatedNonAuthor->id, 'patient_id' => $patient->id]);
        $soap = Soap::factory()->create(['patient_id' => $patient->id, 'clinician_id' => $author->id]);

        $this->actingAs($patient)->getJson("/api/v1/soaps/{$soap->id}")
            ->assertOk()->assertJsonPath('data.activity_plan', $soap->activity_plan)->assertJsonMissingPath('data.password');
        $this->actingAs($author)->getJson("/api/v1/soaps/{$soap->id}")->assertOk();
        foreach ([$relatedNonAuthor, $unrelated, $admin] as $actor) {
            $this->actingAs($actor)->getJson("/api/v1/soaps/{$soap->id}")->assertNotFound();
        }
        $this->actingAs($suspendedClinician)->getJson("/api/v1/soaps/{$soap->id}")->assertForbidden();
        $this->actingAs($admin)->getJson('/api/v1/soaps/patient/'.$patient->id)->assertForbidden();
    }

    public function test_unauthenticated_users_cannot_read_soap_notes(): void
    {
        $this->getJson('/api/v1/soaps/missing')->assertUnauthorized();
    }

    public function test_clinician_lists_only_notes_they_authored_for_a_related_patient(): void
    {
        $patient = $this->user(UserRole::Patient);
        $author = $this->user(UserRole::Clinician);
        $other = $this->user(UserRole::Clinician);
        ClinicianPatient::factory()->create(['clinician_id' => $author->id, 'patient_id' => $patient->id]);
        ClinicianPatient::factory()->create(['clinician_id' => $other->id, 'patient_id' => $patient->id]);
        Soap::factory()->create(['patient_id' => $patient->id, 'clinician_id' => $author->id]);
        Soap::factory()->create(['patient_id' => $patient->id, 'clinician_id' => $other->id]);

        $this->actingAs($author)->getJson("/api/v1/soaps/patient/{$patient->id}")
            ->assertOk()->assertJsonCount(1, 'data');
        $this->actingAs($this->user(UserRole::Patient))->getJson("/api/v1/soaps/patient/{$patient->id}")->assertNotFound();
        $this->actingAs($patient)->getJson("/api/v1/soaps/patient/{$patient->id}")
            ->assertOk()->assertJsonCount(2, 'data');
    }

    private function user(UserRole $role, UserStatus $status = UserStatus::Active): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => $status]);

        return $user->load('profile');
    }
}
