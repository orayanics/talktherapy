<?php

namespace App\Models;

use Database\Factories\SoapFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['clinician_id', 'patient_id', 'activity_plan', 'session_type', 'subjective_notes', 'objective_notes', 'assessment', 'recommendation', 'comments', 'version'])]
class Soap extends Model
{
    protected $table = 'soaps';

    /** @use HasFactory<SoapFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return ['version' => 'integer'];
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
