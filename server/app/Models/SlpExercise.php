<?php

namespace App\Models;

use Database\Factories\SlpExerciseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['owner_id', 'scope', 'module', 'archived_at', 'collection_id', 'is_hidden'])]
class SlpExercise extends Model
{
    /** @use HasFactory<SlpExerciseFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return ['archived_at' => 'immutable_datetime', 'is_hidden' => 'boolean'];
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(SlpExerciseCollection::class, 'collection_id');
    }

    public function availableForAssignment(): bool
    {
        return $this->archived_at === null && ! $this->is_hidden
            && ($this->collection === null || (! $this->collection->is_hidden && $this->collection->archived_at === null));
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
