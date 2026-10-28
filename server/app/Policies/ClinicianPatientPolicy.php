<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class ClinicianPatientPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->profile?->role === UserRole::Clinician;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }
}
