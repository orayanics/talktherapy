<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\SlpExercise;
use App\Models\User;

class SlpExercisePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->create($user);
    }

    public function view(User $user, SlpExercise $exercise): bool
    {
        return $this->create($user) && ($exercise->owner_id === $user->id || in_array($user->profile->role, [UserRole::Admin, UserRole::Superadmin], true))
            && $exercise->archived_at === null
            && ($exercise->collection === null || $exercise->collection->archived_at === null);
    }

    public function create(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Clinician, UserRole::Admin, UserRole::Superadmin], true);
    }

    public function update(User $user, SlpExercise $exercise): bool
    {
        return $this->view($user, $exercise) && $exercise->owner_id === $user->id;
    }

    public function delete(User $user, SlpExercise $exercise): bool
    {
        return $this->update($user, $exercise);
    }
}
