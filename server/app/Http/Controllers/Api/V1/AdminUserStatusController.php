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
use Illuminate\Support\Facades\Gate;

class AdminUserStatusController extends Controller
{
    public function __invoke(ChangeUserStatusRequest $request, string $user): UserResource
    {
        $target = User::query()->with('profile')->findOrFail($user);
        $status = UserStatus::from($request->string('status')->toString());
        Gate::authorize('changeStatus', [$target, $status->value]);

        DB::transaction(function () use ($request, $target, $status): void {
            $lockedUser = User::query()->with('profile')->lockForUpdate()->findOrFail($target->id);
            abort_if($request->user()->is($lockedUser), 403);

            $currentStatus = $lockedUser->profile->status;
            $isValidTransition = ($currentStatus === UserStatus::Active && $status === UserStatus::Suspended)
                || ($currentStatus === UserStatus::Suspended && $status === UserStatus::Active);
            abort_unless($isValidTransition, 409, 'The account status cannot be changed from its current state.');

            if ($status === UserStatus::Suspended && $lockedUser->profile->role === UserRole::Superadmin) {
                $activeSuperadmins = UserProfile::query()->where('role', UserRole::Superadmin)
                    ->where('status', UserStatus::Active)->orderBy('user_id')->lockForUpdate()->get()->count();
                abort_if($activeSuperadmins <= 1, 422, 'The last active superadmin cannot be suspended.');
            }

            $lockedUser->profile->update(['status' => $status]);
            if ($status === UserStatus::Suspended) {
                $lockedUser->increment('session_version');
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

        return UserResource::make($target->fresh()->load('profile'));
    }
}
