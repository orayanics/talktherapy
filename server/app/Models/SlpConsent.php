<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['subject_id', 'actor_id', 'purpose', 'policy_version', 'accepted_at', 'withdrawn_at'])]
class SlpConsent extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['accepted_at' => 'immutable_datetime', 'withdrawn_at' => 'immutable_datetime'];
    }
}
