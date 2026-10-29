<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationPreferencesTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_read_and_update_notification_preferences(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->profile()->create(['role' => UserRole::Patient, 'status' => 'active']);

        $this->actingAs($user)->getJson('/api/v1/me/notification-preferences')->assertOk()->assertJsonPath('data.in_app', true)->assertJsonPath('data.email', true);
        $this->actingAs($user)->putJson('/api/v1/me/notification-preferences', ['in_app' => false, 'email' => true])->assertOk()->assertJsonPath('data.in_app', false);
        $this->assertSame(['in_app' => false, 'email' => true], $user->profile->fresh()->notification_preferences);
    }
}
