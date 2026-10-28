<?php

namespace App\Models;

use Database\Factories\ClinicianPatientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['clinician_id', 'patient_id', 'first_completed_at'])]
class ClinicianPatient extends Model
{
    /** @use HasFactory<ClinicianPatientFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return ['first_completed_at' => 'immutable_datetime'];
    }

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
