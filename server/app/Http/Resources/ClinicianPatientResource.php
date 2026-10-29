<?php

namespace App\Http\Resources;

use App\Models\ClinicianPatient;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ClinicianPatient */
class ClinicianPatientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'clinicianId' => $this->clinician_id,
            'patientId' => $this->patient_id,
            'firstCompletedAt' => $this->first_completed_at?->toISOString(),
            'patient' => [
                'id' => $this->patient->id,
                'name' => $this->patient->name,
            ],
        ];
    }
}
