<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlpAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'clinician_id' => $this->clinician_id,
            'exercise_version_id' => $this->exercise_version_id,
            'status' => $this->status,
            'schedule' => $this->schedule,
            'version' => $this->whenLoaded('version', fn (): ?array => $this->version === null ? null : [
                'id' => $this->version->id,
                'prompt_text' => $this->version->prompt_text,
                'task_type' => $this->version->task_type,
                'language' => $this->version->language,
                'status' => $this->version->status,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
