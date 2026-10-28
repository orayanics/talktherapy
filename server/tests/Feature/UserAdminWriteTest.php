<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UserAdminWriteTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_provision_admin_and_clinician_invitations(): void
    {
        $actor = $this->createUser(UserRole::Superadmin);
        $this->actingAs($actor)->postJson('/api/v1/users', ['name' => 'New Admin', 'email' => 'new-admin@example.com', 'role' => 'admin'])
            ->assertCreated()->assertJsonPath('data.status', 'pending')->assertJsonPath('data.role', 'admin');
        $this->actingAs($actor)->postJson('/api/v1/users', ['name' => 'New Clinician', 'email' => 'new-clinician@example.com', 'role' => 'clinician'])
            ->assertCreated()->assertJsonPath('data.status', 'pending')->assertJsonPath('data.role', 'clinician');

        $this->assertDatabaseHas('activation_challenges', ['email' => 'new-admin@example.com', 'purpose' => 'activation']);
        $this->assertDatabaseHas('outbox_messages', ['kind' => 'identity.activation']);
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $actor->id, 'action' => 'user.invited']);
        $this->assertDatabaseCount('users', 3);
    }

    public function test_admin_can_only_provision_clinicians(): void
    {
        $admin = $this->createUser(UserRole::Admin);
        $this->actingAs($admin)->postJson('/api/v1/users', ['name' => 'Clinician', 'email' => 'clinician@example.com', 'role' => 'clinician'])
            ->assertCreated();
        $this->actingAs($admin)->postJson('/api/v1/users', ['name' => 'Admin', 'email' => 'admin@example.com', 'role' => 'admin'])
            ->assertForbidden();
        $this->actingAs($admin)->postJson('/api/v1/users', ['name' => 'Patient', 'email' => 'patient@example.com', 'role' => 'patient'])
            ->assertForbidden();

        $this->assertDatabaseCount('users', 2);
    }

    public function test_invitation_does_not_replace_an_existing_account_or_allow_role_escalation(): void
    {
        $actor = $this->createUser(UserRole::Superadmin);
        $existing = $this->createUser(UserRole::Patient, UserStatus::Suspended, 'taken@example.com');

        $this->actingAs($actor)->postJson('/api/v1/users', ['name' => 'Replacement', 'email' => $existing->email, 'role' => 'clinician'])
            ->assertUnprocessable();
        $this->actingAs($actor)->postJson('/api/v1/users', ['name' => 'Escalation', 'email' => 'elevate@example.com', 'role' => 'superadmin'])
            ->assertForbidden();

        $this->assertDatabaseCount('users', 2);
        $this->assertSame(UserRole::Patient, $existing->fresh()->profile->role);
        $this->assertSame(UserStatus::Suspended, $existing->fresh()->profile->status);
    }

    public function test_admin_cannot_suspend_self_and_last_active_superadmin(): void
    {
        $actor = $this->createUser(UserRole::Superadmin);
        $this->actingAs($actor)->patchJson("/api/v1/users/{$actor->id}/status", ['status' => 'suspended'])->assertForbidden();

        $this->assertSame(UserStatus::Active, $actor->fresh()->profile->status);
    }

    public function test_superadmin_can_suspend_and_reactivate_admin_and_sessions_are_revoked(): void
    {
        $actor = $this->createUser(UserRole::Superadmin, email: 'superadmin@example.com');
        $target = $this->createUser(UserRole::Admin, email: 'admin@example.com');
        DB::table('sessions')->insert(['id' => 'target-session', 'user_id' => $target->id, 'payload' => '', 'last_activity' => time()]);

        $this->actingAs($actor)->patchJson("/api/v1/users/{$target->id}/status", ['status' => 'suspended'])->assertOk()
            ->assertJsonPath('data.status', 'suspended');

        $this->assertDatabaseMissing('sessions', ['user_id' => $target->id]);
        $this->actingAs($actor)->patchJson("/api/v1/users/{$target->id}/status", ['status' => 'active'])->assertOk()
            ->assertJsonPath('data.status', 'active');
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.suspended', 'entity_id' => $target->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.reactivated', 'entity_id' => $target->id]);
    }

    private function createUser(UserRole $role, UserStatus $status = UserStatus::Active, string $email = 'actor@example.com'): User
    {
        $user = User::factory()->create(['email' => $email]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => $status]);

        return $user->load('profile');
    }
}
