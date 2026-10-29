<?php

namespace App\Models;

use Database\Factories\SlotFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['schedule_id', 'clinician_id', 'start_at', 'end_at', 'status', 'is_hidden'])]
class Slot extends Model
{
    /** @use HasFactory<SlotFactory> */
    use HasFactory, HasUuids;

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    public function clinician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clinician_id');
    }

    protected function casts(): array
    {
        return [
            'start_at' => 'immutable_datetime',
            'end_at' => 'immutable_datetime',
            'is_hidden' => 'boolean',
        ];
    }
}
