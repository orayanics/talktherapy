<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Tests\TestCase;

class NotificationInboxTest extends TestCase
{
    use RefreshDatabase;

    public function test_inbox_is_owner_scoped_and_read_is_idempotent(): void
    {
        $owner = $this->user(UserRole::Patient);
        $other = $this->user(UserRole::Patient);
        $notification = $this->notification($owner);
        $this->notification($other);

        $this->actingAs($owner)->getJson('/api/v1/notifications?unread=true')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $notification->id);
        $this->actingAs($other)->patchJson("/api/v1/notifications/{$notification->id}/read")->assertNotFound();
        $this->actingAs($owner)->patchJson("/api/v1/notifications/{$notification->id}/read")->assertNoContent();
        $readAt = $notification->fresh()->read_at;
        $this->travel(5)->seconds();
        $this->actingAs($owner)->patchJson("/api/v1/notifications/{$notification->id}/read")->assertNoContent();
        $this->assertSame($readAt->toISOString(), $notification->fresh()->read_at->toISOString());
        $this->actingAs($owner)->getJson('/api/v1/notifications?unread=true')->assertJsonCount(0, 'data');
        $this->actingAs($owner)->getJson('/api/v1/notifications?unread=false')->assertJsonCount(1, 'data');
    }

    public function test_only_administrators_can_send_and_audit_does_not_contain_message(): void
    {
        $admin = $this->user(UserRole::Admin);
        $patient = $this->user(UserRole::Patient);
        $payload = ['recipient_id' => $patient->id, 'type' => 'system', 'title' => 'Reminder', 'message' => 'Please review your account.'];

        $this->actingAs($patient)->postJson('/api/v1/notifications', $payload)->assertForbidden();
        $this->actingAs($admin)->postJson('/api/v1/notifications', $payload)
            ->assertCreated()->assertJsonPath('data.title', 'Reminder');

        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('outbox_messages', ['kind' => 'notification.broadcast', 'recipient_id' => $patient->id]);
        $this->assertSame(['recipient_id' => $patient->id, 'type' => 'system'], AuditLog::query()->sole()->details);
        $this->assertStringNotContainsString('Please review', AuditLog::query()->sole()->toJson());
    }

    public function test_manual_send_rejects_inactive_recipient(): void
    {
        $admin = $this->user(UserRole::Superadmin);
        $patient = $this->user(UserRole::Patient, UserStatus::Suspended);

        $this->actingAs($admin)->postJson('/api/v1/notifications', [
            'recipient_id' => $patient->id,
            'type' => 'system',
            'title' => 'Reminder',
            'message' => 'Please review your account.',
        ])->assertUnprocessable()->assertJsonValidationErrors('recipient_id');
        $this->assertDatabaseCount('notifications', 0);
    }

    public function test_admin_can_preview_and_send_to_roles_and_channels(): void
    {
        $admin = $this->user(UserRole::Admin);
        $patient = $this->user(UserRole::Patient);

        $payload = ['roles' => ['patient'], 'channels' => ['in_app', 'email'], 'title' => 'Maintenance', 'subject' => 'Scheduled maintenance', 'message' => 'The service will be briefly unavailable.'];
        $this->actingAs($admin)->postJson('/api/v1/notifications/preview', $payload)->assertOk()->assertJsonPath('data.recipients', 1)->assertJsonPath('data.email.subject', 'Scheduled maintenance');
        $this->actingAs($admin)->postJson('/api/v1/notifications', $payload)->assertCreated()->assertJsonPath('data.recipients', 1);
        $this->assertDatabaseHas('outbox_messages', ['kind' => 'email.custom', 'recipient_id' => $patient->id]);
        $this->assertDatabaseHas('notifications', ['user_id' => $patient->id, 'title' => 'Maintenance']);
    }

    public function test_channel_descriptor_is_scoped_and_private_channel_checks_user_and_epoch(): void
    {
        $owner = $this->user(UserRole::Patient);
        $owner->forceFill(['session_version' => 0])->save();
        $this->actingAs($owner)
            ->getJson('/api/v1/notifications/channel')
            ->assertOk()->assertJsonPath('data.channel', "users.{$owner->id}.0");

        $callback = Broadcast::getFacadeRoot()->getChannels()->get('users.{id}.{epoch}');
        $this->assertNotNull($callback);
        $this->assertTrue($callback($owner, $owner->id, 0));
        $this->assertFalse($callback($owner, $owner->id, 1));

        $this->assertFalse($callback($owner, fake()->uuid(), 0));
        $this->assertFalse($callback($owner, $owner->id, 1));
        $owner->profile->update(['status' => UserStatus::Suspended]);
        $this->assertFalse($callback($owner->fresh(), $owner->id, 0));
    }

    private function notification(User $user): UserNotification
    {
        return UserNotification::factory()->for($user)->create();
    }

    private function user(UserRole $role, UserStatus $status = UserStatus::Active): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $user->profile()->create(['role' => $role, 'status' => $status]);

        return $user->load('profile');
    }
}
