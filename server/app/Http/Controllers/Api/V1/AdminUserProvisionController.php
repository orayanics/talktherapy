<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\IssueActivationChallenge;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProvisionUserRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;

class AdminUserProvisionController extends Controller
{
    public function __invoke(ProvisionUserRequest $request, IssueActivationChallenge $issuer): UserResource
    {
        $user = DB::transaction(function () use ($request, $issuer): User {
            $user = User::query()->create([
                'name' => $request->string('name')->toString(),
                'email' => $request->string('email')->toString(),
                'password' => str()->random(64),
            ]);
            UserProfile::query()->create([
                'user_id' => $user->id,
                'role' => UserRole::from($request->string('role')->toString()),
                'status' => UserStatus::Pending,
            ]);
            $user->load('profile');

            $issuer->handle($user, $user->email);
            AuditLog::query()->create([
                'actor_id' => $request->user()->id,
                'actor_role' => $request->user()->profile->role->value,
                'action' => 'user.invited',
                'entity_type' => 'user',
                'entity_id' => $user->id,
                'request_id' => $request->attributes->get('request_id'),
                'details' => ['role' => $user->profile->role->value],
            ]);

            return $user;
        });

        return UserResource::make($user);
    }
}
