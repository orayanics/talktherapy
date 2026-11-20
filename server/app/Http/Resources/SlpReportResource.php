<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlpReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $attempt = $this->review?->attempt;
        $assignment = $attempt?->assignment;
        $version = $assignment?->version;
        $patient = $assignment?->patient;

        $snapshot = $this->snapshot ?? [];
        if ($request->user()->id === $patient?->id) {
            unset($snapshot['analysis']);
        }
        $data = [
            'id' => $this->id,
            'status' => $this->released_at === null ? 'approved' : 'released',
            'released_at' => $this->released_at?->toISOString(),
            'exercise' => [
                'prompt_text' => $version?->prompt_text,
                'task_type' => $version?->task_type,
                'language' => $version?->language,
            ],
            'snapshot' => $snapshot,
        ];
        if ($request->user()->id !== $patient?->id) {
            $data['patient'] = ['id' => $patient?->id, 'name' => $patient?->name];
        }

        return $data;
    }
}
