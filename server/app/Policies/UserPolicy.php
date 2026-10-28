<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->profile?->role, [UserRole::Admin, UserRole::Superadmin], true);
    }

    public function view(User $user, User $model): bool
    {
        return $user->is($model) || $this->viewAny($user);
    }

    public function update(User $user, User $model): bool
    {
        return $user->is($model);
    }

    public function create(User $user, string $role): bool
    {
        return $user->profile?->role === UserRole::Superadmin
            ? in_array($role, [UserRole::Admin->value, UserRole::Clinician->value, UserRole::Patient->value], true)
            : ($user->profile?->role === UserRole::Admin && $role === UserRole::Clinician->value);
    }

    public function changeStatus(User $user, User $model, string $status): bool
    {
        if ($user->is($model) || ! in_array($status, ['active', 'suspended'], true)) {
            return false;
        }

        $actorRole = $user->profile?->role;
        $targetRole = $model->profile?->role;

        return $actorRole === UserRole::Superadmin
            || ($actorRole === UserRole::Admin && in_array($targetRole, [UserRole::Patient, UserRole::Clinician], true));
    }
}
