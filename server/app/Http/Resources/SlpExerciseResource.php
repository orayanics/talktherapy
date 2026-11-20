<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlpExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $version = $this->relationLoaded('versions') ? $this->versions->sortByDesc('revision')->first() : null;

        return [
            'id' => $this->id,
            'owner_id' => $this->owner_id,
            'can_manage' => $request->user()->can('update', $this->resource),
            'collection_id' => $this->collection_id,
            'is_hidden' => $this->is_hidden,
            'available_for_assignment' => $this->availableForAssignment(),
            'scope' => $this->scope,
            'module' => $this->module,
            'archived_at' => $this->archived_at?->toISOString(),
            'latest_version' => $version ? [
                'id' => $version->id,
                'revision' => $version->revision,
                'language' => $version->language,
                'dialect' => $version->dialect,
                'task_type' => $version->task_type,
                'status' => $version->status,
                'prompt_text' => $version->prompt_text,
                'configuration' => $request->user()->can('update', $this->resource) ? $version->configuration : array_diff_key($version->configuration ?? [], array_flip(['patient_ids'])),
            ] : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
