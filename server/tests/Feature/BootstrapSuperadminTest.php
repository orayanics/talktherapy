<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class BootstrapSuperadminTest extends TestCase
{
    use RefreshDatabase;

    public function test_bootstrap_creates_one_pending_superadmin_invitation_and_audit_record(): void
    {
        $this->artisan('app:bootstrap-superadmin', [
            'name' => 'First Administrator',
            'email' => 'first-admin@example.com',
        ])->assertSuccessful();

        $user = User::query()->where('email', 'first-admin@example.com')->sole();

        $this->assertSame(UserRole::Superadmin, $user->profile->role);
        $this->assertSame(UserStatus::Pending, $user->profile->status);
        $this->assertNull($user->email_verified_at);
        $this->assertDatabaseHas('activation_challenges', ['user_id' => $user->id, 'purpose' => 'activation']);
        $this->assertDatabaseHas('outbox_messages', ['recipient_id' => $user->id, 'kind' => 'identity.activation']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.bootstrap_invited', 'entity_id' => $user->id]);

        $code = OutboxMessage::query()->where('recipient_id', $user->id)->sole()->payload['code'];
        $this->postJson('/api/v1/activation/otp/verify', ['email' => $user->email, 'otp_code' => $code])
            ->assertOk()->assertJsonPath('data.role', 'superadmin');
        $this->postJson('/api/v1/activation', [
            'email' => $user->email,
            'otp_code' => $code,
            'name' => 'First Administrator',
            'password' => 'Secure-First-9!',
            'password_confirmation' => 'Secure-First-9!',
        ])->assertOk();

        $this->assertSame(UserStatus::Active, $user->fresh()->profile->status);
        $this->assertTrue(Hash::check('Secure-First-9!', $user->fresh()->password));
    }

    public function test_bootstrap_refuses_to_add_another_privileged_account(): void
    {
        $existingAdmin = User::factory()->create();
        UserProfile::factory()->for($existingAdmin)->create(['role' => UserRole::Admin]);

        $this->artisan('app:bootstrap-superadmin', [
            'name' => 'Second Administrator',
            'email' => 'second-admin@example.com',
        ])->assertFailed();

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('activation_challenges', 0);
        $this->assertDatabaseCount('audit_logs', 0);
    }
}
