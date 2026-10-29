<?php

namespace App\Models;

use Database\Factories\AppointmentEventFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['appointment_id', 'actor_type', 'actor_id', 'from_status', 'to_status', 'reason', 'created_at'])]
class AppointmentEvent extends Model
{
    /** @use HasFactory<AppointmentEventFactory> */
    use HasFactory, HasUuids;

    public $timestamps = false;

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    protected function casts(): array
    {
        return ['created_at' => 'immutable_datetime'];
    }
}
