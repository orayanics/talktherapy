<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserProfile;

class UserProfilePolicy
{
    public function view(User $user, UserProfile $profile): bool
    {
        return $user->id === $profile->user_id || $user->can('viewAny', User::class);
    }

    public function update(User $user, UserProfile $profile): bool
    {
        return $user->id === $profile->user_id;
    }
}
