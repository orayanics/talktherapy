<?php

namespace App\Console\Commands;

use App\Enums\UserStatus;
use App\Events\UserNotificationAvailable;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

#[Signature('app:deliver-notifications')]
#[Description('Materialize and broadcast pending notification outbox messages')]
class DeliverNotifications extends Command
{
    public function handle(): int
    {
        OutboxMessage::query()
            ->whereIn('kind', ['appointment.booked', 'appointment.accepted', 'appointment.rejected', 'appointment.cancelled', 'appointment.completed', 'soap.created', 'soap.updated', 'notification.broadcast'])
            ->whereNull('broadcasted_at')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->where(fn (Builder $query): Builder => $query->whereNull('claimed_at')->orWhere('claimed_at', '<', now()->subMinutes(5)))
            ->update(['delivered_at' => now(), 'broadcasted_at' => now(), 'claimed_at' => null, 'claim_token' => null, 'last_error_code' => 'notification_expired']);

        $processed = 0;
        while ($processed < 100 && ($message = $this->claim())) {
            try {
                $this->deliver($message);
                $processed++;
            } catch (Throwable) {
                $this->releaseAfterFailure($message);
            }
        }

        $this->info("Processed {$processed} notification deliveries.");

        return self::SUCCESS;
    }

    private function claim(): ?OutboxMessage
    {
        return DB::transaction(function (): ?OutboxMessage {
            $message = OutboxMessage::query()
                ->whereIn('kind', ['appointment.booked', 'appointment.accepted', 'appointment.rejected', 'appointment.cancelled', 'appointment.completed', 'soap.created', 'soap.updated', 'notification.broadcast'])
                ->where('attempts', '<', 5)
                ->where('available_at', '<=', now())
                ->where(fn (Builder $query): Builder => $query->whereNull('claimed_at')->orWhere('claimed_at', '<', now()->subMinutes(5)))
                ->where(fn (Builder $query): Builder => $query->whereNull('broadcasted_at')->where(fn (Builder $query): Builder => $query->whereNull('expires_at')->orWhere('expires_at', '>', now())))
                ->orderBy('created_at')
                ->lockForUpdate()
                ->first();

            if (! $message) {
                return null;
            }

            $message->forceFill(['claimed_at' => now(), 'claim_token' => (string) Str::uuid(), 'attempts' => $message->attempts + 1])->save();

            return $message;
        });
    }

    private function deliver(OutboxMessage $message): void
    {
        $notification = DB::transaction(function () use ($message): ?UserNotification {
            $locked = OutboxMessage::query()->whereKey($message->id)->lockForUpdate()->firstOrFail();
            if ($locked->claim_token !== $message->claim_token) {
                return null;
            }

            $notification = $this->notificationFor($locked);
            if (! $notification) {
                $locked->forceFill(['delivered_at' => now(), 'broadcasted_at' => now(), 'claimed_at' => null, 'claim_token' => null])->save();

                return null;
            }

            $recipient = User::query()->with('profile')->find($locked->recipient_id);
            if (! $recipient || $recipient->profile?->status !== UserStatus::Active || ! $recipient->hasVerifiedEmail()) {
                $locked->forceFill(['delivered_at' => now(), 'broadcasted_at' => now(), 'claimed_at' => null, 'claim_token' => null])->save();

                return null;
            }

            $locked->forceFill(['delivered_at' => now()])->save();

            return $notification;
        });

        if (! $notification) {
            return;
        }

        $recipient = User::query()->with('profile')->find($message->recipient_id);
        if (! $recipient || $recipient->profile?->status !== UserStatus::Active || ! $recipient->hasVerifiedEmail()) {
            OutboxMessage::query()->whereKey($message->id)->where('claim_token', $message->claim_token)->update([
                'broadcasted_at' => now(), 'claimed_at' => null, 'claim_token' => null,
            ]);

            return;
        }

        event(new UserNotificationAvailable($recipient->id, $recipient->session_version, $notification->id, $notification->type));
        OutboxMessage::query()->whereKey($message->id)->where('claim_token', $message->claim_token)->update([
            'broadcasted_at' => now(), 'claimed_at' => null, 'claim_token' => null, 'last_error_code' => null,
        ]);
    }

    private function notificationFor(OutboxMessage $message): ?UserNotification
    {
        if ($message->kind === 'notification.broadcast') {
            return UserNotification::query()->whereKey($message->payload['notification_id'])->first();
        }

        $appointment = str_starts_with($message->kind, 'appointment.');
        [$title, $text, $type, $entityType] = match ($message->kind) {
            'appointment.booked' => ['Appointment requested', 'An appointment request is ready to review.', 'appointment', 'appointment'],
            'appointment.accepted' => ['Appointment accepted', 'Your appointment has been accepted.', 'appointment', 'appointment'],
            'appointment.rejected' => ['Appointment declined', 'Your appointment request was declined.', 'appointment', 'appointment'],
            'appointment.cancelled' => ['Appointment cancelled', 'Your appointment was cancelled.', 'appointment', 'appointment'],
            'appointment.completed' => ['Appointment completed', 'Your appointment has been completed.', 'appointment', 'appointment'],
            'soap.created' => ['Clinical record available', 'A clinical record is available to view.', 'clinical_record', 'soap'],
            'soap.updated' => ['Clinical record updated', 'A clinical record has been updated.', 'clinical_record', 'soap'],
            default => [null, null, null, null],
        };

        if ($title === null) {
            return null;
        }

        return UserNotification::query()->firstOrCreate(
            ['delivery_key' => $message->delivery_key],
            [
                'user_id' => $message->recipient_id,
                'type' => $type,
                'title' => $title,
                'message' => $text,
                'entity_type' => $entityType,
                'entity_id' => $appointment ? $message->aggregate_id : $message->payload['soap_id'],
            ],
        );
    }

    private function releaseAfterFailure(OutboxMessage $message): void
    {
        OutboxMessage::query()->whereKey($message->id)->where('claim_token', $message->claim_token)->update([
            'available_at' => now()->addSeconds(min(300, 15 * (2 ** max(0, $message->attempts - 1)))),
            'claimed_at' => null,
            'claim_token' => null,
            'last_error_code' => 'notification_delivery_failed',
        ]);
    }
}
