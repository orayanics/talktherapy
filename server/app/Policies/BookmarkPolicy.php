<?php

namespace App\Policies;

use App\Models\Bookmark;
use App\Models\User;

class BookmarkPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Bookmark $bookmark): bool
    {
        return $user->is($bookmark->user);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function delete(User $user, Bookmark $bookmark): bool
    {
        return $user->is($bookmark->user);
    }
}
