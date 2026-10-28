<?php

namespace App\Http\Controllers\Auth;

use App\Actions\IssueActivationChallenge;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ActivateAccountRequest;
use App\Http\Requests\Auth\ResendActivationRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\ActivationChallenge;
use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\ActivationCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class ActivationController extends Controller
{
    public function verify(VerifyOtpRequest $request): JsonResponse
    {
        $user = User::query()->with('profile')->where('email', $request->string('email'))->first();
        $challenge = $this->validChallenge($user, $request->string('otp_code')->toString());

        return new JsonResponse(['data' => [
            'role' => $user->profile->role->value,
            'requires_credentials' => $challenge?->requires_credentials ?? false,
        ]]);
    }

    public function resend(ResendActivationRequest $request, IssueActivationChallenge $issuer): JsonResponse
    {
        $user = User::query()->with('profile')->where('email', $request->string('email'))->first();
        if (! $user || $user->profile?->status !== UserStatus::Pending || $user->hasVerifiedEmail()) {
            return new JsonResponse(null, 202);
        }

        $recent = ActivationChallenge::query()->whereBelongsTo($user)->where('purpose', 'activation')
            ->where('created_at', '>', now()->subMinute())->exists();
        if ($recent) {
            return new JsonResponse(null, 202);
        }

        $requiresCredentials = ActivationChallenge::query()->whereBelongsTo($user)
            ->where('purpose', 'activation')->latest()->value('requires_credentials') ?? false;
        $code = DB::transaction(fn (): string => $issuer->handle(
            $user,
            $user->email,
            requiresCredentials: (bool) $requiresCredentials,
        ));
        try {
            $user->notify(new ActivationCodeNotification($code));
        } catch (Throwable $exception) {
            Log::warning('Activation email delivery deferred to outbox.', ['exception_type' => $exception::class]);
        }

        return new JsonResponse(null, 202);
    }

    public function activate(ActivateAccountRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = User::query()->with('profile')->where('email', $request->string('email'))->lockForUpdate()->first();
            $challenge = $this->validChallenge($user, $request->string('otp_code')->toString(), true);
            if ($user->profile?->status !== UserStatus::Pending || $user->hasVerifiedEmail()) {
                throw ValidationException::withMessages(['email' => 'This account cannot be activated.']);
            }

            if ($challenge->requires_credentials || $user->profile->role !== UserRole::Patient) {
                $request->validate(['name' => ['required'], 'password' => ['required', 'confirmed']]);
                $user->forceFill([
                    'name' => trim($request->string('name')->toString()),
                    'password' => $request->string('password')->toString(),
                ])->save();
            }
            if ($user->profile->role === UserRole::Clinician) {
                $request->validate(['diagnosis_id' => ['required', 'exists:diagnoses,id']]);
                $user->profile->update(['diagnosis_id' => $request->string('diagnosis_id')]);
            } elseif ($challenge->requires_credentials) {
                $request->validate(['diagnosis_id' => ['required', 'exists:diagnoses,id']]);
                $user->profile->update(['diagnosis_id' => $request->string('diagnosis_id')]);
            }

            $user->markEmailAsVerified();
            $user->profile->update(['status' => UserStatus::Active]);
            $challenge->update(['consumed_at' => now()]);
            AuditLog::query()->create([
                'action' => 'identity.email_verified', 'entity_type' => 'user', 'entity_id' => $user->id,
                'request_id' => $request->attributes->get('request_id'),
                'details' => ['role' => $user->profile->role->value],
            ]);

            return $user->refresh()->load('profile');
        });

        return new JsonResponse(['data' => ['status' => $user->profile->status->value]]);
    }

    private function validChallenge(?User $user, string $code, bool $lock = false): ActivationChallenge
    {
        $query = ActivationChallenge::query()->when($user, fn ($query) => $query->whereBelongsTo($user))
            ->where('purpose', 'activation')->latest();
        $challenge = $lock ? $query->lockForUpdate()->first() : $query->first();

        if (! $user || ! $challenge || $challenge->consumed_at || $challenge->expires_at->isPast()
            || $challenge->attempts >= $challenge->max_attempts || ! $challenge->matches($code)) {
            if ($challenge && ! $challenge->consumed_at && $challenge->attempts < $challenge->max_attempts) {
                $challenge->increment('attempts');
            }
            throw ValidationException::withMessages(['otp_code' => 'The verification code is invalid or expired.']);
        }

        return $challenge;
    }
}
