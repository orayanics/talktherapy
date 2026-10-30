<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['attempt_id', 'revision', 'reviewer_id', 'status', 'annotations', 'metrics'])]
class SlpReview extends Model
{
    use HasUuids;

    protected function casts(): array
    {
        return ['annotations' => 'array', 'metrics' => 'array', 'revision' => 'integer'];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(SlpAttempt::class);
    }
}
