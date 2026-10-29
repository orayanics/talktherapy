<?php

namespace App\Models;

use Database\Factories\ConsentEvidenceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'purpose', 'policy_version', 'accepted_at'])]
class ConsentEvidence extends Model
{
    /** @use HasFactory<ConsentEvidenceFactory> */
    use HasFactory, HasUuids;

    public const UPDATED_AT = null;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return ['accepted_at' => 'immutable_datetime'];
    }
}
