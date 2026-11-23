<?php

namespace App\Http\Resources;

use App\Models\SlpAsset;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlpPracticeExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $assetIds = collect(($this->configuration ?? [])['asset_ids'] ?? [])->filter(fn (mixed $id): bool => is_string($id));
        $mimeTypes = SlpAsset::query()->whereIn('id', $assetIds)->pluck('mime_type', 'id');

        return [
            'id' => $this->id,
            'exercise_id' => $this->exercise_id,
            'prompt_text' => $this->prompt_text,
            'language' => $this->language,
            'dialect' => $this->dialect,
            'task_type' => $this->task_type,
            'assignment_id' => $this->assignments->first()?->id,
            'assets' => $assetIds->map(fn (string $id): array => ['id' => $id, 'url' => url('/api/v1/slp/assets/'.$id), 'mime_type' => $mimeTypes->get($id)])->values(),
        ];
    }
}
