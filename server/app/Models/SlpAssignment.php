<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['patient_id', 'clinician_id', 'exercise_version_id', 'status', 'schedule', 'configuration_snapshot'])]
class SlpAssignment extends Model
{
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return ['schedule' => 'array', 'configuration_snapshot' => 'array'];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(SlpExerciseVersion::class, 'exercise_version_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(SlpAttempt::class, 'assignment_id');
    }
}
