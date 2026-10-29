<?php

namespace App\Actions;

use App\Enums\UserStatus;
use App\Models\Appointment;
use App\Models\AppointmentEvent;
use App\Models\AuditLog;
use App\Models\ClinicianPatient;
use App\Models\OutboxMessage;
use App\Models\Slot;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TransitionAppointment
{
    /** @param array{reason?: string, is_hidden?: bool} $input */
    public function accept(User $actor, string $appointmentId, array $input, ?string $requestId, ?NotificationService $notifications = null): Appointment
    {
        return $this->transition($actor, $appointmentId, 'accept', $input, $requestId, $notifications);
    }

    /** @param array{reason: string, is_hidden?: bool} $input */
    public function reject(User $actor, string $appointmentId, array $input, ?string $requestId, ?NotificationService $notifications = null): Appointment
    {
        return $this->transition($actor, $appointmentId, 'reject', $input, $requestId, $notifications);
    }

    /** @param array{reason: string} $input */
    public function cancel(User $actor, string $appointmentId, array $input, ?string $requestId, ?NotificationService $notifications = null): Appointment
    {
        return $this->transition($actor, $appointmentId, 'cancel', $input, $requestId, $notifications);
    }

    /** @param array<string, mixed> $input */
    public function complete(User $actor, string $appointmentId, array $input, ?string $requestId, ?NotificationService $notifications = null): Appointment
    {
        return $this->transition($actor, $appointmentId, 'complete', $input, $requestId, $notifications);
    }

    /** @param array<string, mixed> $input */
    private function transition(User $actor, string $appointmentId, string $action, array $input, ?string $requestId, ?NotificationService $notifications): Appointment
    {
        $initial = Appointment::query()->select(['id', 'slot_id'])->findOrFail($appointmentId);

        $notifications ??= app(NotificationService::class);

        return DB::transaction(function () use ($actor, $initial, $action, $input, $requestId, $notifications): Appointment {
            $slot = Slot::query()->whereKey($initial->slot_id)->lockForUpdate()->firstOrFail();
            $appointment = Appointment::query()->whereKey($initial->id)->lockForUpdate()->firstOrFail();
            if ($actor->id !== $appointment->patient_id && $actor->id !== $appointment->clinician_id) {
                throw new NotFoundHttpException;
            }

            $currentActor = User::query()->with('profile')->lockForUpdate()->findOrFail($actor->id);
            if ($currentActor->email_verified_at === null || $currentActor->profile?->status !== UserStatus::Active) {
                throw new AuthorizationException;
            }

            $ability = match ($action) {
                'accept' => 'accept',
                'reject' => 'reject',
                'cancel' => 'cancel',
                'complete' => 'complete',
            };
            Gate::forUser($currentActor)->authorize($ability, $appointment);

            $fromStatus = $appointment->status;
            $target = match ($action) {
                'accept' => ['from' => 'PENDING', 'to' => 'ACCEPTED', 'slot_from' => 'PENDING', 'slot_to' => 'ACCEPTED'],
                'reject' => ['from' => 'PENDING', 'to' => 'REJECT', 'slot_from' => 'PENDING', 'slot_to' => ($input['is_hidden'] ?? false) ? 'REJECT' : 'FREE'],
                'cancel' => ['from' => 'PENDING', 'to' => 'CANCELLED', 'slot_from' => 'PENDING', 'slot_to' => 'CANCELLED'],
                'complete' => ['from' => 'ACCEPTED', 'to' => 'COMPLETED', 'slot_from' => 'ACCEPTED', 'slot_to' => 'COMPLETED'],
            };
            if ($fromStatus !== $target['from'] || $slot->status !== $target['slot_from']) {
                throw new ConflictHttpException('This appointment can no longer be changed. Refresh and try again.');
            }

            if (in_array($action, ['reject', 'cancel'], true) && $slot->start_at < now()->addHours(24)) {
                throw new UnprocessableEntityHttpException('This appointment cannot be changed within 24 hours of its start time.');
            }

            $appointment->status = $target['to'];
            if ($action === 'accept') {
                $appointment->confirmed_at = now();
                $appointment->room_id = (string) Str::uuid();
            } elseif ($action === 'cancel') {
                $appointment->cancelled_at = now();
            } elseif ($action === 'complete') {
                $appointment->completed_at = now();
                $appointment->session_generation++;
            }
            $appointment->save();

            $slot->status = $target['slot_to'];
            if ($action === 'reject' && ($input['is_hidden'] ?? false)) {
                $slot->is_hidden = true;
            }
            $slot->save();

            $eventAction = match ($action) {
                'accept' => 'accepted',
                'reject' => 'rejected',
                'cancel' => 'cancelled',
                'complete' => 'completed',
            };
            AppointmentEvent::query()->create([
                'appointment_id' => $appointment->id,
                'actor_type' => $currentActor->profile->role->value,
                'actor_id' => $currentActor->id,
                'from_status' => $fromStatus,
                'to_status' => $appointment->status,
                'reason' => $input['reason'] ?? null,
                'created_at' => now(),
            ]);
            AuditLog::query()->create([
                'actor_id' => $currentActor->id,
                'actor_role' => $currentActor->profile->role->value,
                'action' => "appointment.{$eventAction}",
                'entity_type' => 'appointment',
                'entity_id' => $appointment->id,
                'request_id' => $requestId,
                'details' => ['from_status' => $fromStatus, 'to_status' => $appointment->status],
            ]);

            $recipientId = $currentActor->id === $appointment->patient_id ? $appointment->clinician_id : $appointment->patient_id;
            OutboxMessage::query()->create([
                'kind' => "appointment.{$eventAction}",
                'aggregate_id' => $appointment->id,
                'recipient_id' => $recipientId,
                'delivery_key' => "appointment:{$appointment->id}:{$appointment->status}:{$recipientId}",
                'payload' => ['appointment_id' => $appointment->id, 'status' => $appointment->status],
                'available_at' => now(),
                'expires_at' => now()->addDay(),
            ]);
            $notifications->email(User::query()->findOrFail($recipientId), 'appointment_'.$eventAction, ['message' => "Your appointment status is now {$appointment->status}."]);

            if ($action === 'complete') {
                $now = now();
                DB::table((new ClinicianPatient)->getTable())->upsert([[
                    'id' => (string) Str::uuid(),
                    'clinician_id' => $appointment->clinician_id,
                    'patient_id' => $appointment->patient_id,
                    'first_completed_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]], ['clinician_id', 'patient_id'], ['updated_at']);
            }

            return $appointment->load(['slot', 'patient:id,name,email', 'clinician:id,name,email', 'clinician.profile.diagnosis', 'encounter', 'events']);
        }, attempts: 3);
    }
}
