<?php

namespace Tests\Feature;

use App\Jobs\BuildAuditExport;
use App\Models\AuditLog;
use App\Models\Diagnosis;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ReportingTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_and_superadmin_can_read_stats_and_logs(): void
    {
        foreach (['admin', 'superadmin'] as $role) {
            $actor = $this->createUser($role);
            AuditLog::factory()->create(['actor_id' => $actor->id, 'actor_role' => $role]);
            $this->actingAs($actor)->getJson('/api/v1/reports/stats')->assertOk()->assertJsonPath('data.users.by_role.'.$role, 1);
            $this->actingAs($actor)->getJson('/api/v1/logs')->assertOk()->assertJsonPath('data.0.actor_role', $role);
        }
    }

    public function test_other_roles_are_denied_reporting(): void
    {
        foreach (['patient', 'clinician'] as $role) {
            $this->actingAs($this->createUser($role))->getJson('/api/v1/reports/stats')->assertForbidden();
            $this->actingAs($this->createUser($role))->getJson('/api/v1/logs')->assertForbidden();
        }
    }

    public function test_stats_count_patients_by_diagnosis(): void
    {
        $admin = $this->createUser('admin');
        $aphasia = Diagnosis::factory()->create(['value' => 'APH', 'label' => 'Aphasia']);
        $stuttering = Diagnosis::factory()->create(['value' => 'STUT', 'label' => 'Stuttering']);
        $noPatients = Diagnosis::factory()->create(['value' => 'NONE', 'label' => 'No Patients']);

        foreach ([$aphasia, $aphasia, $stuttering] as $diagnosis) {
            $patient = User::factory()->create();
            UserProfile::factory()->for($patient)->create([
                'role' => 'patient',
                'status' => 'active',
                'diagnosis_id' => $diagnosis->id,
            ]);
        }
        $clinician = User::factory()->create();
        UserProfile::factory()->for($clinician)->create([
            'role' => 'clinician',
            'status' => 'active',
            'diagnosis_id' => $aphasia->id,
        ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/reports/stats')
            ->assertOk()
            ->assertJsonFragment(['value' => 'APH', 'label' => 'Aphasia', 'count' => 2])
            ->assertJsonFragment(['value' => 'STUT', 'label' => 'Stuttering', 'count' => 1])
            ->assertJsonFragment(['value' => $noPatients->value, 'label' => $noPatients->label, 'count' => 0]);
    }

    public function test_stream_export_records_completion_and_neutralizes_formula_cells(): void
    {
        $admin = $this->createUser('admin');
        AuditLog::factory()->create(['actor_id' => $admin->id, 'action' => '=danger']);
        $response = $this->actingAs($admin)->get('/api/v1/logs/export?format=csv');
        $response->assertOk();
        $content = $response->streamedContent();
        $this->assertDatabaseHas('audit_logs', ['action' => 'audit.export.started', 'actor_id' => $admin->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'audit.export.completed', 'actor_id' => $admin->id]);
        $this->assertStringContainsString("'=danger", $content);
    }

    public function test_large_export_is_queued_and_can_be_polled(): void
    {
        Queue::fake();
        $admin = $this->createUser('admin');
        $response = $this->actingAs($admin)->postJson('/api/v1/logs/exports', ['format' => 'jsonl']);
        $response->assertStatus(202)->assertJsonPath('data.status', 'queued');
        Queue::assertPushed(BuildAuditExport::class);
        $this->actingAs($admin)->getJson('/api/v1/logs/exports/'.$response->json('data.id'))->assertOk()->assertJsonPath('data.status', 'queued');
    }

    private function createUser(string $role): User
    {
        $user = User::factory()->create();
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => 'active']);

        return $user;
    }
}
