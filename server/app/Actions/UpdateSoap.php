<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\OutboxMessage;
use App\Models\Soap;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class UpdateSoap
{
    /** @param array{version: int, activity_plan?: string, session_type?: ?string, subjective_notes?: ?string, objective_notes?: ?string, assessment?: ?string, recommendation?: ?string, comments?: ?string} $input */
    public function update(User $clinician, Soap $soap, array $input, ?string $requestId): Soap
    {
        return DB::transaction(function () use ($clinician, $soap, $input, $requestId): Soap {
            $record = Soap::query()->whereKey($soap->id)->lockForUpdate()->firstOrFail();
            Gate::forUser($clinician)->authorize('update', $record);
            $version = $input['version'];
            unset($input['version']);

            $updated = Soap::query()->whereKey($record->id)->where('version', $version)->update([
                ...$input,
                'version' => $version + 1,
                'updated_at' => now(),
            ]);
            if ($updated !== 1) {
                throw new ConflictHttpException('This SOAP note has changed. Refresh before saving again.');
            }

            AuditLog::query()->create([
                'actor_id' => $clinician->id,
                'actor_role' => $clinician->profile->role->value,
                'action' => 'soap.updated',
                'entity_type' => 'soap',
                'entity_id' => $record->id,
                'request_id' => $requestId,
                'details' => ['from_version' => $version, 'to_version' => $version + 1],
            ]);
            OutboxMessage::query()->create([
                'kind' => 'soap.updated',
                'aggregate_id' => $record->id,
                'recipient_id' => $record->patient_id,
                'delivery_key' => "soap:{$record->id}:updated:".($version + 1).":{$record->patient_id}",
                'payload' => ['soap_id' => $record->id],
                'available_at' => now(),
                'expires_at' => now()->addDays(30),
            ]);

            return $record->fresh()->load(['clinician:id,name', 'clinician.profile.diagnosis', 'patient:id,name']);
        });
    }
}
