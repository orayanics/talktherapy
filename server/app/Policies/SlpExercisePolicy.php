<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\SlpExercise;
use App\Models\User;

class SlpExercisePolicy
{
    public function viewAny(User $user): bool { return $user->profile?->role !== UserRole::Patient; }

    public function view(User $user, SlpExercise $exercise): bool
    {
        return $this->isAdmin($user) || $exercise->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Clinician, UserRole::Admin, UserRole::Superadmin], true);
    }

    public function update(User $user, SlpExercise $exercise): bool { return $this->view($user, $exercise); }

    public function delete(User $user, SlpExercise $exercise): bool { return $this->view($user, $exercise); }

    private function isAdmin(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Admin, UserRole::Superadmin], true);
    }
}
