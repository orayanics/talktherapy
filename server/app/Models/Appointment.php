<?php

namespace App\Models;

use Database\Factories\AppointmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['slot_id', 'patient_id', 'clinician_id', 'status', 'booked_at', 'confirmed_at', 'cancelled_at', 'completed_at', 'room_id', 'session_generation'])]
class Appointment extends Model
{
    /** @use HasFactory<AppointmentFactory> */
    use HasFactory, HasUuids;

    public function slot(): BelongsTo
    {
        return $this->belongsTo(Slot::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AppointmentEvent::class)->orderBy('created_at')->orderBy('id');
    }

    public function encounter(): HasOne
    {
        return $this->hasOne(Encounter::class);
    }

    protected function casts(): array
    {
        return [
            'booked_at' => 'immutable_datetime',
            'confirmed_at' => 'immutable_datetime',
            'cancelled_at' => 'immutable_datetime',
            'completed_at' => 'immutable_datetime',
            'session_generation' => 'integer',
        ];
    }
}
