<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlpPracticeExerciseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'exercise_id' => $this->exercise_id,
            'prompt_text' => $this->prompt_text,
            'language' => $this->language,
            'dialect' => $this->dialect,
            'task_type' => $this->task_type,
            'assignment_id' => $this->assignments->first()?->id,
        ];
    }
}
