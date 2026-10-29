<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\SessionSignal;
use App\Http\Controllers\Controller;
use App\Http\Requests\SessionSignalRequest;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AppointmentSessionController extends Controller
{
    public function descriptor(string $appointment): JsonResponse
    {
        $record = Appointment::query()
            ->where(fn ($query) => $query
                ->where('patient_id', request()->user()->id)
                ->orWhere('clinician_id', request()->user()->id))
            ->with(['patient:id,name', 'patient.profile:user_id,role', 'clinician:id,name', 'clinician.profile:user_id,role'])
            ->findOrFail($appointment);
        $this->ensureJoinable($record);

        return response()->json(['data' => [
            'appointment_id' => $record->id,
            'room_id' => $record->room_id,
            'channel' => "sessions.{$record->id}.{$record->session_generation}",
            'generation' => $record->session_generation,
            'user_id' => request()->user()->id,
            'peers' => collect([$record->patient, $record->clinician])->map(fn ($peer): array => [
                'id' => $peer->id,
                'name' => $peer->name,
                'role' => $peer->profile?->role?->value,
            ])->values()->all(),
            'ice_servers' => config('realtime.ice_servers', []),
        ]]);
    }

    public function signal(SessionSignalRequest $request, string $appointment): Response
    {
        $record = Appointment::query()
            ->where(fn ($query) => $query
                ->where('patient_id', $request->user()->id)
                ->orWhere('clinician_id', $request->user()->id))
            ->findOrFail($appointment);
        $this->ensureJoinable($record);

        $payload = $request->validated();
        if ((int) $payload['generation'] !== $record->session_generation) {
            throw new ConflictHttpException('This session has been refreshed. Rejoin before sending signals.');
        }

        $target = $payload['target_peer_id'] ?? null;
        if ($target !== null && ! in_array($target, [$record->patient_id, $record->clinician_id], true)) {
            throw new UnprocessableEntityHttpException('The target peer is not part of this session.');
        }

        broadcast(new SessionSignal(
            $record->id,
            $record->session_generation,
            $request->user(),
            $payload,
        ));

        return response()->noContent();
    }

    private function ensureJoinable(Appointment $appointment): void
    {
        abort_unless($appointment->status === 'ACCEPTED' && $appointment->room_id !== null, 409, 'This appointment is not available for a session.');
    }
}
