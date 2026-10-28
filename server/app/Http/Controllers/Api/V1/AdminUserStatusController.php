<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ChangeUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;

class AdminUserStatusController extends Controller
{
    public function __invoke(ChangeUserStatusRequest $request, User $user): UserResource
    {
        DB::transaction(function () use ($request, $user): void {
            $lockedUser = User::query()->with('profile')->lockForUpdate()->findOrFail($user->id);
            abort_if($request->user()->is($lockedUser), 403);

            $status = UserStatus::from($request->string('status')->toString());
            if ($status === UserStatus::Suspended && $lockedUser->profile->role === UserRole::Superadmin) {
                $activeSuperadmins = UserProfile::query()->where('role', UserRole::Superadmin)
                    ->where('status', UserStatus::Active)->lockForUpdate()->count();
                abort_if($activeSuperadmins <= 1, 422, 'The last active superadmin cannot be suspended.');
            }

            $lockedUser->profile->update(['status' => $status]);
            if ($status === UserStatus::Suspended) {
                DB::table('sessions')->where('user_id', $lockedUser->id)->delete();
            }

            AuditLog::query()->create([
                'actor_id' => $request->user()->id,
                'actor_role' => $request->user()->profile->role->value,
                'action' => $status === UserStatus::Suspended ? 'user.suspended' : 'user.reactivated',
                'entity_type' => 'user',
                'entity_id' => $lockedUser->id,
                'request_id' => $request->attributes->get('request_id'),
                'details' => ['reason' => $request->validated('reason')],
            ]);
        });

        return UserResource::make($user->fresh()->load('profile'));
    }
}
