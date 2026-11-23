<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function assignments(): HasMany
    {
        return $this->hasMany(SlpAssignment::class, 'exercise_version_id');
    }

    public function scopePatientPractice(Builder $query, User $patient): Builder
    {
        return $query->where('status', 'published')->where(function (Builder $access) use ($patient): void {
            $access->where(function (Builder $assigned) use ($patient): void {
                $assigned->whereHas('assignments', fn (Builder $q) => $q->where('patient_id', $patient->id)->where('status', 'active'));
            })->orWhere(function (Builder $visible) use ($patient): void {
                $visible->whereHas('exercise', fn (Builder $q) => $q->where('is_hidden', false)->whereNull('archived_at')->whereHas('collection', fn (Builder $c) => $c->audienceForPatient($patient)))
                    ->whereNotExists(fn ($newer) => $newer->selectRaw('1')->from('slp_exercise_versions as newer')->whereColumn('newer.exercise_id', 'slp_exercise_versions.exercise_id')->where('newer.status', 'published')->whereColumn('newer.revision', '>', 'slp_exercise_versions.revision'));
            });
        });
    }
}
