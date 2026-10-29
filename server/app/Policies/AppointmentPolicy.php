<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Patient, UserRole::Clinician], true);
    }

    public function view(User $user, Appointment $appointment): bool
    {
        return $user->id === $appointment->patient_id || $user->id === $appointment->clinician_id;
    }

    public function create(User $user): bool
    {
        return $user->profile?->role === UserRole::Patient;
    }

    public function accept(User $user, Appointment $appointment): bool
    {
        return $user->profile?->role === UserRole::Clinician
            && $user->id === $appointment->clinician_id;
    }

    public function reject(User $user, Appointment $appointment): bool
    {
        return $this->accept($user, $appointment);
    }

    public function cancel(User $user, Appointment $appointment): bool
    {
        return $user->profile?->role === UserRole::Patient
            && $user->id === $appointment->patient_id;
    }

    public function complete(User $user, Appointment $appointment): bool
    {
        return $this->accept($user, $appointment);
    }
}
