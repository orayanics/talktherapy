<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\SlpExerciseCollection;
use App\Models\User;

class SlpExerciseCollectionPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Clinician, UserRole::Admin, UserRole::Superadmin, UserRole::Patient], true);
    }

    public function create(User $user): bool
    {
        return $user->profile?->role === UserRole::Clinician;
    }

    public function view(User $user, SlpExerciseCollection $collection): bool
    {
        if ($user->profile?->role === UserRole::Patient) {
            return SlpExerciseCollection::query()->whereKey($collection->id)->forPatient($user)->exists();
        }

        return $this->viewAny($user) && $collection->archived_at === null
            && ($collection->owner_id === $user->id || in_array($user->profile->role, [UserRole::Admin, UserRole::Superadmin], true));
    }

    public function update(User $user, SlpExerciseCollection $collection): bool
    {
        return $this->create($user) && $collection->owner_id === $user->id && $collection->archived_at === null;
    }

    public function delete(User $user, SlpExerciseCollection $collection): bool
    {
        return $this->update($user, $collection);
    }
}
