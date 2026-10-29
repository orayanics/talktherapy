<?php

namespace App\Http\Resources;

use App\Models\Soap;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Soap */
class SoapResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'clinicianId' => $this->clinician_id,
            'patientId' => $this->patient_id,
            'activity_plan' => $this->activity_plan,
            'session_type' => $this->session_type,
            'subjective_notes' => $this->subjective_notes,
            'objective_notes' => $this->objective_notes,
            'assessment' => $this->assessment,
            'recommendation' => $this->recommendation,
            'comments' => $this->comments,
            'version' => $this->version,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'clinician' => $this->whenLoaded('clinician', fn (): array => [
                'id' => $this->clinician->id,
                'name' => $this->clinician->name,
                'diagnosis' => $this->clinician->profile?->diagnosis === null ? null : [
                    'id' => $this->clinician->profile->diagnosis->id,
                    'label' => $this->clinician->profile->diagnosis->label,
                    'value' => $this->clinician->profile->diagnosis->value,
                ],
            ]),
            'patient' => $this->whenLoaded('patient', fn (): array => [
                'id' => $this->patient->id,
                'name' => $this->patient->name,
            ]),
        ];
    }
}
