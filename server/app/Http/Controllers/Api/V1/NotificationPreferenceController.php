<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\NotificationPreferencesRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $preferences = array_merge(['in_app' => true, 'email' => true], $request->user()->profile?->notification_preferences ?? []);

        return response()->json(['data' => $preferences]);
    }

    public function update(NotificationPreferencesRequest $request): JsonResponse
    {
        $profile = $request->user()->profile;
        $profile->forceFill(['notification_preferences' => $request->validated()])->save();

        return $this->show($request);
    }
}
