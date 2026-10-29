<?php

namespace App\Policies;

use App\Enums\UserRole;
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
        return $this->viewAdmin($user);
    }

    public function viewAdmin(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Admin, UserRole::Superadmin], true);
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
