<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): UserResource
    {
        DB::transaction(function () use ($request): void {
            $request->user()->update(['name' => $request->string('name')->toString()]);
            AuditLog::query()->create([
                'actor_id' => $request->user()->id,
                'actor_role' => $request->user()->profile->role->value,
                'action' => 'identity.profile_updated',
                'entity_type' => 'user',
                'entity_id' => $request->user()->id,
                'request_id' => $request->attributes->get('request_id'),
                'details' => ['fields' => ['name']],
            ]);
        });

        return UserResource::make($request->user()->loadMissing('profile'));
    }
}
