<?php

namespace App\Models;

use Database\Factories\OutboxMessageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['kind', 'aggregate_id', 'recipient_id', 'delivery_key', 'payload', 'available_at', 'delivered_at', 'expires_at'])]
#[Hidden(['payload'])]
class OutboxMessage extends Model
{
    /** @use HasFactory<OutboxMessageFactory> */
    use HasFactory, HasUuids;

    protected function casts(): array
    {
        return [
            'payload' => 'encrypted:array',
            'attempts' => 'integer',
            'available_at' => 'immutable_datetime',
            'claimed_at' => 'immutable_datetime',
            'delivered_at' => 'immutable_datetime',
            'broadcasted_at' => 'immutable_datetime',
            'expires_at' => 'immutable_datetime',
        ];
    }
}
