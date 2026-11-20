<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlpReviewAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $review = $this->reviews->sortByDesc('revision')->first();

        return [
            'id' => $this->id,
            'status' => $this->status,
            'analysis_status' => $this->analysis?->status,
            'patient' => [
                'id' => $this->assignment->patient_id,
                'name' => $this->assignment->patient?->name,
            ],
            'exercise' => [
                'id' => $this->assignment->version->id,
                'prompt_text' => $this->assignment->version->prompt_text,
                'task_type' => $this->assignment->version->task_type,
                'language' => $this->assignment->version->language,
            ],
            'recording' => $this->recording === null ? null : [
                'url' => url('/api/v1/slp/attempts/'.$this->id.'/recording'),
                'mime_type' => $this->recording->mime_type,
                'bytes' => $this->recording->bytes,
                'duration_ms' => $this->recording->duration_ms,
            ],
            'analysis' => $this->analysis,
            'latest_review' => $review,
        ];
    }
}
