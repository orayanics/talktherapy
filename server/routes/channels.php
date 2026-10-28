<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users.{id}.{epoch}', function (User $user, string $id, int $epoch): bool {
    return $user->id === $id
        && $user->profile?->status?->value === 'active'
        && $user->hasVerifiedEmail()
        && $user->session_version === $epoch;
});
