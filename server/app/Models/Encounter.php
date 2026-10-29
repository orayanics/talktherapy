<?php

namespace App\Models;

use Database\Factories\EncounterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['appointment_id', 'diagnosis', 'chief_complaint', 'referral_source', 'referral_url'])]
class Encounter extends Model
{
    /** @use HasFactory<EncounterFactory> */
    use HasFactory, HasUuids;

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
