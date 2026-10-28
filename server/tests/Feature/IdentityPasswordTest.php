<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class IdentityPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_change_requires_current_password(): void
    {
        $user = User::factory()->create(['password' => 'Current-Horse-9!']);
        UserProfile::factory()->for($user)->create();

        $this->actingAs($user)->postJson('/api/v1/me/password', [
            'current_password' => 'wrong', 'password' => 'Replacement-Horse-8!',
            'password_confirmation' => 'Replacement-Horse-8!',
        ])->assertUnprocessable();

        $this->actingAs($user)->postJson('/api/v1/me/password', [
            'current_password' => 'Current-Horse-9!', 'password' => 'Replacement-Horse-8!',
            'password_confirmation' => 'Replacement-Horse-8!',
        ])->assertNoContent();
        $this->assertTrue(Hash::check('Replacement-Horse-8!', $user->fresh()->password));
    }

    public function test_password_reset_uses_single_use_broker_token(): void
    {
        $user = User::factory()->create(['email' => 'reset@example.com']);
        $token = Password::createToken($user);

        $payload = ['email' => $user->email, 'token' => $token, 'password' => 'Replacement-Horse-8!', 'password_confirmation' => 'Replacement-Horse-8!'];
        $this->postJson('/api/v1/reset-password', $payload)->assertNoContent();
        $this->postJson('/api/v1/reset-password', $payload)->assertUnprocessable();
    }
}
