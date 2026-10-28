<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class IdentitySessionTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_active_user_can_login_read_safe_session_and_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'member@example.com',
            'password' => 'Correct-Horse-9!',
        ]);
        UserProfile::factory()->for($user)->create(['role' => 'patient', 'status' => 'active']);

        $this->postJson('/login', [
            'email' => ' MEMBER@example.com ',
            'password' => 'Correct-Horse-9!',
        ])->assertOk()->assertJsonPath('data.id', $user->id)
            ->assertJsonMissingPath('data.password');

        $this->assertAuthenticatedAs($user);
        $this->getJson('/api/v1/me')->assertOk()->assertJsonPath('data.email', 'member@example.com')
            ->assertJsonPath('data.email_verified_at', fn (mixed $value): bool => is_string($value));

        $this->postJson('/logout')->assertNoContent();
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }

    #[DataProvider('roles')]
    public function test_every_unverified_role_is_denied_login_and_protected_routes(string $role): void
    {
        $user = User::factory()->unverified()->create([
            'email' => $role.'@example.com',
            'password' => 'Correct-Horse-9!',
        ]);
        UserProfile::factory()->for($user)->create(['role' => $role, 'status' => 'active']);

        $this->postJson('/login', [
            'email' => $user->email,
            'password' => 'Correct-Horse-9!',
        ])->assertUnprocessable()->assertJsonPath('code', 'validation_failed');
        $this->assertGuest();

        $this->actingAs($user)->getJson('/api/v1/me')->assertForbidden();
    }

    public function test_pending_and_suspended_accounts_cannot_login(): void
    {
        foreach (['pending', 'suspended'] as $status) {
            $user = User::factory()->create([
                'email' => $status.'@example.com',
                'password' => 'Correct-Horse-9!',
            ]);
            UserProfile::factory()->for($user)->create(['status' => $status]);

            $this->postJson('/login', [
                'email' => $user->email,
                'password' => 'Correct-Horse-9!',
            ])->assertUnprocessable();
            $this->assertGuest();
        }
    }

    /** @return array<string, array{string}> */
    public static function roles(): array
    {
        return [
            'patient' => ['patient'],
            'clinician' => ['clinician'],
            'admin' => ['admin'],
            'superadmin' => ['superadmin'],
        ];
    }
}
