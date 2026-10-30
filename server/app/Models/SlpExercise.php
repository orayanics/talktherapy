<?php

namespace App\Models;

use Database\Factories\SlpExerciseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['owner_id', 'scope', 'module', 'archived_at'])]
class SlpExercise extends Model
{
    /** @use HasFactory<SlpExerciseFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return ['archived_at' => 'immutable_datetime'];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(SlpExerciseVersion::class, 'exercise_id');
    }
}
