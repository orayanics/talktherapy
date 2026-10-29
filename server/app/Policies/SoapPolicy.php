<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\ClinicianPatient;
use App\Models\Soap;
use App\Models\User;

class SoapPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Patient, UserRole::Clinician], true);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Soap $soap): bool
    {
        return ($user->profile?->role === UserRole::Patient && $user->id === $soap->patient_id)
            || ($user->profile?->role === UserRole::Clinician
                && $user->id === $soap->clinician_id
                && $this->hasCarePair($user, $soap->patient_id));
    }

    /**
     * Determine whether the user can create models.
     */
    public function createForPatient(User $user, User $patient): bool
    {
        return $user->profile?->role === UserRole::Clinician
            && $patient->profile?->role === UserRole::Patient
            && $this->hasCarePair($user, $patient->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Soap $soap): bool
    {
        return $user->profile?->role === UserRole::Clinician
            && $user->id === $soap->clinician_id
            && $this->hasCarePair($user, $soap->patient_id);
    }

    private function hasCarePair(User $clinician, string $patientId): bool
    {
        return ClinicianPatient::query()->where('clinician_id', $clinician->id)->where('patient_id', $patientId)->exists();
    }
}
