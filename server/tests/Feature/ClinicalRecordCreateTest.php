<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\ClinicianPatient;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicalRecordCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_related_clinician_creates_note_and_commits_only_metadata_audit_and_notification_intent(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);

        $response = $this->actingAs($clinician)->postJson("/api/v1/soaps/{$patient->id}", [
            'activity_plan' => 'Follow therapy exercise plan',
            'session_type' => null,
            'subjective_notes' => '  private clinical detail  ',
        ])->assertCreated()->assertJsonPath('data.version', 1)->assertJsonPath('data.patientId', $patient->id);

        $this->assertDatabaseCount('soaps', 1);
        $this->assertDatabaseHas('audit_logs', ['action' => 'soap.created', 'actor_id' => $clinician->id]);
        $this->assertDatabaseHas('outbox_messages', ['kind' => 'soap.created', 'recipient_id' => $patient->id]);
        $this->assertSame('  private clinical detail  ', $response->json('data.subjective_notes'));
        $this->assertStringNotContainsString('private clinical detail', AuditLog::query()->firstOrFail()->toJson());
        $this->assertSame(['soap_id' => $response->json('data.id')], OutboxMessage::query()->firstOrFail()->payload);
    }

    public function test_only_clinician_with_completed_care_pair_can_create_and_activity_plan_is_required(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        $unrelated = $this->user(UserRole::Clinician);

        $this->actingAs($clinician)->postJson("/api/v1/soaps/{$patient->id}", [])->assertUnprocessable()
            ->assertJsonValidationErrors('activity_plan');
        $this->actingAs($unrelated)->postJson("/api/v1/soaps/{$patient->id}", ['activity_plan' => 'Plan'])->assertForbidden();
        $this->actingAs($this->user(UserRole::Admin))->postJson("/api/v1/soaps/{$patient->id}", ['activity_plan' => 'Plan'])->assertForbidden();
        $this->assertDatabaseCount('soaps', 0);
        $this->assertDatabaseCount('audit_logs', 0);
        $this->assertDatabaseCount('outbox_messages', 0);
    }

    public function test_create_rolls_back_soap_and_audit_if_outbox_intent_fails(): void
    {
        $clinician = $this->user(UserRole::Clinician);
        $patient = $this->user(UserRole::Patient);
        ClinicianPatient::factory()->create(['clinician_id' => $clinician->id, 'patient_id' => $patient->id]);
        OutboxMessage::creating(static function (): void {
            throw new \RuntimeException('Outbox unavailable.');
        });

        try {
            $this->actingAs($clinician)->postJson("/api/v1/soaps/{$patient->id}", ['activity_plan' => 'Plan'])
                ->assertInternalServerError();
        } finally {
            OutboxMessage::flushEventListeners();
        }

        $this->assertDatabaseCount('soaps', 0);
        $this->assertDatabaseCount('audit_logs', 0);
        $this->assertDatabaseCount('outbox_messages', 0);
    }

    private function user(UserRole $role): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => UserStatus::Active]);

        return $user->load('profile');
    }
}
