<?php

namespace App\Http\Resources;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlotResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'schedule_id' => $this->schedule_id,
            'clinician_id' => $this->clinician_id,
            'start_at' => $this->start_at?->toISOString(),
            'end_at' => $this->end_at?->toISOString(),
            'status' => $this->status,
            'is_hidden' => $this->when($request->user()?->profile?->role === UserRole::Clinician, $this->is_hidden),
            'clinician' => $this->whenLoaded('clinician', fn (): array => [
                'id' => $this->clinician->id,
                'name' => $this->clinician->name,
                'diagnosis' => $this->clinician->profile?->diagnosis === null ? null : [
                    'id' => $this->clinician->profile->diagnosis->id,
                    'label' => $this->clinician->profile->diagnosis->label,
                    'value' => $this->clinician->profile->diagnosis->value,
                ],
            ]),
        ];
    }
}
