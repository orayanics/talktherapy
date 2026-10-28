<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\ClinicianPatient;
use App\Models\Soap;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicalRecordUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_author_can_clear_optional_fields_and_version_increments(): void
    {
        [$clinician, $soap] = $this->note();

        $this->actingAs($clinician)->patchJson("/api/v1/soaps/{$soap->id}", [
            'version' => 1,
            'session_type' => null,
        ])->assertOk()->assertJsonPath('data.version', 2)->assertJsonPath('data.session_type', null);

        $this->assertDatabaseHas('soaps', ['id' => $soap->id, 'session_type' => null, 'version' => 2]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'soap.updated', 'entity_id' => $soap->id]);
        $this->assertDatabaseHas('outbox_messages', ['kind' => 'soap.updated', 'aggregate_id' => $soap->id]);
    }

    public function test_stale_author_update_conflicts_and_other_users_cannot_edit(): void
    {
        [$clinician, $soap] = $this->note();
        $this->actingAs($clinician)->patchJson("/api/v1/soaps/{$soap->id}", ['version' => 1, 'comments' => 'new value'])
            ->assertOk();
        $this->patchJson("/api/v1/soaps/{$soap->id}", ['version' => 1, 'comments' => 'stale value'])->assertConflict();
        $relatedClinician = $this->user(UserRole::Clinician);
        ClinicianPatient::factory()->create(['clinician_id' => $relatedClinician->id, 'patient_id' => $soap->patient_id]);
        $this->actingAs($relatedClinician)->patchJson("/api/v1/soaps/{$soap->id}", ['version' => 2])->assertNotFound();
        $this->actingAs($this->user(UserRole::Patient))->patchJson("/api/v1/soaps/{$soap->id}", ['version' => 2])->assertNotFound();
        $this->actingAs($this->user(UserRole::Admin))->patchJson("/api/v1/soaps/{$soap->id}", ['version' => 2])->assertNotFound();

        $this->assertSame('new value', $soap->fresh()->comments);
        $this->assertSame(1, AuditLog::query()->where('action', 'soap.updated')->count());
    }

    public function test_activity_plan_cannot_be_cleared_and_version_is_required(): void
    {
        [$clinician, $soap] = $this->note();
        $this->actingAs($clinician)->patchJson("/api/v1/soaps/{$soap->id}", ['version' => 1, 'activity_plan' => null])
            ->assertUnprocessable()->assertJsonValidationErrors('activity_plan');
        $this->patchJson("/api/v1/soaps/{$soap->id}", ['comments' => 'missing version'])
            ->assertUnprocessable()->assertJsonValidationErrors('version');
        $this->assertSame(1, $soap->fresh()->version);
    }

    private function note(): array
    {
        $patient = $this->user(UserRole::Patient);
        $clinician = $this->user(UserRole::Clinician);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);
        $soap = Soap::factory()->create([
            'patient_id' => $patient->id,
            'clinician_id' => $clinician->id,
            'session_type' => 'Initial',
        ]);

        return [$clinician, $soap];
    }

    private function user(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
