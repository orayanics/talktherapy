<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\OutboxMessage;
use App\Models\Soap;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class CreateSoap
{
    /** @param array{activity_plan: string, session_type?: ?string, subjective_notes?: ?string, objective_notes?: ?string, assessment?: ?string, recommendation?: ?string, comments?: ?string} $input */
    public function create(User $clinician, User $patient, array $input, ?string $requestId): Soap
    {
        return DB::transaction(function () use ($clinician, $patient, $input, $requestId): Soap {
            Gate::forUser($clinician)->authorize('createForPatient', [Soap::class, $patient]);

            $soap = Soap::query()->create([
                ...$input,
                'clinician_id' => $clinician->id,
                'patient_id' => $patient->id,
                'version' => 1,
            ]);
            AuditLog::query()->create([
                'actor_id' => $clinician->id,
                'actor_role' => $clinician->profile->role->value,
                'action' => 'soap.created',
                'entity_type' => 'soap',
                'entity_id' => $soap->id,
                'request_id' => $requestId,
                'details' => ['version' => 1],
            ]);
            OutboxMessage::query()->create([
                'kind' => 'soap.created',
                'aggregate_id' => $soap->id,
                'recipient_id' => $patient->id,
                'delivery_key' => "soap:{$soap->id}:created:{$patient->id}",
                'payload' => ['soap_id' => $soap->id],
                'available_at' => now(),
                'expires_at' => now()->addDays(30),
            ]);

            return $soap->load(['clinician:id,name', 'clinician.profile.diagnosis', 'patient:id,name']);
        });
    }
}
