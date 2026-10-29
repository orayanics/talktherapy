<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Slot;
use App\Models\User;

class SlotPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->isActiveMember($user)
            && in_array($user->profile?->role, [UserRole::Patient, UserRole::Clinician], true);
    }

    public function view(User $user, Slot $slot): bool
    {
        if (! $this->isActiveMember($user)) {
            return false;
        }

        if ($user->profile?->role === UserRole::Clinician) {
            return $slot->clinician_id === $user->id;
        }

        return $user->profile?->role === UserRole::Patient
            && $slot->status === 'FREE'
            && ! $slot->is_hidden
            && $slot->start_at > now()
            && $slot->clinician?->email_verified_at !== null
            && $slot->clinician?->profile?->role === UserRole::Clinician
            && $slot->clinician?->profile?->status === UserStatus::Active;
    }

    private function isActiveMember(User $user): bool
    {
        return $user->email_verified_at !== null
            && $user->profile?->status === UserStatus::Active;
    }
}
