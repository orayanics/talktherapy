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
                'configuration' => $version->configuration,
            ] : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
