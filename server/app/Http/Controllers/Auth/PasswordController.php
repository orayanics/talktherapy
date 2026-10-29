<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    public function change(ChangePasswordRequest $request, NotificationService $notifications): Response
    {
        DB::transaction(function () use ($request, $notifications): void {
            $request->user()->update(['password' => $request->string('password')->toString(), 'remember_token' => Str::random(60)]);
            $sessions = DB::table('sessions')->where('user_id', $request->user()->id);
            if ($request->hasSession()) {
                $sessions->where('id', '!=', $request->session()->getId());
            }
            $sessions->delete();
            AuditLog::query()->create([
                'actor_id' => $request->user()->id,
                'actor_role' => $request->user()->profile->role->value,
                'action' => 'identity.password_changed',
                'entity_type' => 'user',
                'entity_id' => $request->user()->id,
                'request_id' => $request->attributes->get('request_id'),
            ]);
            $notifications->email($request->user(), 'password_changed', ['message' => 'Your TalkTherapy password was changed. If you did not make this change, contact support immediately.']);
        });

        return response()->noContent();
    }

    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return new JsonResponse(null, 202);
    }

    public function reset(ResetPasswordRequest $request): Response
    {
        $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function (User $user, string $password): void {
            $user->forceFill(['password' => Hash::make($password), 'remember_token' => Str::random(60)])->save();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            event(new PasswordReset($user));
        });
        if ($status !== Password::PasswordReset) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return response()->noContent();
    }
}
