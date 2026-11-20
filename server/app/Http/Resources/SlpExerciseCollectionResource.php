<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlpExerciseCollectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'owner_id' => $this->owner_id,
            'can_manage' => $request->user()->can('update', $this->resource),
            'patient_audience' => $this->patient_audience,
            'patient_ids' => $this->when($request->user()->can('update', $this->resource), $this->patient_ids ?? []),
            'title' => $this->title,
            'description' => $this->description,
            'is_hidden' => $this->is_hidden,
            'cover_url' => $this->cover_path ? route('slp.collections.cover', $this->id) : null,
            'exercises_count' => $this->when($request->user()->profile->role->value !== 'patient', $this->whenCounted('exercises')),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
