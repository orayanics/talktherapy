<?php

namespace App\Policies;

use App\Models\Diagnosis;
use App\Models\User;

class DiagnosisPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Diagnosis $diagnosis): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->profile?->role?->value, ['admin', 'superadmin'], true);
    }

    public function update(User $user, Diagnosis $diagnosis): bool
    {
        return $this->create($user);
    }

    public function delete(User $user, Diagnosis $diagnosis): bool
    {
        return $this->create($user);
    }
}
