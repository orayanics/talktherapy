<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Diagnosis;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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

    public function test_superadmin_can_invite_a_patient_to_set_credentials_during_activation(): void
    {
        $actor = $this->createUser(UserRole::Superadmin);
        $diagnosis = Diagnosis::factory()->create();

        $response = $this->actingAs($actor)->postJson('/api/v1/users', [
            'name' => 'Invited Patient',
            'email' => 'invited-patient@example.com',
            'role' => 'patient',
        ])->assertCreated()->assertJsonPath('data.status', 'pending');

        $user = User::query()->where('email', 'invited-patient@example.com')->sole();
        $code = OutboxMessage::query()->where('recipient_id', $user->id)->sole()->payload['code'];

        $this->postJson('/api/v1/activation/otp/verify', [
            'email' => $user->email,
            'otp_code' => $code,
        ])->assertOk()
            ->assertJsonPath('data.role', 'patient')
            ->assertJsonPath('data.requires_credentials', true);

        $this->postJson('/api/v1/activation', [
            'email' => $user->email,
            'otp_code' => $code,
        ])->assertUnprocessable();
        $this->assertSame(UserStatus::Pending, $user->fresh()->profile->status);

        $this->postJson('/api/v1/activation', [
            'email' => $user->email,
            'otp_code' => $code,
            'name' => 'Invited Patient',
            'password' => 'New-Patient-9!',
            'password_confirmation' => 'New-Patient-9!',
            'diagnosis_id' => $diagnosis->id,
        ])->assertOk();

        $this->assertSame(UserStatus::Active, $user->fresh()->profile->status);
        $this->assertSame($diagnosis->id, $user->fresh()->profile->diagnosis_id);
        $this->assertTrue(Hash::check('New-Patient-9!', $user->fresh()->password));
    }

    public function test_resending_patient_invitation_keeps_credentials_requirement(): void
    {
        $actor = $this->createUser(UserRole::Superadmin);
        $this->actingAs($actor)->postJson('/api/v1/users', [
            'name' => 'Invited Patient',
            'email' => 'resent-patient@example.com',
            'role' => 'patient',
        ])->assertCreated();

        $user = User::query()->where('email', 'resent-patient@example.com')->sole();
        $this->travel(2)->minutes();
        $this->postJson('/api/v1/activation/otp/resend', ['email' => $user->email])->assertAccepted();
        $code = OutboxMessage::query()->where('recipient_id', $user->id)->latest()->firstOrFail()->payload['code'];

        $this->postJson('/api/v1/activation/otp/verify', [
            'email' => $user->email,
            'otp_code' => $code,
        ])->assertOk()->assertJsonPath('data.requires_credentials', true);
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

    public function test_superadmin_cannot_suspend_self_and_keeps_one_superadmin_active(): void
    {
        $actor = $this->createUser(UserRole::Superadmin);
        $otherSuperadmin = $this->createUser(UserRole::Superadmin, email: 'other-superadmin@example.com');

        $this->actingAs($actor)->patchJson("/api/v1/users/{$actor->id}/status", ['status' => 'suspended', 'reason' => 'Policy violation'])->assertForbidden();
        $this->actingAs($actor)->patchJson("/api/v1/users/{$otherSuperadmin->id}/status", ['status' => 'suspended', 'reason' => 'Policy violation'])
            ->assertOk();

        $this->assertSame(UserStatus::Active, $actor->fresh()->profile->status);
        $this->assertSame(UserStatus::Suspended, $otherSuperadmin->fresh()->profile->status);
    }

    public function test_superadmin_can_suspend_and_reactivate_admin_and_sessions_are_revoked(): void
    {
        $actor = $this->createUser(UserRole::Superadmin, email: 'superadmin@example.com');
        $target = $this->createUser(UserRole::Admin, email: 'admin@example.com');
        DB::table('sessions')->insert(['id' => 'target-session', 'user_id' => $target->id, 'payload' => '', 'last_activity' => time()]);

        $this->actingAs($actor)->patchJson("/api/v1/users/{$target->id}/status", ['status' => 'suspended', 'reason' => 'Policy violation'])->assertOk()
            ->assertJsonPath('data.status', 'suspended');

        $this->assertDatabaseMissing('sessions', ['user_id' => $target->id]);
        $this->assertSame(1, $target->fresh()->session_version);
        $this->actingAs($actor)->patchJson("/api/v1/users/{$target->id}/status", ['status' => 'active'])->assertOk()
            ->assertJsonPath('data.status', 'active');
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.suspended', 'entity_id' => $target->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.reactivated', 'entity_id' => $target->id]);
    }

    public function test_status_changes_only_allow_active_to_suspended_and_suspended_to_active(): void
    {
        $actor = $this->createUser(UserRole::Superadmin);
        $pendingUser = $this->createUser(UserRole::Patient, UserStatus::Pending, 'pending@example.com');
        $activeUser = $this->createUser(UserRole::Patient, UserStatus::Active, 'active@example.com');

        $this->actingAs($actor)->patchJson("/api/v1/users/{$pendingUser->id}/status", ['status' => 'suspended', 'reason' => 'Policy violation'])
            ->assertConflict();
        $this->actingAs($actor)->patchJson("/api/v1/users/{$activeUser->id}/status", ['status' => 'suspended', 'reason' => 'Policy violation'])
            ->assertOk();
        $this->actingAs($actor)->patchJson("/api/v1/users/{$activeUser->id}/status", ['status' => 'suspended', 'reason' => 'Policy violation'])
            ->assertConflict();
        $this->actingAs($actor)->patchJson("/api/v1/users/{$activeUser->id}/status", ['status' => 'active'])
            ->assertOk();
        $this->actingAs($actor)->patchJson("/api/v1/users/{$activeUser->id}/status", ['status' => 'active'])
            ->assertConflict();

        $this->assertSame(UserStatus::Pending, $pendingUser->fresh()->profile->status);
        $this->assertSame(UserStatus::Active, $activeUser->fresh()->profile->status);
        $this->assertDatabaseCount('audit_logs', 2);
    }

    public function test_unprivileged_status_requests_do_not_reveal_whether_target_exists(): void
    {
        $actor = $this->createUser(UserRole::Patient);
        $target = $this->createUser(UserRole::Clinician, email: 'status-target@example.com');

        $this->actingAs($actor)->patchJson("/api/v1/users/{$target->id}/status", ['status' => 'suspended', 'reason' => 'Policy violation'])
            ->assertForbidden();
        $this->actingAs($actor)->patchJson('/api/v1/users/00000000-0000-4000-8000-000000000000/status', ['status' => 'suspended', 'reason' => 'Policy violation'])
            ->assertForbidden();
    }

    public function test_suspension_revokes_existing_sessions_even_after_reactivation(): void
    {
        $target = $this->createUser(UserRole::Patient, email: 'session-target@example.com');

        $this->postJson('/login', ['email' => $target->email, 'password' => 'password'])->assertOk();
        $this->withHeader('Origin', 'http://localhost:3000')->getJson('/api/v1/me')->assertOk();

        $target->profile->update(['status' => UserStatus::Suspended]);
        $target->increment('session_version');
        $target->profile->update(['status' => UserStatus::Active]);

        $this->withHeader('Origin', 'http://localhost:3000')->getJson('/api/v1/me')->assertForbidden();
        $this->postJson('/logout')->assertNoContent();
        $this->postJson('/login', ['email' => $target->email, 'password' => 'password'])->assertOk();
        $this->withHeader('Origin', 'http://localhost:3000')->getJson('/api/v1/me')->assertOk();
        $this->assertSame(1, $target->fresh()->session_version);
    }

    private function createUser(UserRole $role, UserStatus $status = UserStatus::Active, string $email = 'actor@example.com'): User
    {
        $user = User::factory()->create(['email' => $email]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => $status]);

        return $user->load('profile');
    }
}
