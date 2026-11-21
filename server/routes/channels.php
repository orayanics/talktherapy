<?php

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Appointment;
use App\Models\Slot;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users.{id}.{epoch}', function (User $user, string $id, int $epoch): bool {
    return $user->id === $id
        && $user->profile?->status?->value === 'active'
        && $user->hasVerifiedEmail()
        && $user->session_version === $epoch;
});

Broadcast::channel('slots.patients', fn (User $user): bool => $user->profile?->role === UserRole::Patient
    && $user->can('viewAny', Slot::class));

Broadcast::channel('slots.clinicians.{id}', fn (User $user, string $id): bool => $user->id === $id
    && $user->profile?->role === UserRole::Clinician
    && $user->can('viewAny', Slot::class));

Broadcast::channel('sessions.{appointment}.{generation}', function (User $user, Appointment $appointment, int $generation): array|bool {
    $isParticipant = $user->id === $appointment->patient_id || $user->id === $appointment->clinician_id;
    $isEligible = $appointment->status === 'ACCEPTED'
        && $appointment->session_generation === $generation
        && $user->profile?->status === UserStatus::Active
        && $user->hasVerifiedEmail();

    if (! $isParticipant || ! $isEligible) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
        'role' => $user->profile?->role?->value,
    ];
});
