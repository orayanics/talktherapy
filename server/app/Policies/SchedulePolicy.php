<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Schedule;
use App\Models\User;

class SchedulePolicy
{
    public function create(User $user): bool
    {
        return $user->email_verified_at !== null
            && $user->profile?->role === UserRole::Clinician
            && $user->profile->status === UserStatus::Active;
    }

    public function view(User $user, Schedule $schedule): bool
    {
        return $user->profile?->role === UserRole::Clinician
            && $schedule->clinician_id === $user->id;
    }
}
