<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['owner_id', 'title', 'description', 'cover_path', 'is_hidden', 'archived_at', 'patient_audience', 'patient_ids'])]
class SlpExerciseCollection extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return ['is_hidden' => 'boolean', 'archived_at' => 'immutable_datetime', 'patient_ids' => 'array'];
    }

    public function scopeAudienceForPatient(Builder $query, User $patient): Builder
    {
        return $query->where('is_hidden', false)->whereNull('archived_at')->where(function (Builder $audience) use ($patient): void {
            $audience->where('patient_audience', 'platform')
                ->orWhere(fn (Builder $q) => $q->where('patient_audience', 'selected')->whereJsonContains('patient_ids', $patient->id))
                ->orWhere(fn (Builder $q) => $q->where('patient_audience', 'clinician')->whereIn('owner_id', ClinicianPatient::query()->select('clinician_id')->where('patient_id', $patient->id)));
        });
    }

    public function scopeForPatient(Builder $query, User $patient): Builder
    {
        return $query->where(function (Builder $access) use ($patient): void {
            $access->where(fn (Builder $audience) => $audience->audienceForPatient($patient))
                ->orWhereHas('exercises.versions', fn (Builder $version) => $version
                    ->where('status', 'published')
                    ->whereHas('assignments', fn (Builder $assignment) => $assignment
                        ->where('patient_id', $patient->id)
                        ->where('status', 'active')));
        });
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(SlpExercise::class, 'collection_id');
    }
}
