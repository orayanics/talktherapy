<?php

namespace App\Http\Controllers\Auth;

use App\Actions\IssueActivationChallenge;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterPatientRequest;
use App\Models\AuditLog;
use App\Models\ConsentEvidence;
use App\Models\OutboxMessage;
use App\Models\User;
use App\Models\UserProfile;
use App\Notifications\ActivationCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class RegistrationController extends Controller
{
    public function storePatient(RegisterPatientRequest $request, IssueActivationChallenge $issuer): JsonResponse
    {
        [$user, $code] = DB::transaction(function () use ($request, $issuer): array {
            $user = User::query()->create([
                'name' => $request->string('name')->toString(),
                'email' => $request->string('email')->toString(),
                'password' => $request->string('password')->toString(),
            ]);
            UserProfile::query()->create([
                'user_id' => $user->id,
                'role' => UserRole::Patient,
                'status' => UserStatus::Pending,
                'diagnosis_id' => $request->string('diagnosis_id')->toString(),
            ]);
            $user->load('profile');

            ConsentEvidence::query()->create([
                'user_id' => $user->id,
                'purpose' => 'patient_registration',
                'policy_version' => '2026-10-28',
                'accepted_at' => now(),
            ]);
            $code = $issuer->handle($user, $user->email);
            AuditLog::query()->create([
                'actor_id' => null,
                'actor_role' => null,
                'action' => 'identity.patient_registered',
                'entity_type' => 'user',
                'entity_id' => $user->id,
                'request_id' => $request->attributes->get('request_id'),
                'details' => ['role' => 'patient', 'status' => 'pending'],
            ]);

            return [$user, $code];
        });

        try {
            $user->notify(new ActivationCodeNotification($code));
            OutboxMessage::query()->where('recipient_id', $user->id)->where('kind', 'identity.activation')->whereNull('broadcasted_at')->latest()->first()?->forceFill(['delivered_at' => now(), 'broadcasted_at' => now()])->save();
        } catch (Throwable $exception) {
            Log::warning('Activation email delivery deferred to outbox.', ['exception_type' => $exception::class]);
        }

        return new JsonResponse(['data' => ['email' => $user->email, 'status' => 'pending']], 201);
    }
}
