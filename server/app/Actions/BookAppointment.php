<?php

namespace App\Actions;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Appointment;
use App\Models\AppointmentEvent;
use App\Models\AuditLog;
use App\Models\Encounter;
use App\Models\OutboxMessage;
use App\Models\Slot;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BookAppointment
{
    /** @param array{diagnosis: string, chief_complaint: string, referral_source: string, referral_url?: ?string} $encounter */
    public function book(User $patient, Slot $slot, array $encounter, ?string $requestId, ?NotificationService $notifications = null): Appointment
    {
        $notifications ??= app(NotificationService::class);

        return DB::transaction(function () use ($patient, $slot, $encounter, $requestId, $notifications): Appointment {
            $lockedSlot = Slot::query()->whereKey($slot->id)->lockForUpdate()->firstOrFail();
            if ($lockedSlot->is_hidden) {
                throw new NotFoundHttpException;
            }

            if ($lockedSlot->status !== 'FREE' || $lockedSlot->start_at <= now()) {
                throw new ConflictHttpException('This slot is no longer available. Refresh the schedule and try again.');
            }

            $currentPatient = User::query()->whereKey($patient->id)->with('profile')->lockForUpdate()->firstOrFail();
            if ($currentPatient->email_verified_at === null
                || $currentPatient->profile?->role !== UserRole::Patient
                || $currentPatient->profile->status !== UserStatus::Active) {
                throw new AuthorizationException;
            }

            $clinician = User::query()->whereKey($lockedSlot->clinician_id)->with('profile')->lockForUpdate()->firstOrFail();
            if ($clinician->profile?->role !== UserRole::Clinician
                || $clinician->profile->status !== UserStatus::Active
                || $clinician->email_verified_at === null) {
                throw new NotFoundHttpException;
            }

            $claimed = Slot::query()->whereKey($lockedSlot->id)->where('status', 'FREE')->update(['status' => 'PENDING']);
            if ($claimed !== 1) {
                throw new ConflictHttpException('This slot is no longer available. Refresh the schedule and try again.');
            }

            $appointment = Appointment::query()->create([
                'slot_id' => $lockedSlot->id,
                'patient_id' => $currentPatient->id,
                'clinician_id' => $clinician->id,
                'status' => 'PENDING',
                'booked_at' => now(),
            ]);
            Encounter::query()->create([
                'appointment_id' => $appointment->id,
                ...$encounter,
            ]);
            AppointmentEvent::query()->create([
                'appointment_id' => $appointment->id,
                'actor_type' => UserRole::Patient->value,
                'actor_id' => $currentPatient->id,
                'from_status' => null,
                'to_status' => 'PENDING',
                'created_at' => now(),
            ]);
            AuditLog::query()->create([
                'actor_id' => $currentPatient->id,
                'actor_role' => UserRole::Patient->value,
                'action' => 'appointment.booked',
                'entity_type' => 'appointment',
                'entity_id' => $appointment->id,
                'request_id' => $requestId,
                'details' => ['slot_id' => $lockedSlot->id],
            ]);

            foreach ([$currentPatient, $clinician] as $recipient) {
                OutboxMessage::query()->create([
                    'kind' => 'appointment.booked',
                    'aggregate_id' => $appointment->id,
                    'recipient_id' => $recipient->id,
                    'delivery_key' => "appointment:{$appointment->id}:booked:{$recipient->id}",
                    'payload' => ['appointment_id' => $appointment->id, 'status' => 'PENDING'],
                    'available_at' => now(),
                    'expires_at' => now()->addDay(),
                ]);
                $notifications->email($recipient, 'appointment_booked', ['message' => 'A new appointment request is waiting for you in TalkTherapy.']);
            }

            return $appointment->load(['slot', 'patient.profile', 'clinician.profile', 'encounter', 'events']);
        }, attempts: 3);
    }
}
