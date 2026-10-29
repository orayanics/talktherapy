<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'booked_at' => $this->booked_at?->toISOString(),
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'room_id' => $this->room_id,
            'slot' => $this->whenLoaded('slot', fn (): array => [
                'id' => $this->slot->id,
                'start_at' => $this->slot->start_at?->toISOString(),
                'end_at' => $this->slot->end_at?->toISOString(),
                'status' => $this->slot->status,
            ]),
            'patient' => $this->whenLoaded('patient', fn (): array => [
                'id' => $this->patient->id,
                'name' => $this->patient->name,
                'email' => $this->patient->email,
            ]),
            'clinician' => $this->whenLoaded('clinician', fn (): array => [
                'id' => $this->clinician->id,
                'name' => $this->clinician->name,
                'email' => $this->clinician->email,
                'diagnosis' => $this->clinician->profile?->diagnosis === null ? null : [
                    'id' => $this->clinician->profile->diagnosis->id,
                    'label' => $this->clinician->profile->diagnosis->label,
                    'value' => $this->clinician->profile->diagnosis->value,
                ],
            ]),
            'encounter' => $this->whenLoaded('encounter', fn (): ?array => $this->encounter === null ? null : [
                'id' => $this->encounter->id,
                'appointment_id' => $this->encounter->appointment_id,
                'diagnosis' => $this->encounter->diagnosis,
                'chief_complaint' => $this->encounter->chief_complaint,
                'referral_source' => $this->encounter->referral_source,
                'referral_url' => $this->encounter->referral_url,
                'created_at' => $this->encounter->created_at?->toISOString(),
                'updated_at' => $this->encounter->updated_at?->toISOString(),
            ]),
            'events' => $this->whenLoaded('events', fn (): array => $this->events->map(fn ($event): array => [
                'id' => $event->id,
                'actor_type' => $event->actor_type,
                'actor_id' => $event->actor_id,
                'from_status' => $event->from_status,
                'to_status' => $event->to_status,
                'reason' => $event->reason,
                'created_at' => $event->created_at?->toISOString(),
            ])->all()),
        ];
    }
}
