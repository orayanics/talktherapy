<?php

namespace App\Http\Controllers\Auth;

use App\Actions\IssueActivationChallenge;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ConfirmEmailChangeRequest;
use App\Http\Requests\Auth\RequestEmailChangeRequest;
use App\Models\ActivationChallenge;
use App\Models\AuditLog;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Notifications\ActivationCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\ValidationException;
use Throwable;

class EmailChangeController extends Controller
{
    public function request(RequestEmailChangeRequest $request, IssueActivationChallenge $issuer): JsonResponse
    {
        $newEmail = $request->string('new_email')->toString();
        $code = DB::transaction(fn (): string => $issuer->handle($request->user(), $newEmail, 'email_change', $newEmail));
        try {
            Notification::route('mail', $newEmail)->notify(new ActivationCodeNotification($code, 'email_change'));
            OutboxMessage::query()->where('recipient_id', $request->user()->id)->where('kind', 'identity.email_change')->whereNull('broadcasted_at')->latest()->first()?->forceFill(['delivered_at' => now(), 'broadcasted_at' => now()])->save();
        } catch (Throwable $exception) {
            Log::warning('Email change delivery deferred to outbox.', ['exception_type' => $exception::class]);
        }

        return new JsonResponse(null, 202);
    }

    public function confirm(ConfirmEmailChangeRequest $request): JsonResponse
    {
        DB::transaction(function () use ($request): void {
            $user = $request->user();
            $challenge = ActivationChallenge::query()->whereBelongsTo($user)->where('purpose', 'email_change')
                ->latest()->lockForUpdate()->first();
            if (! $challenge || $challenge->consumed_at || $challenge->expires_at->isPast()
                || $challenge->attempts >= $challenge->max_attempts || ! $challenge->matches($request->string('otp_code'))) {
                if ($challenge && ! $challenge->consumed_at && $challenge->attempts < $challenge->max_attempts) {
                    $challenge->increment('attempts');
                }
                throw ValidationException::withMessages(['otp_code' => 'The verification code is invalid or expired.']);
            }

            if (User::query()->where('email', $challenge->new_email)->whereKeyNot($user->id)->exists()) {
                throw ValidationException::withMessages(['email' => 'The email has already been taken.']);
            }
            $user->forceFill(['email' => $challenge->new_email, 'email_verified_at' => now()])->save();
            $challenge->update(['consumed_at' => now()]);
            AuditLog::query()->create([
                'actor_id' => $user->id, 'actor_role' => $user->profile->role->value,
                'action' => 'identity.email_changed', 'entity_type' => 'user', 'entity_id' => $user->id,
                'request_id' => $request->attributes->get('request_id'),
            ]);
        });

        return new JsonResponse(['data' => ['email' => $request->user()->fresh()->email]]);
    }
}
