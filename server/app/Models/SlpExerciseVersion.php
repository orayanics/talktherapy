<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['exercise_id', 'revision', 'language', 'dialect', 'task_type', 'status', 'prompt_text', 'configuration', 'created_by', 'reviewed_by'])]
class SlpExerciseVersion extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return ['configuration' => 'array'];
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(SlpExercise::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
