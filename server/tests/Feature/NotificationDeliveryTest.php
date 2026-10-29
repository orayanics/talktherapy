<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Events\UserNotificationAvailable;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserNotification;
use App\Notifications\ActivationCodeNotification;
use App\Notifications\SystemNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use RuntimeException;
use Tests\TestCase;

class NotificationDeliveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_delivery_creates_one_safe_notification_and_is_idempotent(): void
    {
        $recipient = User::factory()->create(['email' => 'patient@example.com', 'email_verified_at' => now()]);
        $recipient->profile()->create(['role' => UserRole::Patient, 'status' => 'active']);
        $outbox = OutboxMessage::query()->create([
            'kind' => 'soap.created',
            'aggregate_id' => fake()->uuid(),
            'recipient_id' => $recipient->id,
            'delivery_key' => 'soap:test:created:'.$recipient->id,
            'payload' => ['soap_id' => fake()->uuid()],
            'available_at' => now(),
            'expires_at' => now()->addDay(),
        ]);
        Event::fake([UserNotificationAvailable::class]);

        Artisan::call('app:deliver-notifications');
        Artisan::call('app:deliver-notifications');

        $notification = UserNotification::query()->sole();
        $this->assertSame('clinical_record', $notification->type);
        $this->assertSame('A clinical record is available to view.', $notification->message);
        $this->assertNotNull($outbox->fresh()->delivered_at);
        $this->assertNotNull($outbox->fresh()->broadcasted_at);
        Event::assertDispatchedTimes(UserNotificationAvailable::class, 1);
        Event::assertDispatched(UserNotificationAvailable::class, fn (UserNotificationAvailable $event): bool => $event->recipientId === $recipient->id
            && $event->notificationId === $notification->id
            && $event->broadcastWith() === ['notification_id' => $notification->id, 'type' => 'clinical_record']);
    }

    public function test_broadcast_failure_keeps_the_inbox_and_retries_without_duplicate_rows(): void
    {
        $recipient = User::factory()->create(['email_verified_at' => now()]);
        $recipient->profile()->create(['role' => UserRole::Patient, 'status' => 'active']);
        $outbox = OutboxMessage::query()->create([
            'kind' => 'appointment.accepted',
            'aggregate_id' => fake()->uuid(),
            'recipient_id' => $recipient->id,
            'delivery_key' => 'appointment:test:accepted:'.$recipient->id,
            'payload' => ['status' => 'ACCEPTED'],
            'available_at' => now(),
            'expires_at' => now()->addDay(),
        ]);
        Event::listen(UserNotificationAvailable::class, static function (): never {
            throw new RuntimeException('Broadcast unavailable.');
        });

        Artisan::call('app:deliver-notifications');
        $this->assertDatabaseCount('notifications', 1);
        $this->assertNotNull($outbox->fresh()->delivered_at);
        $this->assertNull($outbox->fresh()->broadcasted_at);
        $this->assertSame('notification_delivery_failed', $outbox->fresh()->last_error_code);

        $this->travel(15)->seconds();
        Artisan::call('app:deliver-notifications');

        $this->assertDatabaseCount('notifications', 1);
        $this->assertSame(2, $outbox->fresh()->attempts);
    }

    public function test_email_outbox_delivery_sends_without_creating_an_inbox_row(): void
    {
        $recipient = User::factory()->create(['email' => 'patient@example.com', 'email_verified_at' => now()]);
        $recipient->profile()->create(['role' => UserRole::Patient, 'status' => 'active']);
        OutboxMessage::query()->create([
            'kind' => 'email.password_changed',
            'aggregate_id' => $recipient->id,
            'recipient_id' => $recipient->id,
            'delivery_key' => 'email:password-changed:test:'.$recipient->id,
            'payload' => ['message' => 'Your password changed.'],
            'available_at' => now(),
            'expires_at' => now()->addDay(),
        ]);
        Notification::fake();

        Artisan::call('app:deliver-notifications');

        Notification::assertSentOnDemand(SystemNotification::class, function ($notification, array $channels, object $notifiable): bool {
            return $notification->subject === 'Your TalkTherapy password was changed'
                && $notification->body === 'Your password changed.'
                && $notifiable->routes['mail'] === 'patient@example.com';
        });
        $this->assertDatabaseCount('notifications', 0);
        $this->assertNotNull(OutboxMessage::query()->where('kind', 'email.password_changed')->sole()->broadcasted_at);
    }

    public function test_identity_activation_outbox_sends_invitation_email(): void
    {
        $recipient = User::factory()->create(['email' => 'invite@example.com']);
        $recipient->profile()->create(['role' => UserRole::Clinician, 'status' => 'pending']);
        OutboxMessage::query()->create([
            'kind' => 'identity.activation',
            'aggregate_id' => fake()->uuid(),
            'recipient_id' => $recipient->id,
            'delivery_key' => 'identity:activation:test:'.$recipient->id,
            'payload' => ['email' => $recipient->email, 'code' => '123456', 'purpose' => 'activation'],
            'available_at' => now(),
            'expires_at' => now()->addDay(),
        ]);
        Notification::fake();

        Artisan::call('app:deliver-notifications');

        Notification::assertSentOnDemand(ActivationCodeNotification::class, function ($notification, array $channels, object $notifiable): bool {
            return $notification->code === '123456' && $notifiable->routes['mail'] === 'invite@example.com';
        });
    }
}
